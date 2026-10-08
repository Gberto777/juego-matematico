import GameButton from './GameButton'

interface StartScreenProps {
  onStart: () => void
}

const LEVELS = [
  { icon: '➕', label: 'Sumas' },
  { icon: '➖', label: 'Restas' },
  { icon: '✖️', label: 'Multiplicar' },
  { icon: '🔀', label: 'Mixtas' },
]

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <section className="flex flex-col items-center gap-10 text-center">
      <div className="animate-float text-7xl sm:text-8xl" aria-hidden="true">
        🧮
      </div>

      <div className="space-y-3">
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.25)] sm:text-7xl">
          Juego <span className="text-amber-300">Matemático</span>
        </h1>
        <p className="text-lg text-indigo-100 sm:text-xl">¡Resuelve operaciones, sube de nivel y no pierdas tus vidas!</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LEVELS.map(({ icon, label }, i) => (
          <li
            key={label}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white/15 px-4 py-3 text-indigo-50 ring-1 ring-white/20 backdrop-blur"
          >
            <span className="text-2xl" aria-hidden="true">
              {icon}
            </span>
            <span className="text-sm font-semibold">
              Nivel {i + 1}: {label}
            </span>
          </li>
        ))}
      </ul>

      <GameButton onClick={onStart} autoFocus>
        ▶ Comenzar Juego
      </GameButton>
    </section>
  )
}

export default StartScreen
