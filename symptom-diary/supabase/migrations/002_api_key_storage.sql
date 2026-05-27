-- ============================================================
-- 002_api_key_storage.sql — Almacenamiento seguro de API keys
-- Sesión 2 del plan de migración localStorage → Supabase
-- La API key de Anthropic se cifra en cliente (AES-GCM, Web Crypto API)
-- antes de enviarse. Supabase nunca ve el valor en claro.
-- ============================================================

-- ------------------------------------------------------------
-- TABLA: user_api_keys
-- Una fila por usuario. Guarda el ciphertext y el IV necesarios
-- para que el cliente pueda descifrar la key con su contraseña.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  -- PK y FK al usuario propietario; cascade borra la key si el usuario se elimina
  user_id       uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Ciphertext AES-GCM en base64 (longitud variable según la key original)
  encrypted_key text        NOT NULL,

  -- IV de AES-GCM en base64 — 12 bytes aleatorios → ~16 caracteres base64
  -- Debe ser único por operación de cifrado; se regenera en cada UPDATE
  iv            text        NOT NULL,

  -- Timestamp de última modificación — mantenido por trigger
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- FUNCIÓN + TRIGGER: actualizar updated_at automáticamente
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_api_key_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_api_key_updated_at
  BEFORE UPDATE ON public.user_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.set_api_key_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- SELECT: cada usuario solo puede leer su propia fila
CREATE POLICY "api_keys: select own"
  ON public.user_api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: solo puede insertar su propia fila
CREATE POLICY "api_keys: insert own"
  ON public.user_api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: solo puede actualizar su propia fila
CREATE POLICY "api_keys: update own"
  ON public.user_api_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: solo puede borrar su propia fila
CREATE POLICY "api_keys: delete own"
  ON public.user_api_keys
  FOR DELETE
  USING (auth.uid() = user_id);
