import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'diario_sintomas_v1';

function load() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function save(symptoms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symptoms));
  } catch {
    // localStorage unavailable
  }
}

export function useSymptoms() {
  const [symptoms, setSymptoms] = useState(load);

  const addSymptom = useCallback((symptom) => {
    const entry = {
      ...symptom,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    setSymptoms(prev => {
      const updated = [entry, ...prev];
      save(updated);
      return updated;
    });
    return entry;
  }, []);

  const deleteSymptom = useCallback((id) => {
    setSymptoms(prev => {
      const updated = prev.filter(s => s.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSymptoms([]);
    save([]);
  }, []);

  const symptomsByType = useMemo(() =>
    symptoms.reduce((acc, s) => {
      if (!acc[s.name]) acc[s.name] = [];
      acc[s.name].push(s);
      return acc;
    }, {}),
    [symptoms]
  );

  return { symptoms, addSymptom, deleteSymptom, clearAll, symptomsByType };
}
