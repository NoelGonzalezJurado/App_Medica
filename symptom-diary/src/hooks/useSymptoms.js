import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { SymptomSchema } from '../lib/validation';

// --- Mapeo entre frontend y base de datos ---

/** Convierte un objeto de la BD (snake_case) al formato del frontend (camelCase) */
function dbToFrontend(row) {
  return {
    id: row.id,
    name: row.name,
    intensity: row.intensity,
    date: row.date,
    bodyArea: row.body_area,
    triggers: row.triggers ?? [],
    notes: row.notes ?? '',
    createdAt: row.created_at,
  };
}

/** Convierte un objeto del frontend (camelCase) al formato de la BD (snake_case) */
function frontendToDb(entry, userId) {
  return {
    id: entry.id,
    user_id: userId,
    name: entry.name,
    intensity: entry.intensity,
    date: entry.date,
    body_area: entry.bodyArea ?? null,
    triggers: entry.triggers ?? [],
    notes: entry.notes ?? '',
    created_at: entry.createdAt,
  };
}

// --- Hook principal ---

export function useSymptoms(userId) {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga inicial desde Supabase
  useEffect(() => {
    if (!userId) {
      setSymptoms([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setSymptoms((data ?? []).map(dbToFrontend));
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId]);

  // INSERT un síntoma
  const addSymptom = useCallback(async (symptom) => {
    if (!userId) return null;

    // Validación Zod antes del INSERT
    const parsed = SymptomSchema.safeParse(symptom);
    if (!parsed.success) {
      setError('Datos del síntoma no válidos');
      return null;
    }

    const entry = {
      ...parsed.data,
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('symptoms')
      .insert(frontendToDb(entry, userId));

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    setSymptoms(prev => [entry, ...prev]);
    return entry;
  }, [userId]);

  // DELETE un síntoma por id
  const deleteSymptom = useCallback(async (id) => {
    if (!userId) return;

    const { error: deleteError } = await supabase
      .from('symptoms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSymptoms(prev => prev.filter(s => s.id !== id));
  }, [userId]);

  // DELETE todos los síntomas del usuario
  const clearAll = useCallback(async () => {
    if (!userId) return;

    const { error: deleteError } = await supabase
      .from('symptoms')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSymptoms([]);
  }, [userId]);

  // Exportar como JSON (opera sobre el array en memoria, sin red)
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(symptoms, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diario_sintomas_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [symptoms]);

  // Importar desde JSON — limpia y re-inserta en Supabase
  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      if (!userId) {
        reject(new Error('Usuario no autenticado'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('Formato inválido');

          // Borrar registros existentes
          const { error: deleteError } = await supabase
            .from('symptoms')
            .delete()
            .eq('user_id', userId);

          if (deleteError) throw new Error(deleteError.message);

          if (data.length === 0) {
            setSymptoms([]);
            resolve(0);
            return;
          }

          // Insertar los nuevos registros en lote
          const rows = data.map(entry => frontendToDb(
            {
              ...entry,
              id: entry.id ?? (crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString() + Math.random().toString(36).slice(2)),
              createdAt: entry.createdAt ?? new Date().toISOString(),
            },
            userId
          ));

          const { error: insertError } = await supabase
            .from('symptoms')
            .insert(rows);

          if (insertError) throw new Error(insertError.message);

          setSymptoms(data.map(entry => ({
            ...entry,
            bodyArea: entry.bodyArea ?? entry.body_area ?? null,
            triggers: entry.triggers ?? [],
            notes: entry.notes ?? '',
          })));

          resolve(data.length);
        } catch (err) {
          setError(err.message);
          reject(new Error(err.message || 'El archivo no es válido'));
        }
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsText(file);
    });
  }, [userId]);

  // Agrupación por tipo de síntoma (derivada, sin red)
  const symptomsByType = useMemo(() =>
    symptoms.reduce((acc, s) => {
      if (!acc[s.name]) acc[s.name] = [];
      acc[s.name].push(s);
      return acc;
    }, {}),
    [symptoms]
  );

  return { symptoms, addSymptom, deleteSymptom, clearAll, symptomsByType, exportData, importData, loading, error };
}
