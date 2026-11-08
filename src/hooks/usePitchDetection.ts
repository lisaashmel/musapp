import { useState, useRef, useCallback, useEffect } from 'react';
import { autoCorrelate, isValidFrequency, smoothFrequency } from '../utils/pitchDetection';
import { frequencyToMidi, midiToNoteName, midiToNoteLetter, midiToOctave, getNoteColor, getScaleNotes, isNoteInScale } from '../utils/musicTheory';

export interface DetectedNote {
  id: string;
  frequency: number;
  midi: number;
  noteName: string;
  noteLetter: string;
  octave: number;
  color: string;
  timestamp: number;
  duration: number;
  inScale: boolean;
}

export interface UsePitchDetectionReturn {
  isListening: boolean;
  currentNote: DetectedNote | null;
  detectedNotes: DetectedNote[];
  volume: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearNotes: () => void;
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  noteSize: number;
  setNoteSize: (size: number) => void;
  quantizeToScale: boolean;
  setQuantizeToScale: (val: boolean) => void;
  analyserNode: AnalyserNode | null;
}

export function usePitchDetection(): UsePitchDetectionReturn {
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<DetectedNote | null>(null);
  const [detectedNotes, setDetectedNotes] = useState<DetectedNote[]>([]);
  const [volume, setVolume] = useState(0);
  const [selectedKey, setSelectedKey] = useState('C Major');
  const [noteSize, setNoteSize] = useState(1);
  const [quantizeToScale, setQuantizeToScale] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>(0);
  const previousFreqRef = useRef<number>(-1);
  const noteStartTimeRef = useRef<number>(0);
  const lastDetectedNoteRef = useRef<string>('');
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const isListeningRef = useRef(false);

  // Use refs for values that change but are needed in the animation loop
  const selectedKeyRef = useRef(selectedKey);
  const quantizeToScaleRef = useRef(quantizeToScale);

  useEffect(() => {
    selectedKeyRef.current = selectedKey;
  }, [selectedKey]);

  useEffect(() => {
    quantizeToScaleRef.current = quantizeToScale;
  }, [quantizeToScale]);

  const detectPitch = useCallback(() => {
    if (!isListeningRef.current) return;
    if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) return;

    analyserRef.current.getFloatTimeDomainData(bufferRef.current);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < bufferRef.current.length; i++) {
      sum += bufferRef.current[i] * bufferRef.current[i];
    }
    const rms = Math.sqrt(sum / bufferRef.current.length);
    setVolume(rms);

    // Detect pitch
    const frequency = autoCorrelate(bufferRef.current, audioContextRef.current.sampleRate);

    if (isValidFrequency(frequency) && rms > 0.01) {
      const smoothedFreq = smoothFrequency(frequency, previousFreqRef.current, 0.7);
      previousFreqRef.current = smoothedFreq;

      let midi = frequencyToMidi(smoothedFreq);
      const roundedMidi = Math.round(midi);

      const currentScaleNotes = getScaleNotes(selectedKeyRef.current);

      if (quantizeToScaleRef.current) {
        const noteIndex = roundedMidi % 12;
        if (!isNoteInScale(roundedMidi, currentScaleNotes)) {
          let closest = currentScaleNotes[0];
          let minDist = 12;
          for (const sn of currentScaleNotes) {
            const dist = Math.min(Math.abs(noteIndex - sn), 12 - Math.abs(noteIndex - sn));
            if (dist < minDist) {
              minDist = dist;
              closest = sn;
            }
          }
          const octave = Math.floor(roundedMidi / 12);
          midi = octave * 12 + closest;
        }
      }

      const noteName = midiToNoteName(midi);
      const noteLetter = midiToNoteLetter(midi);
      const octave = midiToOctave(midi);
      const color = getNoteColor(Math.round(midi) % 12);
      const inScale = isNoteInScale(Math.round(midi), currentScaleNotes);

      // Only register a new note if it's different from the last one
      if (noteName !== lastDetectedNoteRef.current) {
        const now = Date.now();

        // Update duration of previous note
        if (lastDetectedNoteRef.current) {
          setDetectedNotes(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                duration: (now - updated[updated.length - 1].timestamp) / 1000
              };
            }
            return updated;
          });
        }

        const newNote: DetectedNote = {
          id: `${now}-${noteName}`,
          frequency: smoothedFreq,
          midi: Math.round(midi),
          noteName,
          noteLetter,
          octave,
          color,
          timestamp: now,
          duration: 0,
          inScale,
        };

        setCurrentNote(newNote);
        setDetectedNotes(prev => [...prev, newNote]);
        lastDetectedNoteRef.current = noteName;
        noteStartTimeRef.current = now;
      }
    } else {
      previousFreqRef.current = -1;
    }

    animationFrameRef.current = requestAnimationFrame(detectPitch);
  }, []);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      bufferRef.current = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
      setIsListening(true);
      isListeningRef.current = true;
      noteStartTimeRef.current = Date.now();

      animationFrameRef.current = requestAnimationFrame(detectPitch);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Не удалось получить доступ к микрофону. Пожалуйста, разрешите доступ.');
    }
  }, [detectPitch]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    bufferRef.current = null;
    setIsListening(false);
    setCurrentNote(null);
    previousFreqRef.current = -1;
    lastDetectedNoteRef.current = '';
  }, []);

  const clearNotes = useCallback(() => {
    setDetectedNotes([]);
    setCurrentNote(null);
    lastDetectedNoteRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isListening,
    currentNote,
    detectedNotes,
    volume,
    startListening,
    stopListening,
    clearNotes,
    selectedKey,
    setSelectedKey,
    noteSize,
    setNoteSize,
    quantizeToScale,
    setQuantizeToScale,
    analyserNode: analyserRef.current,
  };
}
