import { useEffect, useRef } from 'react';
import { DetectedNote } from '../hooks/usePitchDetection';
import { getScaleNotes, NOTE_NAMES } from '../utils/musicTheory';

interface NoteDisplayProps {
  notes: DetectedNote[];
  currentNote: DetectedNote | null;
  selectedKey: string;
  noteSize: number;
  isListening: boolean;
  analyserNode: AnalyserNode | null;
}

export default function NoteDisplay({
  notes,
  currentNote,
  selectedKey,
  noteSize,
  isListening,
  analyserNode,
}: NoteDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const scaleNotes = getScaleNotes(selectedKey);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [notes]);

  // Waveform visualization
  useEffect(() => {
    if (!isListening || !analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteTimeDomainData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = 'rgba(3, 7, 18, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#8b5cf6';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    // Resize canvas
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 80;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyserNode, isListening]);

  // Note size multiplier based on duration setting
  const getNoteWidth = (note: DetectedNote) => {
    const baseWidth = 60;
    const durationMultiplier = Math.max(note.duration, 0.1);
    return Math.min(baseWidth * durationMultiplier * noteSize, 300);
  };

  // Get note symbol based on size
  const getNoteSymbol = (size: number): string => {
    if (size <= 0.25) return '𝅘𝅥𝅯';
    if (size <= 0.5) return '♪';
    if (size <= 1) return '♩';
    if (size <= 2) return '𝅗𝅥';
    return '𝅝';
  };

  if (!isListening && notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-7xl mb-6 animate-bounce">🎵</div>
          <h2 className="text-2xl text-gray-300 mb-3 font-semibold">Определение нот в реальном времени</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Нажмите кнопку "Старт" и начните играть на музыкальном инструменте. 
            Приложение определит высоту звука и отобразит ноты.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="px-4 py-2 bg-gray-800/80 rounded-full text-gray-300 text-sm border border-gray-700">
              🎸 Гитара
            </span>
            <span className="px-4 py-2 bg-gray-800/80 rounded-full text-gray-300 text-sm border border-gray-700">
              🎹 Пианино
            </span>
            <span className="px-4 py-2 bg-gray-800/80 rounded-full text-gray-300 text-sm border border-gray-700">
              🎤 Вокал
            </span>
            <span className="px-4 py-2 bg-gray-800/80 rounded-full text-gray-300 text-sm border border-gray-700">
              🎷 Духовые
            </span>
            <span className="px-4 py-2 bg-gray-800/80 rounded-full text-gray-300 text-sm border border-gray-700">
              🎻 Скрипка
            </span>
          </div>
          <div className="mt-8 text-gray-600 text-xs">
            Используйте наушники для лучшего результата • Поддерживаются монофонические сигналы
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Waveform Visualization */}
      {isListening && (
        <div className="px-4 pt-3">
          <canvas
            ref={canvasRef}
            className="w-full h-[80px] rounded-lg bg-gray-900/50 border border-gray-800"
          />
        </div>
      )}

      {/* Current Note Display */}
      <div className="p-6 flex items-center justify-center min-h-[180px]">
        {currentNote ? (
          <div className="text-center animate-fade-in">
            <div
              className="text-7xl md:text-8xl font-bold mb-2 transition-all duration-200"
              style={{ color: currentNote.color }}
            >
              {currentNote.noteName}
            </div>
            <div className="text-gray-400 text-sm md:text-base">
              <span className="text-gray-500">{currentNote.frequency.toFixed(1)} Hz</span>
              <span className="mx-2">•</span>
              <span>MIDI {currentNote.midi}</span>
              <span className="mx-2">•</span>
              <span>Октава {currentNote.octave}</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-4xl" style={{ color: currentNote.color }}>
                {getNoteSymbol(noteSize)}
              </span>
              {currentNote.inScale ? (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  ✓ В тональности
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  ⚠ Вне тональности
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-5xl text-gray-600 animate-pulse">♪</div>
            <p className="text-gray-500 mt-3 text-sm">Играйте на инструменте...</p>
          </div>
        )}
      </div>

      {/* Piano Roll / Note Timeline */}
      <div className="border-t border-gray-700 bg-gray-800/30 flex-shrink-0">
        {/* Piano keyboard reference */}
        <div className="flex items-center px-4 py-2 border-b border-gray-700/50">
          <span className="text-gray-400 text-xs mr-4 whitespace-nowrap">Последовательность:</span>
          <div className="flex gap-0.5 overflow-x-auto">
            {NOTE_NAMES.map((note, i) => (
              <div
                key={note}
                className={`w-7 h-5 flex-shrink-0 text-center text-[9px] leading-5 rounded-sm font-medium ${
                  scaleNotes.includes(i)
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                    : 'bg-gray-700/50 text-gray-500 border border-gray-700'
                }`}
              >
                {note}
              </div>
            ))}
          </div>
        </div>

        {/* Notes timeline */}
        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden p-4"
          style={{ minHeight: '160px', maxHeight: '200px' }}
        >
          {notes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 text-sm">Ожидание нот...</p>
            </div>
          ) : (
            <div className="flex items-end gap-1 min-w-max h-full">
              {notes.map((note, index) => {
                const noteHeight = Math.max(40, (note.octave) * 15 + 30);
                const width = getNoteWidth(note);
                const isLast = index === notes.length - 1;

                return (
                  <div
                    key={note.id}
                    className={`flex flex-col items-center justify-end transition-all duration-200 ${
                      isLast ? 'scale-105' : ''
                    }`}
                    style={{ minWidth: `${width}px` }}
                  >
                    {/* Note block */}
                    <div
                      className={`rounded-lg flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                        isLast ? 'ring-2 ring-white/20 shadow-lg' : ''
                      }`}
                      style={{
                        backgroundColor: note.color + '30',
                        borderLeft: `3px solid ${note.color}`,
                        height: `${Math.min(noteHeight, 130)}px`,
                        width: `${width - 4}px`,
                      }}
                    >
                      <span
                        className="text-base font-bold"
                        style={{ color: note.color }}
                      >
                        {note.noteLetter}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        {note.octave}
                      </span>
                      {!note.inScale && (
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                      )}
                    </div>

                    {/* Duration indicator */}
                    <div className="mt-1 text-[8px] text-gray-600">
                      {note.duration.toFixed(2)}s
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Note List (compact melody view) */}
      <div className="border-t border-gray-700/50 bg-gray-900/50 p-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-500 text-xs mr-2 whitespace-nowrap">Мелодия:</span>
          {notes.length === 0 ? (
            <span className="text-gray-600 text-xs">—</span>
          ) : (
            notes.slice(-40).map((note) => (
              <span
                key={note.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium transition-all"
                style={{
                  backgroundColor: note.color + '15',
                  color: note.color,
                  border: `1px solid ${note.color}30`,
                }}
              >
                {note.noteName}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
