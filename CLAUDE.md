# App Síntomas Médico — Contexto de proyecto para Irene

## Qué es este proyecto

App web para que el usuario registre y haga seguimiento de sus síntomas médicos. Incluye análisis con IA (Claude API) y generación de informes para llevar al médico.

## Stack técnico

- **Framework:** React + Vite
- **Estilos:** Tailwind CSS
- **Gráficos:** Recharts
- **PDF:** jsPDF + html2canvas
- **IA:** Anthropic SDK (Claude) — el usuario introduce su propia API key

## Estructura

```
v0/
  src/
    components/
      Header.jsx
      Navigation.jsx
      SymptomForm.jsx       ← formulario de registro
      SymptomHistory.jsx    ← historial con filtros
      Charts.jsx            ← gráficos de evolución
      AIAnalysis.jsx        ← análisis con Claude
      MedicalReport.jsx     ← generación de informe PDF
      SettingsModal.jsx     ← configuración + API key
    hooks/
      useSymptoms.js        ← persistencia en localStorage
    utils/
    App.jsx
  index.html
  package.json
```

## Estado del proyecto

Ver `C:\Users\ngonz\Documents\Agente Irene\memory\projects\app-sintomas-medico.md`

## Nota para Irene

Este proyecto es gestionado por Irene. Para cualquier tarea de código, consulta primero el estado del proyecto en memoria antes de proponer cambios.
