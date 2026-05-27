import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SymptomForm from './components/SymptomForm';
import SymptomHistory from './components/SymptomHistory';
import Charts from './components/Charts';
import AIAnalysis from './components/AIAnalysis';
import MedicalReport from './components/MedicalReport';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { useSymptoms } from './hooks/useSymptoms';
import { useApiKey } from './hooks/useApiKey';

export default function App() {
  const { user, loading, signOut } = useAuth();

  const [tab, setTab] = useState('register');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { symptoms, addSymptom, deleteSymptom, clearAll, exportData, importData } = useSymptoms(user?.id);
  const { apiKey, saveApiKey, clearApiKey } = useApiKey(user?.id);

  // Verificando sesión inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  // Sin sesión: mostrar solo el modal de auth
  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen">
      <Header
        symptomCount={symptoms.length}
        onSettingsClick={() => setSettingsOpen(true)}
        user={user}
        onSignOut={signOut}
      />

      <Navigation active={tab} onChange={setTab} />

      <main className="max-w-2xl mx-auto px-4 py-5 pb-12">
        {tab === 'register' && (
          <SymptomForm onSubmit={addSymptom} />
        )}
        {tab === 'history' && (
          <SymptomHistory symptoms={symptoms} onDelete={deleteSymptom} />
        )}
        {tab === 'charts' && (
          <Charts symptoms={symptoms} />
        )}
        {tab === 'ai' && (
          <AIAnalysis
            symptoms={symptoms}
            apiKey={apiKey}
            onAnalysis={setAiAnalysis}
            isDemoUser={user?.email === 'diariomedico.demo@gmail.com'}
          />
        )}
        {tab === 'report' && (
          <MedicalReport symptoms={symptoms} analysis={aiAnalysis} />
        )}
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSave={saveApiKey}
        onClear={clearApiKey}
        onClearData={clearAll}
        onExportData={exportData}
        onImportData={importData}
      />
    </div>
  );
}
