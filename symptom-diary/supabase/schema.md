# Schema de Supabase — Symptom Diary

Migración: `001_init.sql`

---

## Tablas

### `profiles`

Creada automáticamente al registrarse un usuario. Sincronizada con `auth.users` mediante trigger.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` ON DELETE CASCADE | ID del usuario |
| `email` | `text` | NOT NULL | Correo electrónico |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | Fecha de registro |

---

### `symptoms`

Tabla principal. Cada fila es un registro de síntoma de un usuario.

| Columna | Tipo | Restricciones | Equivalente en frontend |
|---|---|---|---|
| `id` | `text` | PK | `id` (string UUID generado en cliente) |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users.id` ON DELETE CASCADE | — (nuevo campo) |
| `name` | `text` | NOT NULL | `name` |
| `intensity` | `smallint` | NOT NULL, CHECK (1–10) | `intensity` |
| `date` | `timestamptz` | NOT NULL | `date` (ISO 8601) |
| `body_area` | `text` | — | `bodyArea` |
| `triggers` | `text[]` | — | `triggers` (string[]) |
| `notes` | `text` | — | `notes` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT now() | `createdAt` |

---

## Índices

| Nombre | Tabla | Columnas | Propósito |
|---|---|---|---|
| `idx_symptoms_user_date` | `symptoms` | `(user_id, date DESC)` | Historial paginado por fecha |
| `idx_symptoms_user_name` | `symptoms` | `(user_id, name)` | Filtro por nombre de síntoma |

---

## Políticas RLS

### `profiles`

| Política | Operación | Condición |
|---|---|---|
| `profiles: select own` | SELECT | `auth.uid() = id` |
| `profiles: insert own` | INSERT | `auth.uid() = id` |
| `profiles: update own` | UPDATE | `auth.uid() = id` |

### `symptoms`

| Política | Operación | Condición |
|---|---|---|
| `symptoms: select own` | SELECT | `auth.uid() = user_id` |
| `symptoms: insert own` | INSERT | `auth.uid() = user_id` |
| `symptoms: update own` | UPDATE | `auth.uid() = user_id` |
| `symptoms: delete own` | DELETE | `auth.uid() = user_id` |

---

## Trigger

**`on_auth_user_created`** — Se ejecuta `AFTER INSERT ON auth.users`.  
Llama a `handle_new_user()` que inserta una fila en `profiles` con el `id` y `email` del nuevo usuario.  
Usa `ON CONFLICT (id) DO NOTHING` para idempotencia.

---

## Notas para la migración

- La columna `body_area` mapea al campo `bodyArea` del frontend. Al leer/escribir en Supabase, el cliente debe traducir: `body_area ↔ bodyArea`.
- El campo `id` se mantiene como `text` para preservar los IDs generados en cliente durante la migración de datos existentes de localStorage.

---

Migración: `002_api_key_storage.sql`

---

### `user_api_keys`

Una fila por usuario. La API key de Anthropic **nunca se almacena en claro**: el cliente la cifra con AES-GCM (Web Crypto API) antes de enviarla. Supabase guarda únicamente el ciphertext y el IV.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `user_id` | `uuid` | PK, FK → `auth.users.id` ON DELETE CASCADE | ID del usuario propietario |
| `encrypted_key` | `text` | NOT NULL | Ciphertext AES-GCM en base64 |
| `iv` | `text` | NOT NULL | IV de AES-GCM en base64 (12 bytes → ~16 chars); se regenera en cada escritura |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT now() | Actualizado automáticamente por trigger en cada UPDATE |

---

## Políticas RLS — `user_api_keys`

| Política | Operación | Condición |
|---|---|---|
| `api_keys: select own` | SELECT | `auth.uid() = user_id` |
| `api_keys: insert own` | INSERT | `auth.uid() = user_id` |
| `api_keys: update own` | UPDATE | `auth.uid() = user_id` |
| `api_keys: delete own` | DELETE | `auth.uid() = user_id` |

---

## Trigger — `user_api_keys`

**`trg_api_key_updated_at`** — Se ejecuta `BEFORE UPDATE ON user_api_keys`.  
Llama a `set_api_key_updated_at()` que establece `updated_at = now()` antes de escribir la fila.
