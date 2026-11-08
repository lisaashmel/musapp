import { Mic, MicOff, Trash2, Settings } from 'lucide-react';
import { KEY_OPTIONS, SCALE_SIZES } from '../utils/musicTheory';

interface TopBarProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  selectedKey: string;
  onKeyChange: (key: string) => void;
  noteSize: number;
  onNoteSizeChange: (size: number) => void;
  quantizeToScale: boolean;
  onQuantizeChange: (val: boolean) => void;
}

export default function TopBar({
  isListening,
  onStart,
  onStop,
  onClear,
  selectedKey,
  onKeyChange,
  noteSize,
  onNoteSizeChange,
  quantizeToScale,
  onQuantizeChange,
}: TopBarProps) {
  return (
    <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-4 shadow-lg">
      {/* Logo / Title */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">♪</span>
        </div>
        <h1 className="text-white font-bold text-lg hidden md:block">NoteDetect</h1>
      </div>

      {/* Record Button */}
      <button
        onClick={isListening ? onStop : onStart}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        <span className="hidden sm:inline">{isListening ? 'Стоп' : 'Старт'}</span>
      </button>

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all"
        title="Очистить ноты"
      >
        <Trash2 size={18} />
        <span className="hidden sm:inline">Очистить</span>
      </button>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-600" />

      {/* Key Selection */}
      <div className="flex items-center gap-2">
        <Settings size={16} className="text-gray-400" />
        <label className="text-gray-400 text-sm hidden lg:block">Тональность:</label>
        <select
          value={selectedKey}
          onChange={(e) => onKeyChange(e.target.value)}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
        >
          {KEY_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-600 hidden md:block" />

      {/* Note Size */}
      <div className="items-center gap-2 hidden md:flex">
        <label className="text-gray-400 text-sm">Размер:</label>
        <select
          value={noteSize}
          onChange={(e) => onNoteSizeChange(Number(e.target.value))}
          className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
        >
          {SCALE_SIZES.map((size) => (
            <option key={size.value} value={size.value}>
              {size.name}
            </option>
          ))}
        </select>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-600 hidden md:block" />

      {/* Quantize Toggle */}
      <div className="items-center gap-2 hidden md:flex">
        <label className="text-gray-400 text-sm">Квантование:</label>
        <button
          onClick={() => onQuantizeChange(!quantizeToScale)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            quantizeToScale
              ? 'bg-purple-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {quantizeToScale ? 'ВКЛ' : 'ВЫКЛ'}
        </button>
      </div>
    </div>
  );
}
