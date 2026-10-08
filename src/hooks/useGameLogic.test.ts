// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { INITIAL_LIVES } from '../utils/gameLogic'
import { useGameLogic } from './useGameLogic'

describe('useGameLogic', () => {
  it('expone el estado inicial', () => {
    const { result } = renderHook(() => useGameLogic({ seed: 1 }))
    expect(result.current).toMatchObject({ level: 1, score: 0, lives: INITIAL_LIVES, isGameOver: false })
    expect(result.current.correctAnswer).toBe(result.current.equation.answer)
  })

  it('valida respuestas correctas e incorrectas', () => {
    const { result } = renderHook(() => useGameLogic({ seed: 1 }))

    act(() => result.current.submitAnswer(result.current.correctAnswer))
    expect(result.current.score).toBe(10)

    act(() => result.current.submitAnswer(String(result.current.correctAnswer + 1)))
    expect(result.current.lives).toBe(INITIAL_LIVES - 1)
    expect(result.current.lastResult?.kind).toBe('incorrect')
  })

  it('llega a game over y se puede reiniciar', () => {
    const { result } = renderHook(() => useGameLogic({ seed: 1, initialLevel: 3 }))
    for (let i = 0; i < INITIAL_LIVES; i++) {
      act(() => result.current.submitAnswer(-1))
    }
    expect(result.current.isGameOver).toBe(true)

    act(() => result.current.resetGame())
    expect(result.current).toMatchObject({ level: 3, lives: INITIAL_LIVES, score: 0, isGameOver: false })
  })

  it('mantiene referencias estables de las funciones', () => {
    const { result, rerender } = renderHook(() => useGameLogic({ seed: 1 }))
    const { submitAnswer, resetGame } = result.current
    rerender()
    expect(result.current.submitAnswer).toBe(submitAnswer)
    expect(result.current.resetGame).toBe(resetGame)
  })
})
