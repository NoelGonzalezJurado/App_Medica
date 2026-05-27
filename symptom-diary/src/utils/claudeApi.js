import Anthropic from '@anthropic-ai/sdk';

export async function analyzeSymptoms(symptoms, apiKey) {
  if (!apiKey) throw new Error('API key no configurada. Ve a ⚙️ Ajustes para añadirla.');
  if (symptoms.length < 3) throw new Error('Necesitas al menos 3 registros para el análisis.');

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const data = symptoms.map(s => ({
    fecha: s.date,
    sintoma: s.name,
    intensidad: `${s.intensity}/10`,
    zona: s.bodyArea || 'No especificada',
    desencadenantes: s.triggers?.length ? s.triggers.join(', ') : 'No indicados',
    notas: s.notes || '',
  }));

  const prompt = `Eres un asistente de análisis de síntomas médicos. Analiza el siguiente diario y proporciona un informe detallado en español para ayudar al paciente en su próxima consulta médica.

DATOS DEL DIARIO (${symptoms.length} registros):
${JSON.stringify(data, null, 2)}

Proporciona el análisis con este formato exacto:

## 📊 Resumen General
Descripción breve del estado general basado en los datos.

## 🔄 Patrones Identificados
Lista los patrones observados: frecuencia, horarios, duración, progresión temporal.

## 🔗 Correlaciones entre Síntomas
Síntomas que aparecen juntos o que podrían estar relacionados entre sí.

## 📈 Tendencias de Severidad
Si los síntomas están mejorando, empeorando o son estables. Menciona valores específicos.

## ⚠️ Puntos de Atención Prioritaria
Síntomas de mayor intensidad o frecuencia que merecen atención médica urgente.

## 💡 Recomendaciones para la Consulta
Qué información específica llevar al médico y qué preguntas hacer.

## 🌿 Observaciones de Contexto
Posibles factores del estilo de vida o contexto que podrían influir en los síntomas.

---
⚠️ Este análisis es orientativo y no reemplaza el diagnóstico médico profesional.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text;
}
