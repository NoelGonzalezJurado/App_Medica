/**
 * crypto.js — Cifrado AES-GCM con Web Crypto API
 *
 * La clave AES-256 se deriva del userId del usuario con PBKDF2
 * usando un salt fijo de la app. Esto garantiza que un dump de la
 * columna encrypted_key es inútil sin conocer también el UUID del
 * usuario y el salt de la aplicación.
 *
 * NOTA: nunca loguear plaintext ni la clave derivada.
 */

const SALT = new TextEncoder().encode('symptom-diary-v1');
const PBKDF2_ITERATIONS = 100_000;

/**
 * Deriva una CryptoKey AES-256-GCM a partir del userId.
 * @param {string} userId - UUID del usuario autenticado
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(userId) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Convierte un ArrayBuffer a string base64.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Convierte un string base64 a Uint8Array.
 * @param {string} b64
 * @returns {Uint8Array}
 */
function base64ToBuffer(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

/**
 * Cifra la API key del usuario con AES-GCM.
 *
 * @param {string} plaintext - API key en texto plano
 * @param {string} userId - UUID del usuario autenticado
 * @returns {Promise<{ encryptedKey: string, iv: string }>}
 *   encryptedKey e iv ambos en base64
 */
export async function encryptApiKey(plaintext, userId) {
  const key = await deriveKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  return {
    encryptedKey: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  };
}

/**
 * Descifra la API key almacenada en Supabase.
 *
 * @param {string} encryptedKey - Ciphertext en base64
 * @param {string} iv - IV en base64 (12 bytes)
 * @param {string} userId - UUID del usuario autenticado
 * @returns {Promise<string>} API key en texto plano
 */
export async function decryptApiKey(encryptedKey, iv, userId) {
  const key = await deriveKey(userId);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBuffer(iv) },
    key,
    base64ToBuffer(encryptedKey)
  );

  return new TextDecoder().decode(plainBuffer);
}
