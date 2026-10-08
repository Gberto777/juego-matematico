import { useCallback, useReducer } from 'react'
import {
  createInitialState,
  gameReducer,
  type AnswerResult,
  type GameState,
  type GameStatus,
} from '../utils/gameLogic'
import { randomSeed, type Equation, type Level } from '../utils/mathUtils'

export interface UseGameLogicOptions {
  /** Nivel con el que empieza la partida (por defecto 1). */
  initialLevel?: Level
  /** Semilla fija para partidas reproducibles (útil en tests). */
  seed?: number
}

export interface UseGameLogicResult {
  equation: Equation
  correctAnswer: number
  level: Level
  score: number
  lives: number
  status: GameStatus
  isGameOver: boolean
  correctInLevel: number
  totalCorrect: number
  totalAnswered: number
  lastResult: AnswerResult | null
  /** Valida la respuesta del usuario: suma puntos/sube de nivel si acierta, resta una vida si falla. */
  submitAnswer: (answer: string | number) => void
  /** Reinicia la partida (opcionalmente en otro nivel). */
  resetGame: (level?: Level) => void
}

export function useGameLogic({ initialLevel, seed }: UseGameLogicOptions = {}): UseGameLogicResult {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    (): GameState => createInitialState(seed ?? randomSeed(), initialLevel),
  )

  const submitAnswer = useCallback((answer: string | number) => {
    dispatch({ type: 'submit-answer', answer })
  }, [])

  const resetGame = useCallback(
    (level?: Level) => {
      dispatch({ type: 'reset', seed: randomSeed(), level: level ?? initialLevel })
    },
    [initialLevel],
  )

  return {
    equation: state.equation,
    correctAnswer: state.equation.answer,
    level: state.level,
    score: state.score,
    lives: state.lives,
    status: state.status,
    isGameOver: state.status === 'game-over',
    correctInLevel: state.correctInLevel,
    totalCorrect: state.totalCorrect,
    totalAnswered: state.totalAnswered,
    lastResult: state.lastResult,
    submitAnswer,
    resetGame,
  }
}
