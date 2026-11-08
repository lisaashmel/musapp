import { usePitchDetection } from './hooks/usePitchDetection';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import NoteDisplay from './components/NoteDisplay';

export default function App() {
  const {
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
    analyserNode,
  } = usePitchDetection();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top Bar */}
      <TopBar
        isListening={isListening}
        onStart={startListening}
        onStop={stopListening}
        onClear={clearNotes}
        selectedKey={selectedKey}
        onKeyChange={setSelectedKey}
        noteSize={noteSize}
        onNoteSizeChange={setNoteSize}
        quantizeToScale={quantizeToScale}
        onQuantizeChange={setQuantizeToScale}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          volume={volume}
          isListening={isListening}
          noteCount={detectedNotes.length}
        />

        {/* Main Area */}
        <NoteDisplay
          notes={detectedNotes}
          currentNote={currentNote}
          selectedKey={selectedKey}
          noteSize={noteSize}
          isListening={isListening}
          analyserNode={analyserNode}
        />
      </div>
    </div>
  );
}
