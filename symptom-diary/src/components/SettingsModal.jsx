import { useState, useRef } from 'react';
import { X, Key, Eye, EyeOff, Trash2, AlertCircle, CheckCircle2, Download, Upload, Loader2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, onSave, onClear, onClearData, onExportData, onImportData }) {
  const [input, setInput] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileRef = useRef(null);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(input.trim());
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (err) {
      setSaveError(err.message ?? 'No se pudo guardar la clave. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await onImportData(file);
      setImportStatus({ ok: true, msg: `${count} registros importados` });
    } catch (err) {
      setImportStatus({ ok: false, msg: err.message });
    }
    e.target.value = '';
    setTimeout(() => setImportStatus(null), 3000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">Ajustes</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-teal-600" />
            <p className="text-sm font-semibold text-gray-700">API Key de Anthropic</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Necesaria para el análisis de patrones con IA. Se cifra con AES-256 y se guarda de forma segura en tu cuenta.
          </p>
          <div className="relative mb-3">
            <input
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="input-field pr-11 font-mono text-sm"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {saveError && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700">{saveError}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !input.trim()}
              className={`btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1.5 disabled:opacity-40 ${
                saved ? 'bg-emerald-500 hover:bg-emerald-500' : ''
              }`}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Guardada</>
              ) : (
                'Guardar clave'
              )}
            </button>
            {apiKey && (
              <button
                onClick={async () => { await onClear(); setInput(''); }}
                className="btn-secondary text-sm py-2 px-3"
              >
                Eliminar
              </button>
            )}
          </div>
          {apiKey && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> API key configurada
            </p>
          )}
        </div>

        {/* Backup */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Copia de seguridad</p>
          <div className="flex gap-2">
            <button
              onClick={onExportData}
              className="flex-1 flex items-center justify-center gap-2 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl px-3 py-2.5 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 text-sm text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl px-3 py-2.5 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Importar JSON
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          {importStatus && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${importStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
              {importStatus.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {importStatus.msg}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Zona de peligro</p>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-2 text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl px-4 py-2.5 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Borrar todos los síntomas
            </button>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium">
                  ¿Eliminar TODOS los síntomas? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => { await onClearData(); setConfirmDelete(false); onClose(); }}
                  className="flex-1 text-sm bg-rose-600 text-white rounded-xl py-2 hover:bg-rose-700 font-semibold transition-colors"
                >
                  Sí, eliminar todo
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
