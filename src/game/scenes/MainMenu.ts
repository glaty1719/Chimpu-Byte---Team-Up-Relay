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

        let isStarting = false;
        const playBtn = new SpriteButton(
            this,
            width / 2,
            height / 2 + 100,
            'playButton',
            () => {
                if (isStarting) return;
                isStarting = true;
                this.scene.start('LevelSelection');
            }
        ).setDepth(UILayers.UI_BUTTONS).setScale(1);

        // Pulse animation
        this.tweens.add({
            targets: playBtn.sprite,
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
