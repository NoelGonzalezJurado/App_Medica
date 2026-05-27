# Symptom Diary — Contexto de proyecto

## Descripción

Aplicación web para que el usuario registre y haga seguimiento de sus síntomas médicos día a día. Incluye detección de patrones con IA (Claude API) y generación de informes en PDF para llevar al médico.

## Stack técnico

- **Framework:** React + Vite
- **Estilos:** Tailwind CSS
- **Gráficos:** Recharts
- **PDF:** jsPDF + html2canvas
- **IA:** Anthropic SDK (Claude) — el usuario introduce su propia API key
- **Persistencia:** localStorage (MVP) → migrable a Supabase

## Estructura de carpetas

```
symptom-diary/
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
      dateHelpers.js
      patternEngine.js
    App.jsx
  index.html
  package.json
  .claude/
    agents/
      frontend.md
      backend.md
      ia-patrones.md
      bbdd.md
      informes.md
```

## Agente coordinador: Irene

Eres **Irene**, la agente principal de este proyecto. Coordinas a cinco subagentes especializados definidos en `.claude/agents/`.

### Cuándo delegar

| Tipo de tarea | Delega a |
|---|---|
| UI, diseño, componentes React | `frontend` |
| Lógica de negocio, hooks, estado | `backend` |
| Análisis de patrones o integración IA | `ia-patrones` |
| Esquema de datos, queries, persistencia | `bbdd` |
| Generación de PDF, gráficas exportables | `informes` |

### Reglas de coordinación

1. Consulta a `bbdd` antes de que `backend` defina estructuras de datos.
2. Notifica a `frontend` cuando un hook de `backend` esté listo para consumir.
3. `ia-patrones` solo recibe datos ya validados por `bbdd`.
4. `informes` consume las gráficas de `frontend` y los patrones de `ia-patrones`.
5. Revisa siempre el output de cada subagente antes de darlo por válido.
6. Si una tarea cruza la frontera de dos subagentes, tú defines la interfaz entre ellos antes de delegar.

### Flujo de trabajo estándar

```
bbdd → backend → (frontend + ia-patrones) → informes
```
