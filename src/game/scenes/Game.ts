import { Scene } from 'phaser';
import { GameDataManager } from '../services/GameDataManager';
import { TeamUpRelayFeature, RelayHUDState } from '../features/TeamUpRelayFeature';
import { AudioManager } from '../services/AudioManager';

export class Game extends Scene {
    private currentLevel: number = 1;
    private relayFeature: TeamUpRelayFeature | null = null;
    private isGameFinished: boolean = false;

    constructor() {
        super('Game');
    }

    init(data: { level?: number }) {
        this.currentLevel = data.level || 1;
        this.isGameFinished = false;
    }

    create() {
        // 1. Play sports BGM
        try {
            AudioManager.getInstance().playMusic('sports_bgm');
        } catch (e) {
            // Audio fallback handled in AudioManager
        }

        // 2. Launch UI Scene in parallel
        this.scene.launch('UIScene', { gameScene: this, level: this.currentLevel });
        this.scene.bringToTop('UIScene');

        // 3. Register Event Listeners from UI
        this.events.on('pause-game', this.onPauseGame, this);
        this.events.on('resume-game', this.onResumeGame, this);
        this.events.on('restart-game', this.onRestartGame, this);
        this.events.on('quit-game', this.onQuitGame, this);
        this.events.on('home-game', this.onHomeGame, this);
        this.events.on('relay-player-action', this.onPlayerAction, this);
        this.events.on('shutdown', this.cleanup, this);

        // 4. Initialize Core Team-Up Relay Gameplay Feature
        this.relayFeature = new TeamUpRelayFeature(
            this,
            this.currentLevel,
            (hudState: RelayHUDState) => {
                this.events.emit('update-relay-hud', hudState);
            },
            (result) => {
                this.onLevelComplete(result);
            }
        );
    }

    update(time: number, delta: number) {
        if (this.relayFeature) {
            this.relayFeature.update(time, delta);
        }
    }

    private onPlayerAction(leader: 'chimpu' | 'byte') {
        if (this.relayFeature) {
            this.relayFeature.handleActionFromUI(leader);
        }
    }

    private onPauseGame() {
        if (this.relayFeature) {
            this.relayFeature.pause();
        }
    }

    private onResumeGame() {
        if (this.relayFeature) {
            this.relayFeature.resume();
        }
    }


    private onRestartGame(data?: { level?: number }) {
        const nextLevel = data?.level || this.currentLevel;
        this.cleanup();
        this.scene.stop('UIScene');
        this.scene.restart({ level: nextLevel });
    }

    private onQuitGame() {
        this.cleanup();
        this.scene.stop('UIScene');
        this.scene.start('LevelSelection');
    }

    private onHomeGame() {
        this.cleanup();
        this.scene.stop('UIScene');
        this.scene.start('MainMenu');
    }

    private onLevelComplete(result: { score: number; maxCombo: number; level: number; badgeKey: string }) {
        if (this.isGameFinished) return;
        this.isGameFinished = true;

        // Save progress to GameDataManager
        const dataManager = GameDataManager.getInstance();
        dataManager.completeLevel(this.currentLevel, 3, result.score);

        // Notify UIScene to display Victory Celebration Modal
        this.events.emit('show-victory', {
            win: true,
            score: result.score,
            maxCombo: result.maxCombo,
            level: this.currentLevel,
            badgeKey: result.badgeKey
        });
    }

    private cleanup() {
        if (this.relayFeature) {
            this.relayFeature.destroy();
            this.relayFeature = null;
        }

        this.events.off('pause-game', this.onPauseGame, this);
        this.events.off('resume-game', this.onResumeGame, this);
        this.events.off('restart-game', this.onRestartGame, this);
        this.events.off('quit-game', this.onQuitGame, this);
        this.events.off('home-game', this.onHomeGame, this);
        this.events.off('relay-player-action', this.onPlayerAction, this);
    }
}
