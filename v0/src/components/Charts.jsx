import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

const PALETTE = ['#0d9488', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e', '#10b981', '#6366f1', '#ec4899'];

function intColor(v) {
  if (v <= 3) return '#10b981';
  if (v <= 6) return '#f59e0b';
  return '#f43f5e';
}

function buildTimeline(symptoms) {
  const map = {};
  [...symptoms]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(s => {
      const key = new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      if (!map[key]) map[key] = { date: key, total: 0, count: 0 };
      map[key].total += s.intensity;
      map[key].count += 1;
    });
  return Object.values(map)
    .map(d => ({ date: d.date, avg: parseFloat((d.total / d.count).toFixed(1)), registros: d.count }))
    .slice(-21);
}

function buildFrequency(symptoms) {
  const freq = {};
  symptoms.forEach(s => { freq[s.name] = (freq[s.name] || 0) + 1; });
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function buildAvgIntensity(symptoms) {
  const map = {};
  symptoms.forEach(s => {
    if (!map[s.name]) map[s.name] = { name: s.name, total: 0, count: 0 };
    map[s.name].total += s.intensity;
    map[s.name].count += 1;
  });
  return Object.values(map)
    .map(d => ({ name: d.name, avg: parseFloat((d.total / d.count).toFixed(1)) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color }}>
          {e.name}: <strong>{e.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Charts({ symptoms }) {
  const timeline = useMemo(() => buildTimeline(symptoms), [symptoms]);
  const frequency = useMemo(() => buildFrequency(symptoms), [symptoms]);
  const avgInt = useMemo(() => buildAvgIntensity(symptoms), [symptoms]);

  const stats = useMemo(() => {
    if (!symptoms.length) return {};
    const avg = (symptoms.reduce((s, x) => s + x.intensity, 0) / symptoms.length).toFixed(1);
    const unique = new Set(symptoms.map(s => s.name)).size;
    const max = Math.max(...symptoms.map(s => s.intensity));
    return { avg, unique, max, total: symptoms.length };
  }, [symptoms]);

  if (symptoms.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-14 text-center">
        <BarChart2 className="w-12 h-12 text-gray-200 mb-3" />
        <p className="font-semibold text-gray-500">Sin datos para mostrar</p>
        <p className="text-sm text-gray-400 mt-1">Registra al menos un síntoma</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Registros', value: stats.total, color: 'text-teal-600' },
          { label: 'Int. media', value: stats.avg, color: stats.avg <= 3 ? 'text-emerald-600' : stats.avg <= 6 ? 'text-amber-500' : 'text-rose-600' },
          { label: 'Máxima', value: stats.max, color: 'text-rose-500' },
          { label: 'Síntomas', value: stats.unique, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {timeline.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            Intensidad media por día
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={timeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<Tip />} />
              <Area
                type="monotone"
                dataKey="avg"
                name="Intensidad"
                stroke="#0d9488"
                strokeWidth={2.5}
                fill="url(#grad)"
                dot={{ fill: '#0d9488', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Frequency horizontal bar */}
      {frequency.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            Frecuencia de síntomas
          </h3>
          <ResponsiveContainer width="100%" height={Math.max(180, frequency.length * 34)}>
            <BarChart data={frequency} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={110}
                tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v}
              />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Veces" radius={[0, 6, 6, 0]}>
                {frequency.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Avg intensity by symptom */}
      {avgInt.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            Intensidad media por síntoma
          </h3>
          <ResponsiveContainer width="100%" height={Math.max(180, avgInt.length * 34)}>
            <BarChart data={avgInt} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: '#64748b' }}
                width={110}
                tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v}
              />
              <Tooltip content={<Tip />} />
              <Bar dataKey="avg" name="Intensidad media" radius={[0, 6, 6, 0]}>
                {avgInt.map((d, i) => (
                  <Cell key={i} fill={intColor(d.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
