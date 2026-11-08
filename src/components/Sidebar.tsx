import { Music, Piano, Clock, BarChart2, Layers, Volume2 } from 'lucide-react';

interface SidebarProps {
  volume: number;
  isListening: boolean;
  noteCount: number;
}

export default function Sidebar({ volume, isListening, noteCount }: SidebarProps) {
  const volumePercent = Math.min(volume * 500, 100);

  return (
    <div className="w-16 lg:w-56 bg-gray-900 border-r border-gray-700 flex flex-col items-center lg:items-stretch py-4 gap-2">
      {/* Navigation Items */}
      <div className="flex flex-col gap-1 px-2">
        <SidebarItem icon={<Music size={20} />} label="Ноты" active />
        <SidebarItem icon={<Piano size={20} />} label="Пианино" disabled />
        <SidebarItem icon={<BarChart2 size={20} />} label="Анализ" disabled />
        <SidebarItem icon={<Clock size={20} />} label="История" disabled />
        <SidebarItem icon={<Layers size={20} />} label="Слои" disabled />
      </div>

      {/* Volume Meter */}
      <div className="mt-6 px-3 lg:px-4">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 size={16} className="text-gray-400" />
          <span className="text-gray-400 text-xs hidden lg:block">Громкость</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${volumePercent}%`,
              background: `linear-gradient(90deg, #22c55e ${volumePercent < 60 ? '100' : '60'}%, #eab308 ${volumePercent < 80 ? '100' : '80'}%, #ef4444 100%)`,
            }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 px-3 lg:px-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-gray-400 text-xs hidden lg:block">
            {isListening ? 'Слушаю...' : 'Не активно'}
          </span>
        </div>
      </div>

      {/* Note Count */}
      <div className="mt-4 px-3 lg:px-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{noteCount}</div>
          <div className="text-gray-400 text-xs hidden lg:block">Нот сыграно</div>
        </div>
      </div>

      {/* Future Features Placeholder */}
      <div className="mt-auto px-3 lg:px-4 pb-4">
        <div className="border border-dashed border-gray-600 rounded-lg p-3 text-center">
          <span className="text-gray-500 text-xs hidden lg:block">Скоро: новые функции</span>
          <span className="text-gray-500 text-xs lg:hidden">+</span>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}

function SidebarItem({ icon, label, active, disabled }: SidebarItemProps) {
  return (
    <button
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all w-full ${
        active
          ? 'bg-purple-500/20 text-purple-400'
          : disabled
          ? 'text-gray-600 cursor-not-allowed'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      {icon}
      <span className="hidden lg:block text-sm">{label}</span>
    </button>
  );
}
