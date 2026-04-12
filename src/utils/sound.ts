export const playTone = (frequency: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime)
    
    // envelope
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + duration)
  } catch (e) {
    console.error('Audio play failed', e)
  }
}

export const playCorrectSound = () => {
  playTone(600, 'sine', 0.1, 0.1)
  setTimeout(() => playTone(800, 'sine', 0.2, 0.1), 100)
}

export const playWrongSound = () => {
  playTone(300, 'sawtooth', 0.3, 0.1)
  setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.1), 150)
}

export const playVictorySound = () => {
  const notes = [440, 554, 659, 880]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 'sine', 0.4, 0.15), i * 150)
  })
}
