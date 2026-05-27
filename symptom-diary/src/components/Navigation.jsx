import { PlusCircle, Clock, BarChart2, Brain, FileText } from 'lucide-react';

const TABS = [
  { id: 'register', label: 'Registrar', Icon: PlusCircle },
  { id: 'history', label: 'Historial', Icon: Clock },
  { id: 'charts', label: 'Gráficas', Icon: BarChart2 },
  { id: 'ai', label: 'IA', Icon: Brain },
  { id: 'report', label: 'Informe', Icon: FileText },
];

export default function Navigation({ active, onChange }) {
  return (
    <nav className="sticky top-[57px] z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-2xl mx-auto flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-all border-b-2 ${
                isActive
                  ? 'text-teal-600 border-teal-500'
                  : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200'
              }`}
            >
              <Icon style={{ width: 17, height: 17 }} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
