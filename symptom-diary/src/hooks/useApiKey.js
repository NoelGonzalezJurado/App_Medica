import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { encryptApiKey, decryptApiKey } from '../lib/crypto';
import { ApiKeySchema } from '../lib/validation';

/**
 * useApiKey — gestiona la API key de Anthropic del usuario.
 *
 * La clave se almacena cifrada (AES-GCM) en la tabla `public.user_api_keys`
 * de Supabase. En memoria solo existe descifrada mientras el componente
 * está montado.
 *
 * @param {string|null} userId - UUID del usuario autenticado, o null
 * @returns {{
 *   apiKey: string,
 *   saveApiKey: (key: string) => Promise<void>,
 *   clearApiKey: () => Promise<void>,
 *   loading: boolean,
 * }}
 */
export function useApiKey(userId) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Carga y descifrado inicial desde Supabase
  useEffect(() => {
    if (!userId) {
      setApiKey('');
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('encrypted_key, iv')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error('[useApiKey] Error al leer la clave:', error.message);
          return;
        }

        if (!data) {
          setApiKey('');
          return;
        }

        try {
          const plaintext = await decryptApiKey(data.encrypted_key, data.iv, userId);
          if (!cancelled) setApiKey(plaintext);
        } catch (decryptErr) {
          console.error('[useApiKey] No se pudo descifrar la clave almacenada.');
          if (!cancelled) setApiKey('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  /**
   * Valida, cifra y guarda la API key en Supabase (UPSERT).
   * @param {string} key - API key en texto plano
   * @returns {Promise<void>}
   */
  const saveApiKey = useCallback(async (key) => {
    if (!userId) return;

    // Validación de formato antes de cualquier operación
    const parsed = ApiKeySchema.safeParse(key);
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0]?.message ?? 'API key no válida');
    }

    const { encryptedKey, iv } = await encryptApiKey(key, userId);

    const { error } = await supabase
      .from('user_api_keys')
      .upsert(
        { user_id: userId, encrypted_key: encryptedKey, iv },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[useApiKey] Error al guardar la clave:', error.message);
      throw new Error('No se pudo guardar la API key. Inténtalo de nuevo.');
    }

    setApiKey(key);
  }, [userId]);

  /**
   * Elimina la API key de Supabase y limpia el estado local.
   * @returns {Promise<void>}
   */
  const clearApiKey = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[useApiKey] Error al eliminar la clave:', error.message);
      throw new Error('No se pudo eliminar la API key. Inténtalo de nuevo.');
    }

    setApiKey('');
  }, [userId]);

  return { apiKey, saveApiKey, clearApiKey, loading };
}
