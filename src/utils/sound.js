// Web Audio API Synthesizer for Executive Chime / Ding
export const playReservationDing = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // High-pitched crystal bell sound (E6 & G#6 harmony)
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime); 
    osc2.frequency.setValueAtTime(1661.22, ctx.currentTime);

    osc1.type = 'sine';
    osc2.type = 'sine';

    // Fade-out envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (err) {
    console.warn("Audio notification blocked by browser autoplay policy:", err);
  }
};