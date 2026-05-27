import { useState } from 'react';
import { Brain, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { analyzeSymptoms } from '../utils/claudeApi';

function MarkdownBlock({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        if (line.startsWith('## ')) {
          const content = line.replace(/^##\s*/, '').replace(/\*\*/g, '');
          return (
            <h4 key={i} className="text-sm font-bold text-gray-800 mt-4 mb-1 first:mt-0">
              {content}
            </h4>
          );
        }

        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.replace(/^[-•]\s*/, '').replace(/\*\*/g, '');
          return (
            <li key={i} className="text-sm text-gray-600 ml-4 list-disc leading-relaxed">
              {content}
            </li>
          );
        }

        if (line.startsWith('---')) {
          return <hr key={i} className="border-gray-100 my-3" />;
        }

        const content = line.replace(/\*\*(.+?)\*\*/g, '$1');
        return (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {content}
          </p>
        );
      })}
    </div>
  );
}

const DEMO_ANALYSIS = `## 📊 Resumen General
Se han registrado 24 síntomas a lo largo de 30 días. El diario refleja dos periodos diferenciados: un episodio de alta carga de estrés durante las semanas 2 y 3 del mes, con migrañas de intensidad severa, y un proceso catarral en los últimos 10 días con congestión, fiebre y fatiga progresiva actualmente en resolución.

## 🔄 Patrones Identificados
- Dolor de cabeza recurrente: 6 episodios en 30 días, concentrados en la primera mitad del mes y en los últimos 3 días.
- Migraña de alta intensidad (8–9/10) asociada sistemáticamente a acumulación de estrés y privación de sueño los días previos.
- Episodio infeccioso claro a partir del día 21: congestión nasal → dolor de garganta → fiebre → fatiga severa → tos, con mejora gradual confirmada.
- Fatiga recurrente: 5 registros a lo largo del mes, con picos coincidentes con los episodios de migraña y el resfriado.

## 🔗 Correlaciones entre Síntomas
- Estrés + falta de sueño → migraña severa: patrón reproducido en dos ocasiones (días 6 y 15 del registro). En ambos casos la migraña aparece 1–2 días después del episodio de ansiedad/insomnio.
- Migraña intensa (día 15, 9/10) → vómitos al día siguiente: secuencia directamente anotada en las notas.
- Café/alcohol → dolor de cabeza leve (4–5/10): registrado en dos ocasiones independientes.

## 📈 Tendencias de Severidad
Los síntomas neurológicos (migraña, cefalea) mostraron pico máximo en la semana 2–3 y han bajado en la última semana. El proceso catarral tocó fondo hace 5 días (fatiga 8/10, fiebre) y está en descenso claro: fatiga actual 5/10, tos 4/10. Tendencia general: mejora.

## ⚠️ Puntos de Atención Prioritaria
- Migraña recurrente de intensidad severa (8–9/10) con fotofobia y vómitos asociados: requiere valoración neurológica para descartar migraña crónica y valorar profilaxis.
- Patrón estrés → insomnio → migraña repetido en menos de un mes: posible ciclo que se autoperpetúa.

## 💡 Recomendaciones para la Consulta
- Llevar este diario completo con las fechas de los episodios de migraña y los desencadenantes anotados.
- Preguntar al médico sobre profilaxis de migraña si los episodios severos se repiten mensualmente.
- Comentar el patrón estrés/sueño como posible factor desencadenante crónico.
- Confirmar que el proceso catarral está en resolución o si persisten síntomas que requieran revisión.

## 🌿 Observaciones de Contexto
El consumo de café aparece vinculado a dos episodios de cefalea leve. Reducir o regularizar la ingesta podría ser un ajuste sencillo. El ejercicio físico (registrado una vez) no generó síntomas graves más allá de dolor muscular esperado. Los episodios de mayor severidad coinciden con periodos de alta carga laboral según las notas.

---
⚠️ Este análisis es orientativo y no reemplaza el diagnóstico médico profesional.`;

export default function AIAnalysis({ symptoms, apiKey, onAnalysis, isDemoUser }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const canAnalyze = symptoms.length >= 3 && (apiKey || isDemoUser);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      let text;
      if (isDemoUser) {
        await new Promise(r => setTimeout(r, 2500));
        text = DEMO_ANALYSIS;
      } else {
        text = await analyzeSymptoms(symptoms, apiKey);
      }
      setResult(text);
      onAnalysis?.(text);
    } catch (err) {
      setError(err.message || 'Error al conectar con Claude');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Análisis con Inteligencia Artificial</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Claude analiza patrones en tu diario y genera un informe para llevar a tu médico
            </p>
          </div>
        </div>

        {!apiKey && !isDemoUser && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Configura tu <strong>API key de Anthropic</strong> en ⚙️ Ajustes para activar el análisis.
            </p>
          </div>
        )}

        {symptoms.length < 3 && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Necesitas al menos <strong>3 registros</strong> para el análisis. Tienes {symptoms.length}.
            </p>
          </div>
        )}

        <button
          onClick={run}
          disabled={loading || !canAnalyze}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm text-white disabled:opacity-40 disabled:cursor-not-allowed ${
            loading
              ? 'bg-violet-400'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando {symptoms.length} síntomas…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {result ? 'Volver a analizar' : `Analizar ${symptoms.length} síntomas`}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="card bg-rose-50 border border-rose-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-rose-700">Error en el análisis</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
            <button onClick={run} className="text-rose-400 hover:text-rose-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="card">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h3 className="font-semibold text-gray-800 text-sm flex-1">Análisis generado</h3>
            <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">
              Claude
            </span>
          </div>

          <MarkdownBlock text={result} />

          <div className="mt-5 pt-3 border-t border-gray-100 bg-amber-50 rounded-xl p-3 -mx-0">
            <p className="text-[11px] text-amber-700 italic">
              ⚠️ Este análisis es solo orientativo. No reemplaza el diagnóstico médico profesional. Lleva este informe a tu médico.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
