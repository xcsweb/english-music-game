import { describe, it, expect, vi, beforeEach } from 'vitest'
import { playTone, playCorrectSound, playWrongSound, playVictorySound } from './sound'

describe('Sound Utils', () => {
  let mockOscillator: any
  let mockGainNode: any
  let mockAudioContext: any

  beforeEach(() => {
    vi.useFakeTimers()

    mockOscillator = {
      type: '',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }

    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }

    mockAudioContext = {
      currentTime: 0,
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
    }

    // Mock window.AudioContext
    ;(window as any).AudioContext = vi.fn().mockImplementation(function() {
      return mockAudioContext
    })
    
    // Clear mocks
    vi.clearAllMocks()
  })

  it('plays a single tone with correct parameters', () => {
    playTone(440, 'sine', 1, 0.5)

    expect((window as any).AudioContext).toHaveBeenCalled()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    expect(mockAudioContext.createGain).toHaveBeenCalled()

    expect(mockOscillator.type).toBe('sine')
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0)

    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0)
    expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.00001, 1)

    expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode)
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination)

    expect(mockOscillator.start).toHaveBeenCalled()
    expect(mockOscillator.stop).toHaveBeenCalledWith(1)
  })

  it('handles AudioContext errors gracefully', () => {
    ;(window as any).AudioContext = vi.fn().mockImplementation(function() {
      throw new Error('AudioContext not supported')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => playTone(440, 'sine', 1)).not.toThrow()
    expect(consoleSpy).toHaveBeenCalledWith('Audio play failed', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('plays correct sound sequence', () => {
    playCorrectSound()

    // First tone
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(600, 0)
    expect(mockOscillator.type).toBe('sine')

    // Second tone
    vi.advanceTimersByTime(100)
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(800, 0)
  })

  it('plays wrong sound sequence', () => {
    playWrongSound()

    // First tone
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(300, 0)
    expect(mockOscillator.type).toBe('sawtooth')

    // Second tone
    vi.advanceTimersByTime(150)
    expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(250, 0)
  })

  it('plays victory sound sequence', () => {
    playVictorySound()

    const notes = [440, 554, 659, 880]

    notes.forEach((freq, i) => {
      vi.advanceTimersByTime(i === 0 ? 0 : 150)
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(freq, 0)
    })
  })
})
