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

export default function AIAnalysis({ symptoms, apiKey, onAnalysis }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const canAnalyze = symptoms.length >= 3 && apiKey;

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const text = await analyzeSymptoms(symptoms, apiKey);
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
      {/* Intro card */}
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

        {/* Warnings */}
        {!apiKey && (
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

      {/* Error */}
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

      {/* Result */}
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
