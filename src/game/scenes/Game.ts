import { Scene } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { GameDataManager } from '../services/GameDataManager';
import { DemoTargetFeature } from '../features/DemoTargetFeature';

export class Game extends Scene {
    private currentLevel: number = 1;
    private score: number = 0;
    private targetFeature: DemoTargetFeature | null = null;
    private isGameFinished: boolean = false;

    constructor() {
        super('Game');
    }

    init(data: { level?: number }) {
        this.currentLevel = data.level || 1;
        this.score = 0;
        this.isGameFinished = false;
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background
        this.add.image(width / 2, height / 2, 'gameBG')
            .setDisplaySize(width, height)
            .setDepth(UILayers.GAME_BACKGROUND);

        // 2. Launch UI Scene in parallel
        this.scene.launch('UIScene', { gameScene: this });
        this.scene.bringToTop('UIScene');

        // 3. Register Event Listeners from UI
        this.events.on('pause-game', this.onPauseGame, this);
        this.events.on('resume-game', this.onResumeGame, this);
        this.events.on('restart-game', this.onRestartGame, this);
        this.events.on('quit-game', this.onQuitGame, this);

        this.events.on('shutdown', this.cleanup, this);

        // 4. Initialize Gameplay Feature
        const targetCount = 3 + (this.currentLevel * 2); // Scales with level
        this.targetFeature = new DemoTargetFeature(
            this,
            targetCount,
            (collected, total) => {
                this.score += 100;
                this.events.emit('update-hud', { collected, total, score: this.score });
            },
            () => {
                this.onLevelComplete();
            }
        );

        // Initial HUD trigger
        this.events.emit('update-hud', { collected: 0, total: targetCount, score: 0 });
    }

    private onPauseGame() {
        this.physics.pause();
    }

    private onResumeGame() {
        this.physics.resume();
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
        this.scene.start('MainMenu');
    }

    private onLevelComplete() {
        if (this.isGameFinished) return;
        this.isGameFinished = true;

        // Save progress to GameDataManager
        const dataManager = GameDataManager.getInstance();
        dataManager.completeLevel(this.currentLevel, 3, this.score);

        // Notify UIScene to display GameOver/Win panel
        this.events.emit('show-gameover', {
            win: true,
            score: this.score,
            level: this.currentLevel
        });
    }

    private cleanup() {
        if (this.targetFeature) {
            this.targetFeature.destroy();
            this.targetFeature = null;
        }

        this.events.off('pause-game', this.onPauseGame, this);
        this.events.off('resume-game', this.onResumeGame, this);
        this.events.off('restart-game', this.onRestartGame, this);
        this.events.off('quit-game', this.onQuitGame, this);
    }
}
