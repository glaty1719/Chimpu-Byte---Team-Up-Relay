/**
 * SynthesizerAudio provides procedural Web Audio BGM and SFX for the Team-Up Relay runner.
 * Ensures complete, rich audio experience without external audio network dependencies.
 */
export class SynthesizerAudio {
    private static instance: SynthesizerAudio;
    private ctx: AudioContext | null = null;
    private isBgmPlaying: boolean = false;
    private bgmTimer: number | null = null;
    private currentBgmStep: number = 0;
    private masterGain: GainNode | null = null;
    private sfxGain: GainNode | null = null;
    private bgmGain: GainNode | null = null;

    private isMuted: boolean = false;
    private bgmVolume: number = 0.35;
    private sfxVolume: number = 0.6;

    private constructor() {
        // AudioContext will be initialized on first user interaction / init
    }

    public static getInstance(): SynthesizerAudio {
        if (!SynthesizerAudio.instance) {
            SynthesizerAudio.instance = new SynthesizerAudio();
        }
        return SynthesizerAudio.instance;
    }

    public init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                this.bgmGain = this.ctx.createGain();
                this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
                this.bgmGain.connect(this.masterGain);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
                this.sfxGain.connect(this.masterGain);
            }
        } catch (e) {
            console.warn('Web Audio synthesis not supported:', e);
        }
    }

    private resumeContext() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    public setMuted(muted: boolean) {
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
        }
    }

    public setBgmVolume(vol: number) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        }
    }

    public setSfxVolume(vol: number) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        }
    }

    // --- SFX GENERATORS ---

    public playButtonTap() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    public playDash() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.22);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.26);
    }

    public playGateBreak() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;

        // 1. Initial Glass Crunch / Noise Impact Burst
        try {
            const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.12), this.ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
            }
            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(3200, now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);

            noiseSource.start(now);
            noiseSource.stop(now + 0.13);
        } catch (e) {}

        // 2. Shimmering High Crystal Chords
        const notes = [659.25, 880.00, 1046.50, 1318.51, 1760.00, 2093.00];
        notes.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.015);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.38);

            gain.gain.setValueAtTime(0.22 / notes.length, now + idx * 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.015);
            osc.stop(now + 0.5);
        });
    }

    public playGentleBounce() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;

        // 1. Initial Soft Bumper Thump
        const thump = this.ctx.createOscillator();
        const thumpGain = this.ctx.createGain();
        thump.type = 'sine';
        thump.frequency.setValueAtTime(160, now);
        thump.frequency.exponentialRampToValueAtTime(50, now + 0.08);

        thumpGain.gain.setValueAtTime(0.4, now);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        thump.connect(thumpGain);
        thumpGain.connect(this.sfxGain);
        thump.start(now);
        thump.stop(now + 0.1);

        // 2. Rubbery Spring "Boing" Pitch Bend
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.32);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.38);
    }


    public playCombo(comboCount: number = 1) {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const baseFreq = 440 * Math.pow(1.05946, Math.min(comboCount * 2, 16));

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.18);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.24);
    }

    public playTeamSpark() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Two harmonious sweeping oscillators (Chimpu Coral tone + Byte Cyan tone)
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.33, now + 0.4);

            gain.gain.setValueAtTime(0.18, now + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + idx * 0.04);
            osc.stop(now + 0.52);
        });
    }

    public playCrowdCheer() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        // Bandpass noise simulation
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900, now);
        filter.Q.setValueAtTime(1.8, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        whiteNoise.start(now);
        whiteNoise.stop(now + 0.82);
    }

    public playBadgeEarned() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        // Fanfare notes: C5, E5, G5, C6
        const fanfare = [523.25, 659.25, 783.99, 1046.50];
        const times = [0, 0.12, 0.24, 0.40];

        fanfare.forEach((freq, idx) => {
            if (!this.ctx || !this.sfxGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + times[idx]);

            const dur = idx === fanfare.length - 1 ? 0.7 : 0.18;
            gain.gain.setValueAtTime(0.25, now + times[idx]);
            gain.gain.exponentialRampToValueAtTime(0.001, now + times[idx] + dur);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + times[idx]);
            osc.stop(now + times[idx] + dur + 0.05);
        });
    }

    public playFireworks() {
        this.resumeContext();
        if (!this.ctx || !this.sfxGain || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    // --- PROCEDURAL SPORTS BGM LOOP ---

    public startSportsBGM() {
        if (this.isBgmPlaying) return;
        this.resumeContext();
        this.isBgmPlaying = true;
        this.currentBgmStep = 0;

        const bpm = 124;
        const stepInterval = (60 / bpm) / 4 * 1000; // 16th note step in ms

        // Pentatonic sports groove sequence
        const bassLine = [
            130.81, 0, 130.81, 0, 155.56, 0, 174.61, 0,
            130.81, 0, 130.81, 130.81, 196.00, 0, 174.61, 0
        ];
        const leadLine = [
            523.25, 0, 659.25, 0, 783.99, 880.00, 783.99, 0,
            659.25, 0, 523.25, 0, 392.00, 440.00, 523.25, 0
        ];

        this.bgmTimer = window.setInterval(() => {
            if (!this.isBgmPlaying || !this.ctx || !this.bgmGain || this.isMuted) return;

            const now = this.ctx.currentTime;
            const step = this.currentBgmStep % 16;

            // Bass synth
            const bassFreq = bassLine[step];
            if (bassFreq > 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'sawtooth';
                bOsc.frequency.setValueAtTime(bassFreq, now);

                const bFilter = this.ctx.createBiquadFilter();
                bFilter.type = 'lowpass';
                bFilter.frequency.setValueAtTime(450, now);

                bGain.gain.setValueAtTime(0.14, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

                bOsc.connect(bFilter);
                bFilter.connect(bGain);
                bGain.connect(this.bgmGain);

                bOsc.start(now);
                bOsc.stop(now + 0.18);
            }

            // Lead synth
            const leadFreq = leadLine[step];
            if (leadFreq > 0 && Math.floor(this.currentBgmStep / 16) % 2 === 1) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                lOsc.type = 'triangle';
                lOsc.frequency.setValueAtTime(leadFreq, now);

                lGain.gain.setValueAtTime(0.08, now);
                lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

                lOsc.connect(lGain);
                lGain.connect(this.bgmGain);

                lOsc.start(now);
                lOsc.stop(now + 0.15);
            }

            // Hi-hat tick every 2 steps
            if (step % 2 === 0) {
                const hBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
                const data = hBuffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2;

                const hSource = this.ctx.createBufferSource();
                hSource.buffer = hBuffer;

                const hFilter = this.ctx.createBiquadFilter();
                hFilter.type = 'highpass';
                hFilter.frequency.setValueAtTime(7000, now);

                const hGain = this.ctx.createGain();
                hGain.gain.setValueAtTime(0.06, now);
                hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                hSource.connect(hFilter);
                hFilter.connect(hGain);
                hGain.connect(this.bgmGain);

                hSource.start(now);
                hSource.stop(now + 0.04);
            }

            this.currentBgmStep++;
        }, stepInterval);
    }

    public stopSportsBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer !== null) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}
