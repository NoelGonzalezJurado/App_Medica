import { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SymptomForm from './components/SymptomForm';
import SymptomHistory from './components/SymptomHistory';
import Charts from './components/Charts';
import AIAnalysis from './components/AIAnalysis';
import MedicalReport from './components/MedicalReport';
import SettingsModal, { useApiKey } from './components/SettingsModal';
import { useSymptoms } from './hooks/useSymptoms';

export default function App() {
  const [tab, setTab] = useState('register');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const { symptoms, addSymptom, deleteSymptom, clearAll } = useSymptoms();
  const { apiKey, saveApiKey, clearApiKey } = useApiKey();

  return (
    <div className="min-h-screen">
      <Header
        symptomCount={symptoms.length}
        onSettingsClick={() => setSettingsOpen(true)}
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
      />
    </div>
  );
}
