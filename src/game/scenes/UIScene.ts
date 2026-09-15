import { Scene } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { PausePanel } from '../ui/PausePanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { GameOverPanel } from '../ui/GameOverPanel';

export class UIScene extends Scene {
    private pauseButton: any;
    private settingsButton: any;
    private gameOverPanel: GameOverPanel | null = null;

    private gameScene: Scene;
    private gameEvents: Phaser.Events.EventEmitter;

    constructor() {
        super({ key: 'UIScene' });
    }

    init(data: { gameScene: Scene }) {
        this.gameScene = data.gameScene;
        this.gameEvents = this.gameScene.events;
    }

    create() {
        this.input.setTopOnly(true);

        this.setupButtons();

        this.gameEvents.on('show-gameover', this.showGameOver, this);
        this.gameEvents.on('update-hud', this.onUpdateHUD, this);
        this.gameEvents.on('tutorial-started', this.disableTopButtonsOnly, this);
        this.gameEvents.on('tutorial-ended', this.enableTopButtonsOnly, this);

        this.events.on('shutdown', () => {
            if (this.scoreText) {
                this.scoreText.destroy();
                this.scoreText = undefined;
            }
            if (this.gameOverPanel) {
                this.gameOverPanel.destroy();
                this.gameOverPanel = null;
            }
            if (this.gameEvents) {
                this.gameEvents.off('show-gameover', this.showGameOver, this);
                this.gameEvents.off('update-hud', this.onUpdateHUD, this);
                this.gameEvents.off('tutorial-started', this.disableTopButtonsOnly, this);
                this.gameEvents.off('tutorial-ended', this.enableTopButtonsOnly, this);
            }
        });
    }

    private scoreText?: Phaser.GameObjects.Text;

    private onUpdateHUD(data: { collected: number, total: number, score?: number }) {
        if (!this.scoreText) {
            this.scoreText = this.add.text(this.scale.width / 2, 80, '', {
                fontFamily: 'Arial Black',
                fontSize: '36px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);
        }
        this.scoreText.setText(`Collected: ${data.collected} / ${data.total}`);
    }

    private showGameOver(data: { score: number; level: number; win: boolean }) {
        this.gameOverPanel?.destroy();
        this.disableTopButtonsOnly();

        const maxLevels = 3;
        const hasNextLevel = data.win && data.level < maxLevels;

        this.gameOverPanel = new GameOverPanel(
            this,
            data.win,
            data.level,
            () => {
                this.gameEvents.emit('restart-game', { level: data.level });
                this.enableTopButtonsOnly();
                this.gameOverPanel?.destroy();
                this.gameOverPanel = null;
            },
            () => {
                this.gameEvents.emit('quit-game');
                this.enableTopButtonsOnly();
                this.gameOverPanel?.destroy();
                this.gameOverPanel = null;
            },
            hasNextLevel ? () => {
                this.gameEvents.emit('restart-game', { level: data.level + 1 });
                this.enableTopButtonsOnly();
                this.gameOverPanel?.destroy();
                this.gameOverPanel = null;
            } : undefined
        );
    }

    private setupButtons() {
        // Slot 0 (1st button): Pause button -> (100, 100)
        const pausePos = UIPositions.getTopLeftButtonPos(0);
        this.pauseButton = new IconButton(
            this,
            pausePos.x,
            pausePos.y,
            'pause_icon',
            () => {
                this.gameEvents.emit('pause-game');
                new PausePanel(
                    this,
                    () => { this.gameEvents.emit('resume-game'); },
                    () => { this.gameEvents.emit('resume-game'); this.gameEvents.emit('restart-game'); },
                    () => { this.gameEvents.emit('resume-game'); this.gameEvents.emit('quit-game'); }
                );
            }
        );
        this.pauseButton.setDepth(UILayers.UI_BUTTONS);

        // Slot 1 (2nd button): Settings button -> (220, 100)
        const settingsPos = UIPositions.getTopLeftButtonPos(1);
        this.settingsButton = new IconButton(
            this,
            settingsPos.x,
            settingsPos.y,
            'settings_icon',
            () => {
                this.gameEvents.emit('pause-game');
                new SettingsPanel(this, () => {
                    this.gameEvents.emit('resume-game');
                });
            }
        );
        this.settingsButton.setDepth(UILayers.UI_BUTTONS);
    }

    private disableTopButtonsOnly() {
        this.pauseButton?.disable();
        this.settingsButton?.disable();
    }

    private enableTopButtonsOnly() {
        this.pauseButton?.enable();
        this.settingsButton?.enable();
    }
}

