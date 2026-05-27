import { Heart, Settings } from 'lucide-react';

export default function Header({ onSettingsClick, symptomCount }) {
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-gray-800 leading-none">Diario Médico</h1>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">
              {symptomCount === 0
                ? 'Sin registros aún'
                : `${symptomCount} registro${symptomCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Ajustes"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
