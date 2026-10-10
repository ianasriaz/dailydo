/**
 * Web Audio API chime synthesizer
 * Zero external audio file dependencies
 */
export function playChime() {
  if (typeof window === "undefined") return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const ctx = new AudioContext();

    // Two-tone chime: Note 1 (880Hz / A5), Note 2 (1174.66Hz / D6)
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.25);
    playTone(1174.66, now + 0.15, 0.45);
  } catch (err) {
    console.warn("Audio chime failed to play:", err);
  }
}
