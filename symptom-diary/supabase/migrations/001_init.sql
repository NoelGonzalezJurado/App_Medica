-- ============================================================
-- 001_init.sql — Schema inicial para Symptom Diary
-- Sesión 1 del plan de migración localStorage → Supabase
-- ============================================================

-- ------------------------------------------------------------
-- TABLA: profiles
-- Sincronizada con auth.users mediante trigger.
-- Guarda id y email del usuario registrado.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id      uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer su propio perfil
CREATE POLICY "profiles: select own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- El sistema (trigger) puede insertar perfiles; el usuario puede actualizar el suyo
CREATE POLICY "profiles: insert own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ------------------------------------------------------------
-- FUNCIÓN + TRIGGER: auto-crear perfil al registrarse
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- TABLA: symptoms
-- Refleja exactamente el modelo usado por el frontend.
-- Nombres en snake_case; bodyArea → body_area, triggers → triggers (text[]).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.symptoms (
  -- Identificador único — el frontend genera UUIDs como string
  id          text        PRIMARY KEY,

  -- FK al usuario propietario
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  -- Campos del modelo del frontend (nombres preservados o mapeados)
  name        text        NOT NULL,
  intensity   smallint    NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  date        timestamptz NOT NULL,          -- ISO 8601 desde el frontend
  body_area   text,                          -- bodyArea en el frontend
  triggers    text[],                        -- string[] en el frontend
  notes       text,

  -- Metadata de auditoría
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS en symptoms
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- SELECT: solo filas propias
CREATE POLICY "symptoms: select own"
  ON public.symptoms
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: solo puede insertar con su propio user_id
CREATE POLICY "symptoms: insert own"
  ON public.symptoms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: solo puede modificar sus propias filas
CREATE POLICY "symptoms: update own"
  ON public.symptoms
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: solo puede borrar sus propias filas
CREATE POLICY "symptoms: delete own"
  ON public.symptoms
  FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------
-- Consultas de historial filtradas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_symptoms_user_date
  ON public.symptoms (user_id, date DESC);

-- Búsqueda por nombre de síntoma dentro de un usuario
CREATE INDEX IF NOT EXISTS idx_symptoms_user_name
  ON public.symptoms (user_id, name);
