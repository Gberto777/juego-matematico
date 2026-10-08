import {
  MAX_LEVEL,
  MIN_LEVEL,
  createSeededRandom,
  generateEquation,
  isValidLevel,
  parseAnswer,
  type Equation,
  type Level,
} from './mathUtils'

export const INITIAL_LIVES = 3
/** Aciertos necesarios dentro de un nivel para pasar al siguiente. */
export const CORRECT_ANSWERS_TO_LEVEL_UP = 5
/** Puntos por acierto; se multiplican por el nivel actual. */
export const POINTS_PER_CORRECT_ANSWER = 10

export type GameStatus = 'playing' | 'game-over'

export type AnswerResult =
  | { kind: 'correct'; expected: number; given: number; pointsEarned: number; leveledUp: boolean }
  | { kind: 'incorrect'; expected: number; given: number }
  | { kind: 'invalid' }

export interface GameState {
  equation: Equation
  level: Level
  score: number
  lives: number
  status: GameStatus
  correctInLevel: number
  totalCorrect: number
  totalAnswered: number
  lastResult: AnswerResult | null
  /** Semilla del generador aleatorio; mantiene el reducer puro y reproducible. */
  seed: number
}

export type GameAction =
  | { type: 'submit-answer'; answer: string | number }
  | { type: 'reset'; seed: number; level?: Level }

export function createInitialState(seed: number, level: Level = MIN_LEVEL): GameState {
  if (!isValidLevel(level)) {
    throw new RangeError(`Nivel inválido: ${level}`)
  }
  const rng = createSeededRandom(seed)
  const equation = generateEquation(level, rng.random)
  return {
    equation,
    level,
    score: 0,
    lives: INITIAL_LIVES,
    status: 'playing',
    correctInLevel: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    lastResult: null,
    seed: rng.getSeed(),
  }
}

export function pointsFor(level: Level): number {
  return POINTS_PER_CORRECT_ANSWER * level
}

export function submitAnswer(state: GameState, input: string | number): GameState {
  if (state.status === 'game-over') {
    return state
  }

  const given = parseAnswer(input)
  if (given === null) {
    // Una entrada vacía o no numérica no penaliza: solo se informa.
    return { ...state, lastResult: { kind: 'invalid' } }
  }

  const expected = state.equation.answer
  const rng = createSeededRandom(state.seed)
  const totalAnswered = state.totalAnswered + 1

  if (given === expected) {
    const pointsEarned = pointsFor(state.level)
    const reachedThreshold = state.correctInLevel + 1 >= CORRECT_ANSWERS_TO_LEVEL_UP
    const leveledUp = reachedThreshold && state.level < MAX_LEVEL
    const level = leveledUp ? ((state.level + 1) as Level) : state.level

    return {
      ...state,
      level,
      score: state.score + pointsEarned,
      correctInLevel: leveledUp ? 0 : state.correctInLevel + 1,
      totalCorrect: state.totalCorrect + 1,
      totalAnswered,
      equation: generateEquation(level, rng.random, state.equation),
      lastResult: { kind: 'correct', expected, given, pointsEarned, leveledUp },
      seed: rng.getSeed(),
    }
  }

  const lives = Math.max(0, state.lives - 1)
  const status: GameStatus = lives === 0 ? 'game-over' : 'playing'

  return {
    ...state,
    lives,
    status,
    totalAnswered,
    // Al perder la partida se conserva la última ecuación para poder mostrarla.
    equation:
      status === 'playing' ? generateEquation(state.level, rng.random, state.equation) : state.equation,
    lastResult: { kind: 'incorrect', expected, given },
    seed: status === 'playing' ? rng.getSeed() : state.seed,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'submit-answer':
      return submitAnswer(state, action.answer)
    case 'reset':
      return createInitialState(action.seed, action.level)
  }
}
