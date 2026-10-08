# Juego Matemático

React + TypeScript + Vite + TailwindCSS.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compilación de producción
- `npm run preview` — previsualiza el build
- `npm run lint` — linter (oxlint)
- `npm test` — tests (Vitest); `npm run test:watch` en modo observación

## Persistencia

Se guarda en `localStorage`:

- `juego-matematico:records:v1`: puntuación máxima y nivel máximo alcanzado.
- `juego-matematico:partida:v1`: la partida en curso, para retomarla si se recarga la página. Se borra al terminar la partida.

Los datos se validan al leerlos; si están corruptos se ignoran. Si `localStorage` no está disponible, el juego funciona sin guardar.

## Estructura

```
src/
  components/  componentes de UI
  hooks/       hooks personalizados
  utils/       funciones auxiliares
  App.tsx
  main.tsx
  index.css    entrada de Tailwind
```
