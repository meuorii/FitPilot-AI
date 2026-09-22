let restAlarmContext: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null
  }

  if (
    restAlarmContext &&
    restAlarmContext.state !== 'closed'
  ) {
    return restAlarmContext
  }

  try {
    restAlarmContext = new window.AudioContext()
    return restAlarmContext
  } catch {
    return null
  }
}

export const unlockRestAlarm = async (): Promise<void> => {
  const context = getAudioContext()

  if (!context) {
    return
  }

  try {
    if (context.state === 'suspended') {
      await context.resume()
    }
  } catch {
    // Audio availability should never block the workout flow.
  }
}

const scheduleTone = (
  context: AudioContext,
  startsAt: number,
  frequency: number,
  duration: number,
) => {
  const oscillator =
    context.createOscillator()
  const gain =
    context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(
    frequency,
    startsAt,
  )

  gain.gain.setValueAtTime(
    0.0001,
    startsAt,
  )
  gain.gain.exponentialRampToValueAtTime(
    0.18,
    startsAt + 0.02,
  )
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startsAt + duration,
  )

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start(startsAt)
  oscillator.stop(
    startsAt + duration + 0.03,
  )
}

export const playRestCompleteAlarm =
  async (): Promise<void> => {
    const context = getAudioContext()

    if (!context) {
      return
    }

    try {
      if (context.state === 'suspended') {
        await context.resume()
      }

      const now =
        context.currentTime + 0.02

      scheduleTone(
        context,
        now,
        880,
        0.16,
      )
      scheduleTone(
        context,
        now + 0.22,
        1046.5,
        0.16,
      )
      scheduleTone(
        context,
        now + 0.44,
        1318.5,
        0.24,
      )

      if (
        typeof navigator !== 'undefined' &&
        'vibrate' in navigator
      ) {
        navigator.vibrate([
          160,
          90,
          160,
        ])
      }
    } catch {
      // Keep rest completion silent if audio is unavailable.
    }
  }
