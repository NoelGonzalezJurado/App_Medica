import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, CheckCircle2 } from 'lucide-react';

const SYMPTOMS = [
  { name: 'Dolor de cabeza', cat: 'Neurológico' },
  { name: 'Migraña', cat: 'Neurológico' },
  { name: 'Mareos / Vértigo', cat: 'Neurológico' },
  { name: 'Fatiga / Cansancio', cat: 'General' },
  { name: 'Fiebre', cat: 'General' },
  { name: 'Escalofríos', cat: 'General' },
  { name: 'Náuseas', cat: 'Digestivo' },
  { name: 'Vómitos', cat: 'Digestivo' },
  { name: 'Dolor abdominal', cat: 'Digestivo' },
  { name: 'Diarrea', cat: 'Digestivo' },
  { name: 'Estreñimiento', cat: 'Digestivo' },
  { name: 'Acidez / Reflujo', cat: 'Digestivo' },
  { name: 'Dolor de pecho', cat: 'Cardíaco' },
  { name: 'Palpitaciones', cat: 'Cardíaco' },
  { name: 'Falta de aire', cat: 'Respiratorio' },
  { name: 'Tos', cat: 'Respiratorio' },
  { name: 'Congestión nasal', cat: 'Respiratorio' },
  { name: 'Dolor de garganta', cat: 'Respiratorio' },
  { name: 'Dolor de espalda', cat: 'Musculoesquelético' },
  { name: 'Dolor muscular', cat: 'Musculoesquelético' },
  { name: 'Dolor articular', cat: 'Musculoesquelético' },
  { name: 'Ansiedad', cat: 'Mental' },
  { name: 'Insomnio', cat: 'Mental' },
  { name: 'Erupción cutánea', cat: 'Dermatológico' },
  { name: 'Otro (personalizado)', cat: 'Otro' },
];

const BODY_AREAS = ['Cabeza', 'Cuello', 'Pecho', 'Abdomen', 'Espalda', 'Brazos', 'Piernas', 'General'];

const TRIGGERS = [
  'Al despertar', 'Tras comer', 'Con estrés', 'Ejercicio',
  'Falta de sueño', 'Alcohol / Café', 'Cambio de tiempo', 'Sin motivo aparente',
];

function intensityStyle(v) {
  if (v <= 3) return { label: 'Leve', color: '#059669', track: '#10b981' };
  if (v <= 6) return { label: 'Moderado', color: '#d97706', track: '#f59e0b' };
  return { label: 'Severo', color: '#e11d48', track: '#f43f5e' };
}

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const EMPTY = { name: '', customName: '', intensity: 5, date: nowLocal(), bodyArea: '', notes: '', triggers: [] };

export default function SymptomForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [done, setDone] = useState(false);
  const dropRef = useRef(null);

  const iStyle = intensityStyle(form.intensity);
  const displayName = form.name === 'Otro (personalizado)' ? form.customName : form.name;
  const filteredSymptoms = SYMPTOMS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.cat.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleTrigger(t) {
    setForm(f => ({
      ...f,
      triggers: f.triggers.includes(t) ? f.triggers.filter(x => x !== t) : [...f.triggers, t],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!displayName.trim()) return;
    const result = await onSubmit({ name: displayName.trim(), intensity: form.intensity, date: form.date, bodyArea: form.bodyArea, notes: form.notes, triggers: form.triggers });
    if (result === null) return;
    setForm({ ...EMPTY, date: nowLocal() });
    setSearch('');
    setDone(true);
    setTimeout(() => setDone(false), 2200);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Nuevo registro</h2>

        {/* Symptom picker */}
        <div className="mb-4" ref={dropRef}>
          <label className="label">Síntoma *</label>
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={`input-field flex items-center justify-between text-left transition-all ${!form.name ? 'text-gray-400' : 'text-gray-800 font-medium'}`}
          >
            <span>{form.name || 'Seleccionar síntoma…'}</span>
            <ChevronDown
              className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <div className="absolute z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden flex flex-col"
              style={{ width: 'calc(100% - 40px)', maxWidth: '540px' }}
            >
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Buscar síntoma…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto">
                {filteredSymptoms.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => { set('name', s.name); setOpen(false); setSearch(''); }}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-teal-50 transition-colors group ${
                      form.name === s.name ? 'bg-teal-50' : ''
                    }`}
                  >
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <span className="text-xs text-gray-300 group-hover:text-teal-500 transition-colors">{s.cat}</span>
                  </button>
                ))}
                {filteredSymptoms.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Sin resultados</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom name */}
        {form.name === 'Otro (personalizado)' && (
          <div className="mb-4">
            <label className="label">Describe el síntoma *</label>
            <input
              type="text"
              value={form.customName}
              onChange={e => set('customName', e.target.value)}
              placeholder="Ej: Dolor punzante en costado derecho…"
              className="input-field"
              autoFocus
            />
          </div>
        )}

        {/* Intensity */}
        <div className="mb-4">
          <label className="label">
            Intensidad —{' '}
            <span style={{ color: iStyle.color }} className="font-bold">
              {form.intensity}/10 · {iStyle.label}
            </span>
          </label>

          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => set('intensity', n)}
                className={`flex-1 h-8 rounded-lg text-xs font-bold transition-all duration-150 ${
                  n <= form.intensity
                    ? n <= 3
                      ? 'bg-emerald-400 text-white shadow-sm'
                      : n <= 6
                      ? 'bg-amber-400 text-white shadow-sm'
                      : 'bg-rose-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={form.intensity}
            onChange={e => set('intensity', Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, ${iStyle.track} ${(form.intensity - 1) / 9 * 100}%, #e2e8f0 ${(form.intensity - 1) / 9 * 100}%)`,
            }}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-300 mt-1">
            <span>1 · Leve</span>
            <span>5 · Moderado</span>
            <span>10 · Severo</span>
          </div>
        </div>

        {/* Date + Area */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label">Fecha y hora *</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>
          <div>
            <label className="label">Zona del cuerpo</label>
            <select
              value={form.bodyArea}
              onChange={e => set('bodyArea', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">No especificada</option>
              {BODY_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Triggers */}
        <div className="mb-4">
          <label className="label">Posibles desencadenantes</label>
          <div className="flex flex-wrap gap-1.5">
            {TRIGGERS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTrigger(t)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all font-medium ${
                  form.triggers.includes(t)
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="label">Notas (opcional)</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="¿Qué estabas haciendo? ¿Comiste algo diferente? ¿Horario inusual?"
            rows={2}
            className="input-field resize-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!displayName.trim()}
          className={`btn-primary w-full flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            done ? '!bg-emerald-500 hover:!bg-emerald-500' : ''
          }`}
        >
          {done ? (
            <><CheckCircle2 className="w-4 h-4" /> ¡Registrado!</>
          ) : (
            <><Plus className="w-4 h-4" /> Guardar síntoma</>
          )}
        </button>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
        <p className="text-xs text-teal-700">
          <strong>Consejo:</strong> Registra síntomas regularmente para que la IA pueda detectar patrones útiles para tu médico.
        </p>
      </div>
    </form>
  );
}
