import { useState, useRef, useMemo } from 'react';
import { FileText, Download, User, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Cell,
} from 'recharts';
import html2canvas from 'html2canvas';
import { exportToPDF } from '../utils/exportReport';
import { buildTimeline, buildFrequency, buildAvgIntensity, intColor, PALETTE } from './Charts';

function intLabel(v) {
  if (v <= 3) return { text: 'Leve', cls: 'text-emerald-600 bg-emerald-50' };
  if (v <= 6) return { text: 'Moderado', cls: 'text-amber-600 bg-amber-50' };
  return { text: 'Severo', cls: 'text-rose-600 bg-rose-50' };
}

export default function MedicalReport({ symptoms, analysis }) {
  const [name, setName] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const tlRef = useRef(null);
  const freqRef = useRef(null);
  const avgRef = useRef(null);

  const timeline = useMemo(() => buildTimeline(symptoms), [symptoms]);
  const frequency = useMemo(() => buildFrequency(symptoms), [symptoms]);
  const avgInt = useMemo(() => buildAvgIntensity(symptoms), [symptoms]);

  async function handleExport() {
    if (!symptoms.length) return;
    setExporting(true);
    try {
      const opts = { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true };
      const chartImages = {};
      if (tlRef.current) {
        chartImages.timeline = (await html2canvas(tlRef.current, opts)).toDataURL('image/png');
      }
      if (freqRef.current) {
        chartImages.frequency = (await html2canvas(freqRef.current, opts)).toDataURL('image/png');
      }
      if (avgRef.current) {
        chartImages.avgInt = (await html2canvas(avgRef.current, opts)).toDataURL('image/png');
      }
      await exportToPDF(symptoms, analysis, name.trim() || 'Paciente', chartImages);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  }

  const unique = [...new Set(symptoms.map(s => s.name))];
  const avg = symptoms.length
    ? (symptoms.reduce((a, s) => a + s.intensity, 0) / symptoms.length).toFixed(1)
    : 0;
  const dates = symptoms.map(s => new Date(s.date));
  const minDate = dates.length ? new Date(Math.min(...dates)) : null;
  const maxDate = dates.length ? new Date(Math.max(...dates)) : null;
  const recent = [...symptoms].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const freqH = Math.max(180, frequency.length * 34);
  const avgH = Math.max(180, avgInt.length * 34);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-gradient-to-br from-sky-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Informe para el médico</h2>
            <p className="text-xs text-gray-400 mt-0.5">Exporta tu historial completo en PDF</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="label">Nombre del paciente</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tu nombre completo…"
              className="input-field pl-9"
            />
          </div>
        </div>

        {!analysis && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
            <span>
              Puedes <strong>ejecutar primero el análisis de IA</strong> (pestaña IA) para incluirlo en el PDF.
            </span>
          </div>
        )}

        {analysis && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>El análisis de IA se incluirá en el PDF.</span>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={!symptoms.length || exporting}
          className={`btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
            exported ? '!bg-emerald-500 hover:!bg-emerald-500' : ''
          }`}
        >
          {exporting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generando PDF…</>
          ) : exported ? (
            <><CheckCircle2 className="w-4 h-4" /> ¡PDF descargado!</>
          ) : (
            <><Download className="w-4 h-4" /> Exportar PDF</>
          )}
        </button>
      </div>

      {symptoms.length > 0 && (
        <>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del período</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-teal-50 rounded-xl p-3">
                <p className="text-xs text-teal-600 font-medium mb-0.5">Total registros</p>
                <p className="text-2xl font-bold text-teal-700">{symptoms.length}</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-3">
                <p className="text-xs text-sky-600 font-medium mb-0.5">Intensidad media</p>
                <p className="text-2xl font-bold text-sky-700">{avg}<span className="text-sm">/10</span></p>
              </div>
            </div>

            {minDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-4">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {minDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  {' → '}
                  {maxDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}

            <p className="text-xs font-medium text-gray-500 mb-2">Síntomas registrados ({unique.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {unique.map(n => (
                <span key={n} className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Últimos registros</h3>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-xs min-w-[360px]">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-medium">
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Síntoma</th>
                    <th className="text-center py-2">Int.</th>
                    <th className="text-left py-2">Severidad</th>
                    <th className="text-left py-2">Zona</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(s => {
                    const il = intLabel(s.intensity);
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2 text-gray-500 whitespace-nowrap">
                          {new Date(s.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-2 text-gray-800 font-medium max-w-[120px] truncate">{s.name}</td>
                        <td className="py-2 text-center font-bold text-gray-700">{s.intensity}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${il.cls}`}>
                            {il.text}
                          </span>
                        </td>
                        <td className="py-2 text-gray-400">{s.bodyArea || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {symptoms.length === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay datos para el informe aún</p>
        </div>
      )}

      {/* Hidden chart containers for PDF capture */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
        {timeline.length > 1 && (
          <div ref={tlRef} style={{ width: 560, height: 210, background: '#ffffff' }}>
            <AreaChart width={560} height={210} data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="pdfAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Area type="monotone" dataKey="avg" stroke="#0d9488" strokeWidth={2} fill="url(#pdfAreaGrad)" dot={{ fill: '#0d9488', r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </div>
        )}
        {frequency.length > 0 && (
          <div ref={freqRef} style={{ width: 560, height: freqH + 20, background: '#ffffff' }}>
            <BarChart width={560} height={freqH + 20} data={frequency} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={110} tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {frequency.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </div>
        )}
        {avgInt.length > 0 && (
          <div ref={avgRef} style={{ width: 560, height: avgH + 20, background: '#ffffff' }}>
            <BarChart width={560} height={avgH + 20} data={avgInt} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={110} tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v} />
              <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                {avgInt.map((d, i) => <Cell key={i} fill={intColor(d.avg)} />)}
              </Bar>
            </BarChart>
          </div>
        )}
      </div>
    </div>
  );
}
