import { describe, expect, it } from 'vitest'
import {
  CORRECT_ANSWERS_TO_LEVEL_UP,
  INITIAL_LIVES,
  createInitialState,
  gameReducer,
  pointsFor,
  submitAnswer,
  type GameState,
} from './gameLogic'

const answerCorrectly = (state: GameState) => submitAnswer(state, state.equation.answer)
const answerWrong = (state: GameState) => submitAnswer(state, state.equation.answer + 1)

function repeat(state: GameState, times: number, step: (s: GameState) => GameState): GameState {
  for (let i = 0; i < times; i++) state = step(state)
  return state
}

describe('createInitialState', () => {
  it('empieza en nivel 1 con 3 vidas y 0 puntos', () => {
    const state = createInitialState(1)
    expect(state).toMatchObject({ level: 1, lives: INITIAL_LIVES, score: 0, status: 'playing', lastResult: null })
    expect(state.equation.operator).toBe('+')
  })

  it('es reproducible con la misma semilla', () => {
    expect(createInitialState(99)).toEqual(createInitialState(99))
  })

  it('permite empezar en otro nivel y rechaza niveles inválidos', () => {
    expect(createInitialState(1, 3).equation.operator).toBe('×')
    // @ts-expect-error nivel fuera de rango
    expect(() => createInitialState(1, 5)).toThrow(RangeError)
  })
})

describe('submitAnswer', () => {
  it('acierto: suma puntos según el nivel y genera nueva ecuación', () => {
    const state = createInitialState(5)
    const next = answerCorrectly(state)
    expect(next.score).toBe(pointsFor(1))
    expect(next.lives).toBe(INITIAL_LIVES)
    expect(next.correctInLevel).toBe(1)
    expect(next.equation.text).not.toBe(state.equation.text)
    expect(next.lastResult).toEqual({
      kind: 'correct',
      expected: state.equation.answer,
      given: state.equation.answer,
      pointsEarned: 10,
      leveledUp: false,
    })
  })

  it('acepta la respuesta como texto', () => {
    const state = createInitialState(5)
    expect(submitAnswer(state, ` ${state.equation.answer} `).lastResult?.kind).toBe('correct')
  })

  it('error: resta una vida sin sumar puntos', () => {
    const state = createInitialState(5)
    const next = answerWrong(state)
    expect(next.lives).toBe(INITIAL_LIVES - 1)
    expect(next.score).toBe(0)
    expect(next.status).toBe('playing')
    expect(next.lastResult).toEqual({
      kind: 'incorrect',
      expected: state.equation.answer,
      given: state.equation.answer + 1,
    })
  })

  it('entrada inválida no penaliza', () => {
    const state = createInitialState(5)
    const next = submitAnswer(state, 'abc')
    expect(next).toEqual({ ...state, lastResult: { kind: 'invalid' } })
  })

  it('sube de nivel tras los aciertos necesarios', () => {
    let state = createInitialState(8)
    state = repeat(state, CORRECT_ANSWERS_TO_LEVEL_UP - 1, answerCorrectly)
    expect(state.level).toBe(1)
    state = answerCorrectly(state)
    expect(state.level).toBe(2)
    expect(state.correctInLevel).toBe(0)
    expect(state.equation.operator).toBe('-')
    expect(state.lastResult).toMatchObject({ kind: 'correct', leveledUp: true })
  })

  it('recorre los 4 niveles y no pasa del 4', () => {
    let state = createInitialState(3)
    state = repeat(state, CORRECT_ANSWERS_TO_LEVEL_UP * 3, answerCorrectly)
    expect(state.level).toBe(4)
    state = repeat(state, CORRECT_ANSWERS_TO_LEVEL_UP * 2, answerCorrectly)
    expect(state.level).toBe(4)
    expect(state.lastResult).toMatchObject({ leveledUp: false })
    // 5 aciertos en cada nivel 1–3 y 10 en el nivel 4.
    expect(state.score).toBe(5 * (10 + 20 + 30) + 10 * 40)
    expect(state.totalCorrect).toBe(CORRECT_ANSWERS_TO_LEVEL_UP * 5)
  })

  it('los fallos no reinician el progreso del nivel', () => {
    let state = createInitialState(2)
    state = repeat(state, 2, answerCorrectly)
    state = answerWrong(state)
    expect(state.correctInLevel).toBe(2)
  })

  it('termina la partida al perder las 3 vidas e ignora más respuestas', () => {
    const state = repeat(createInitialState(4), INITIAL_LIVES, answerWrong)
    expect(state.lives).toBe(0)
    expect(state.status).toBe('game-over')
    expect(state.totalAnswered).toBe(INITIAL_LIVES)
    expect(answerCorrectly(state)).toBe(state)
    expect(answerWrong(state)).toBe(state)
  })

  it('es pura: no modifica el estado original y es determinista', () => {
    const state = createInitialState(11)
    const snapshot = structuredClone(state)
    const a = answerCorrectly(state)
    const b = answerCorrectly(state)
    expect(state).toEqual(snapshot)
    expect(a).toEqual(b)
  })
})

describe('gameReducer', () => {
  it('reset reinicia la partida', () => {
    let state = repeat(createInitialState(4), INITIAL_LIVES, answerWrong)
    state = gameReducer(state, { type: 'reset', seed: 4 })
    expect(state).toEqual(createInitialState(4))
  })

  it('reset puede elegir nivel', () => {
    const state = gameReducer(createInitialState(1), { type: 'reset', seed: 1, level: 4 })
    expect(state.level).toBe(4)
  })
})
