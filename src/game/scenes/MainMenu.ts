import { Scene, GameObjects } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { SpriteButton } from '../ui/SpriteButton';
import { AudioManager } from '../services/AudioManager';

export class MainMenu extends Scene {
    background: GameObjects.Rectangle;
    gradientBg: GameObjects.Rectangle[];
    title: GameObjects.Text;
    titleShadow: GameObjects.Text;
    particles: Phaser.GameObjects.Particles.ParticleEmitter[];

    constructor() {
        super('MainMenu');
    }

    create() {

        const { width, height } = this.scale;

        // Background Image
        this.add.image(width / 2, height / 2, 'bg')
            .setDisplaySize(width, height)
            .setDepth(UILayers.GAME_BACKGROUND);

        const playBtnX = width - 260;
        const playBtnY = height - 210;

        let isStarting = false;
        const startGame = () => {
            if (isStarting) return;
            isStarting = true;
            AudioManager.getInstance().playSFX('click', 0.7);
            this.scene.start('LevelSelection');
        };

        const playBtn = new SpriteButton(
            this,
            playBtnX,
            playBtnY,
            'playButton',
            startGame
        ).setDepth(UILayers.UI_BUTTONS).setScale(0.38);

        // 'Play Now' text styled to blend with the orange & gold button theme
        const playText = this.add.text(playBtnX, playBtnY + 105, 'Play Now', {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '34px',
            color: '#FFB800',
            stroke: '#1A0B02',
            strokeThickness: 6,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#FF8800',
                blur: 8,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(UILayers.UI_ICONS);

        playText.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.tweens.add({
                    targets: [playBtn.sprite, playText],
                    scaleX: '*=0.92',
                    scaleY: '*=0.92',
                    duration: 80,
                    yoyo: true,
                    onComplete: () => startGame()
                });
            });

        // Synchronized pulse animation for both button and text
        this.tweens.add({
            targets: playBtn.sprite,
            scale: 0.42,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: playText,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Settings button
        this.addSettingsButton();

        // Play BGM
        try {
            AudioManager.getInstance().playMusic('bg_music');
        } catch (e) {
            // Error playing music
        }
    }

    private addSettingsButton() {
        const pos = UIPositions.getTopLeftButtonPos(0); // 1st button -> (100, 100)
        const settingsBtn = new IconButton(
            this,
            pos.x,
            pos.y,
            'settings_icon',
            () => {
                new SettingsPanel(this, () => { });
            }
        );
        settingsBtn.setDepth(UILayers.UI_BUTTONS);
    }
}
