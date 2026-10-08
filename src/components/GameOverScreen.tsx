import type { Level } from '../utils/mathUtils'
import GameButton from './GameButton'

interface GameOverScreenProps {
  score: number
  level: Level
  totalCorrect: number
  totalAnswered: number
  onRetry: () => void
}

function GameOverScreen({ score, level, totalCorrect, totalAnswered, onRetry }: GameOverScreenProps) {
  return (
    <section className="flex animate-pop flex-col items-center gap-8 text-center">
      <div className="text-7xl sm:text-8xl" aria-hidden="true">
        💥
      </div>

      <h1 className="text-5xl font-bold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.25)] sm:text-6xl">
        ¡Juego Terminado!
      </h1>

      <div className="w-full max-w-sm rounded-[2rem] bg-white px-8 py-6 shadow-[0_10px_0_0_rgba(0,0,0,0.15)]">
        <p className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">Puntuación final</p>
        <p className="text-7xl font-bold text-indigo-900 tabular-nums">{score}</p>
        <div className="mt-4 flex justify-center gap-6 text-indigo-700">
          <span>
            Nivel <strong>{level}</strong>
          </span>
          <span>
            Aciertos{' '}
            <strong>
              {totalCorrect}/{totalAnswered}
            </strong>
          </span>
        </div>
      </div>

      <GameButton onClick={onRetry} autoFocus>
        🔄 Volver a intentar
      </GameButton>
    </section>
  )
}

export default GameOverScreen
