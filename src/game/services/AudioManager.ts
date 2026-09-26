import { Scene } from 'phaser';
import { SynthesizerAudio } from './SynthesizerAudio';

export class AudioManager {
    private static instance: AudioManager;

    private scene?: Scene;
    private currentMusic: Phaser.Sound.BaseSound | null = null;
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.5;
    private _isMusicMuted: boolean = false;
    private _isSFXMuted: boolean = false;

    private constructor() {
        // Load settings from localStorage
        this.loadSettings();
    }

    private loadSettings() {
        try {
            const savedMusicVolume = localStorage.getItem('audio_music_volume');
            const savedSFXVolume = localStorage.getItem('audio_sfx_volume');
            const savedMusicMuted = localStorage.getItem('audio_music_muted');
            const savedSFXMuted = localStorage.getItem('audio_sfx_muted');

            if (savedMusicVolume !== null) {
                this.musicVolume = parseFloat(savedMusicVolume);
            }
            if (savedSFXVolume !== null) {
                this.sfxVolume = parseFloat(savedSFXVolume);
            }
            if (savedMusicMuted !== null) {
                this._isMusicMuted = savedMusicMuted === 'true';
            }
            if (savedSFXMuted !== null) {
                this._isSFXMuted = savedSFXMuted === 'true';
            }
        } catch (e) {
            // localStorage not available or error reading
        }

        const synth = SynthesizerAudio.getInstance();
        synth.setBgmVolume(this.musicVolume);
        synth.setMusicMuted(this._isMusicMuted);
        synth.setSfxVolume(this.sfxVolume);
        synth.setSFXMuted(this._isSFXMuted);
    }

    private saveSettings() {
        try {
            localStorage.setItem('audio_music_volume', this.musicVolume.toString());
            localStorage.setItem('audio_sfx_volume', this.sfxVolume.toString());
            localStorage.setItem('audio_music_muted', this._isMusicMuted.toString());
            localStorage.setItem('audio_sfx_muted', this._isSFXMuted.toString());
        } catch (e) {
            // localStorage not available
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public init(scene: Scene) {
        this.scene = scene;
        const synth = SynthesizerAudio.getInstance();
        synth.init();
        synth.setBgmVolume(this.musicVolume);
        synth.setMusicMuted(this._isMusicMuted);
        synth.setSfxVolume(this.sfxVolume);
        synth.setSFXMuted(this._isSFXMuted);
    }

    public setMusicVolume(volume: number) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.currentMusic && !this._isMusicMuted) {
            (this.currentMusic as any).setVolume(this.musicVolume);
        }
        const synth = SynthesizerAudio.getInstance();
        synth.setBgmVolume(this.musicVolume);
        this.saveSettings();
    }

    public setSFXVolume(volume: number) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        const synth = SynthesizerAudio.getInstance();
        synth.setSfxVolume(this.sfxVolume);
        this.saveSettings();
    }

    public setMusicMuted(muted: boolean) {
        this._isMusicMuted = muted;
        if (this.currentMusic) {
            if (muted) {
                (this.currentMusic as any).setVolume(0);
            } else {
                (this.currentMusic as any).setVolume(this.musicVolume);
            }
        }
        const synth = SynthesizerAudio.getInstance();
        synth.setMusicMuted(muted);
        this.saveSettings();
    }

    public setSFXMuted(muted: boolean) {
        this._isSFXMuted = muted;
        const synth = SynthesizerAudio.getInstance();
        synth.setSFXMuted(muted);
        this.saveSettings();
    }

    public playMusic(key: string, loop: boolean = true) {
        if (this.scene && this.scene.cache.audio.exists(key)) {
            if (this.currentMusic) {
                if ((this.currentMusic as any).key === key && (this.currentMusic as any).isPlaying) {
                    return;
                }
                this.currentMusic.stop();
            }
            this.currentMusic = this.scene.sound.add(key, {
                loop: loop,
                volume: this._isMusicMuted ? 0 : this.musicVolume
            });
            this.currentMusic.play();
        } else {
            // Procedural Synthesizer BGM fallback
            const synth = SynthesizerAudio.getInstance();
            synth.setMusicMuted(this._isMusicMuted);
            synth.setBgmVolume(this.musicVolume);
            synth.startSportsBGM();
        }
    }

    public stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
        SynthesizerAudio.getInstance().stopSportsBGM();
    }

    public playSFX(key: string, volScale: number = 1.0) {
        if (this._isSFXMuted) return;

        if (this.scene && this.scene.cache.audio.exists(key)) {
            this.scene.sound.play(key, {
                volume: this.sfxVolume * volScale
            });
        } else {
            // Procedural Synthesizer SFX fallback
            const synth = SynthesizerAudio.getInstance();
            synth.setSfxVolume(this.sfxVolume * volScale);
            if (key === 'click' || key === 'button_tap') synth.playButtonTap();
            else if (key === 'dash') synth.playDash();
            else if (key === 'gate_break' || key === 'shatter') synth.playGateBreak();
            else if (key === 'bounce' || key === 'bumper') synth.playGentleBounce();
            else if (key === 'combo') synth.playCombo(Math.round(volScale * 5));
            else if (key === 'team_spark') synth.playTeamSpark();
            else if (key === 'cheer' || key === 'crowd') synth.playCrowdCheer();
            else if (key === 'badge') synth.playBadgeEarned();
            else if (key === 'fireworks') synth.playFireworks();
            else synth.playButtonTap();
        }
    }

    public getMusicVolume(): number { return this.musicVolume; }
    public getSFXVolume(): number { return this.sfxVolume; }
    public isMusicMuted(): boolean { return this._isMusicMuted; }
    public isSFXMuted(): boolean { return this._isSFXMuted; }
}

