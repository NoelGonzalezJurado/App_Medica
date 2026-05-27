import { useState, useMemo } from 'react';
import { Trash2, Search, ClipboardList, Filter } from 'lucide-react';

function intBg(v) {
  if (v <= 3) return 'bg-emerald-100 text-emerald-700';
  if (v <= 6) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}

function groupByDay(list) {
  const groups = {};
  list.forEach(s => {
    const key = new Date(s.date).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });
  return groups;
}

const SEVERITY_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'mild', label: 'Leve' },
  { id: 'moderate', label: 'Moderado' },
  { id: 'severe', label: 'Severo' },
];

export default function SymptomHistory({ symptoms, onDelete }) {
  const [query, setQuery] = useState('');
  const [severity, setSeverity] = useState('all');

  const filtered = useMemo(() => {
    return symptoms
      .filter(s => {
        const q = query.toLowerCase();
        const matchQ = !q || s.name.toLowerCase().includes(q) || (s.notes || '').toLowerCase().includes(q);
        const matchS =
          severity === 'all' ||
          (severity === 'mild' && s.intensity <= 3) ||
          (severity === 'moderate' && s.intensity > 3 && s.intensity <= 6) ||
          (severity === 'severe' && s.intensity > 6);
        return matchQ && matchS;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [symptoms, query, severity]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  if (symptoms.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-14 text-center">
        <ClipboardList className="w-12 h-12 text-gray-200 mb-3" />
        <p className="font-semibold text-gray-500">No hay síntomas registrados</p>
        <p className="text-sm text-gray-400 mt-1">Usa la pestaña "Registrar" para empezar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar síntoma o nota…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          <Filter className="w-4 h-4 text-gray-300 flex-shrink-0 self-center" />
          {SEVERITY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setSeverity(f.id)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                severity === f.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-8 text-gray-400 text-sm">Sin resultados para esa búsqueda</div>
      ) : (
        Object.entries(grouped).map(([day, entries]) => (
          <div key={day} className="card">
            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider mb-3 capitalize">{day}</p>
            <div className="space-y-2">
              {entries.map(s => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 hover:bg-teal-50/40 transition-colors group"
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold ${intBg(s.intensity)}`}>
                    <span className="text-lg leading-none">{s.intensity}</span>
                    <span className="text-[9px] opacity-60">/10</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{s.name}</p>
                        {s.bodyArea && (
                          <span className="inline-block mt-0.5 text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md">
                            {s.bodyArea}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-gray-400">
                          {new Date(s.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => onDelete(s.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-500 transition-all"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {s.triggers?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.triggers.map(t => (
                          <span key={t} className="text-[10px] bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic line-clamp-2">"{s.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
