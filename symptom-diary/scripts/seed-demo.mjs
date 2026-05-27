/**
 * seed-demo.mjs — Crea la cuenta demo y seedea síntomas de ejemplo
 *
 * Uso: node scripts/seed-demo.mjs
 * Requiere: Node.js 18+ (fetch nativo)
 */

const SUPABASE_URL = 'https://ubvbwjuvozhixvxwwwqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidmJ3anV2b3poaXh2eHd3d3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODkzNTEsImV4cCI6MjA5NTQ2NTM1MX0.ccHAhfeedkPU9M8DITIwwyoqI_B_P2oNBRZt1Qcpj6I';

const DEMO_EMAIL = 'diariomedico.demo@gmail.com';
const DEMO_PASSWORD = 'Demo1234!';

// Fecha base: 2026-05-27
const BASE = new Date('2026-05-27T12:00:00Z');

function dateOffset(daysAgo, timeStr) {
  const d = new Date(BASE);
  d.setDate(d.getDate() - daysAgo);
  const [h, m] = timeStr.split(':').map(Number);
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const SYMPTOM_DATA = [
  { name: 'Fatiga / Cansancio',  intensity: 6, daysAgo: 30, time: '08:30', bodyArea: 'General', triggers: ['Al despertar'],                         notes: 'Me levanté muy cansado sin motivo aparente.' },
  { name: 'Dolor de cabeza',     intensity: 5, daysAgo: 28, time: '14:00', bodyArea: 'Cabeza',   triggers: ['Con estrés'],                            notes: '' },
  { name: 'Dolor de cabeza',     intensity: 7, daysAgo: 27, time: '09:30', bodyArea: 'Cabeza',   triggers: ['Al despertar', 'Falta de sueño'],        notes: 'Empezó al despertar, duró toda la mañana.' },
  { name: 'Náuseas',             intensity: 4, daysAgo: 25, time: '13:00', bodyArea: 'Abdomen',  triggers: ['Tras comer'],                            notes: 'Después de comer picante.' },
  { name: 'Migraña',             intensity: 8, daysAgo: 24, time: '11:00', bodyArea: 'Cabeza',   triggers: ['Falta de sueño', 'Con estrés'],          notes: 'Con fotofobia. Tuve que tumbarme.' },
  { name: 'Fatiga / Cansancio',  intensity: 5, daysAgo: 22, time: '16:00', bodyArea: 'General',  triggers: [],                                        notes: '' },
  { name: 'Dolor de espalda',    intensity: 6, daysAgo: 20, time: '18:00', bodyArea: 'Espalda',  triggers: ['Ejercicio'],                             notes: 'Tras el entrenamiento de gimnasio.' },
  { name: 'Dolor de cabeza',     intensity: 4, daysAgo: 19, time: '20:00', bodyArea: 'Cabeza',   triggers: ['Alcohol / Café'],                        notes: 'Después de tomar dos cafés por la tarde.' },
  { name: 'Ansiedad',            intensity: 7, daysAgo: 17, time: '22:00', bodyArea: 'General',  triggers: ['Con estrés'],                            notes: 'Noche con mucha tensión por trabajo.' },
  { name: 'Insomnio',            intensity: 6, daysAgo: 16, time: '02:00', bodyArea: 'General',  triggers: ['Con estrés'],                            notes: 'No pude dormir hasta las 4am.' },
  { name: 'Migraña',             intensity: 9, daysAgo: 15, time: '10:00', bodyArea: 'Cabeza',   triggers: ['Falta de sueño', 'Con estrés'],          notes: 'El peor episodio del mes. Vómitos asociados.' },
  { name: 'Vómitos',             intensity: 5, daysAgo: 14, time: '11:30', bodyArea: 'Abdomen',  triggers: ['Sin motivo aparente'],                   notes: 'Asociado a la migraña del día anterior.' },
  { name: 'Fatiga / Cansancio',  intensity: 7, daysAgo: 12, time: '09:00', bodyArea: 'General',  triggers: ['Falta de sueño', 'Al despertar'],        notes: 'Resaca de los últimos días de estrés.' },
  { name: 'Dolor de cabeza',     intensity: 3, daysAgo: 10, time: '17:00', bodyArea: 'Cabeza',   triggers: ['Cambio de tiempo'],                      notes: 'Tormenta por la tarde.' },
  { name: 'Congestión nasal',    intensity: 4, daysAgo:  9, time: '08:00', bodyArea: 'Cabeza',   triggers: ['Cambio de tiempo'],                      notes: '' },
  { name: 'Congestión nasal',    intensity: 5, daysAgo:  8, time: '09:00', bodyArea: 'Cabeza',   triggers: [],                                        notes: 'Peor por las mañanas.' },
  { name: 'Dolor de garganta',   intensity: 4, daysAgo:  7, time: '07:30', bodyArea: 'Cuello',   triggers: [],                                        notes: '' },
  { name: 'Fiebre',              intensity: 6, daysAgo:  6, time: '20:00', bodyArea: 'General',  triggers: [],                                        notes: '37.8 °C por la noche.' },
  { name: 'Fatiga / Cansancio',  intensity: 8, daysAgo:  5, time: '10:00', bodyArea: 'General',  triggers: [],                                        notes: 'Sin energía, resfriado.' },
  { name: 'Tos',                 intensity: 5, daysAgo:  4, time: '14:00', bodyArea: 'Pecho',    triggers: [],                                        notes: 'Tos seca persistente.' },
  { name: 'Dolor de cabeza',     intensity: 5, daysAgo:  3, time: '15:00', bodyArea: 'Cabeza',   triggers: ['Sin motivo aparente'],                   notes: '' },
  { name: 'Tos',                 intensity: 4, daysAgo:  2, time: '11:00', bodyArea: 'Pecho',    triggers: [],                                        notes: 'Mejorando poco a poco.' },
  { name: 'Fatiga / Cansancio',  intensity: 5, daysAgo:  1, time: '09:00', bodyArea: 'General',  triggers: ['Al despertar'],                          notes: 'Aún recuperándome del resfriado.' },
  { name: 'Dolor de cabeza',     intensity: 4, daysAgo:  0, time: '11:30', bodyArea: 'Cabeza',   triggers: ['Alcohol / Café'],                        notes: 'Tras el café de la mañana.' },
];

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...(options.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function main() {
  console.log('Diario Médico — seed de cuenta demo\n');

  // 1. Registrar o loguear
  let accessToken = null;
  let userId = null;

  console.log(`Intentando registrar ${DEMO_EMAIL}…`);
  const signUp = await supabaseFetch('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
  });

  if (signUp.status === 200 && signUp.body.access_token) {
    accessToken = signUp.body.access_token;
    userId = signUp.body.user?.id;
    console.log('✓ Usuario demo creado');
  } else if (
    signUp.body.msg?.includes('already registered') ||
    signUp.body.error_description?.includes('already registered') ||
    signUp.body.code === 'user_already_exists' ||
    signUp.status === 422
  ) {
    console.log('  Ya existe, iniciando sesión…');
    const signIn = await supabaseFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    });
    if (signIn.status !== 200 || !signIn.body.access_token) {
      console.error('Error al iniciar sesión:', signIn.body);
      process.exit(1);
    }
    accessToken = signIn.body.access_token;
    userId = signIn.body.user?.id;
    console.log('✓ Sesión iniciada');
  } else {
    console.error('Error al registrar usuario:', signUp.body);
    process.exit(1);
  }

  console.log(`  User ID: ${userId}`);

  // 2. Borrar síntomas existentes
  const del = await supabaseFetch('/rest/v1/symptoms?user_id=eq.' + userId, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'return=minimal',
    },
  });
  if (del.status >= 400) {
    console.error('Error al borrar síntomas previos:', del.body);
    process.exit(1);
  }
  console.log('✓ Síntomas anteriores eliminados');

  // 3. Insertar síntomas de ejemplo
  const rows = SYMPTOM_DATA.map(s => ({
    id: uuid(),
    user_id: userId,
    name: s.name,
    intensity: s.intensity,
    date: dateOffset(s.daysAgo, s.time),
    body_area: s.bodyArea,
    triggers: s.triggers,
    notes: s.notes,
    created_at: new Date().toISOString(),
  }));

  const ins = await supabaseFetch('/rest/v1/symptoms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (ins.status >= 400) {
    console.error('Error al insertar síntomas:', ins.body);
    process.exit(1);
  }

  console.log(`✓ ${rows.length} síntomas insertados`);
  console.log('\n--- Cuenta demo lista ---');
  console.log(`  Email:      ${DEMO_EMAIL}`);
  console.log(`  Contraseña: ${DEMO_PASSWORD}`);
  console.log('-----------------------\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
