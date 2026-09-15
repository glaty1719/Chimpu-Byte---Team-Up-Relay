import { GameObjects, Scene } from 'phaser';
import { AudioManager } from '../services/AudioManager';

export class LevelCard {
    public container: GameObjects.Container;
    private button: GameObjects.Sprite;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        level: number,
        isUnlocked: boolean,
        onClick: () => void
    ) {
        this.container = scene.add.container(x, y);

        // Frame 0 is unlocked, Frame 1 is locked (based on typical spritesheet order)
        this.button = scene.add.sprite(0, 0, 'level_btn', isUnlocked ? 0 : 1);
        this.container.add(this.button);

        // Level Number Text (always visible)
        const label = level === 0 ? 'Tutorial' : `${level}`;
        const fontSize = level === 0 ? '36px' : '110px';
        const levelText = scene.add.text(0, 0, label, {
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            color: '#caff00',
            stroke: '#732C15',
            strokeThickness: 8
        }).setOrigin(0.5);

        if (!isUnlocked) {
            levelText.setAlpha(0.5);
            this.button.setTint(0x999999);
        }

        this.container.add(levelText);

        if (isUnlocked) {
            // Interaction
            this.button.setInteractive({ useHandCursor: true });

            this.button.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('click');
                scene.tweens.add({
                    targets: this.container,
                    scale: 0.95,
                    duration: 100,
                    yoyo: true,
                    onComplete: onClick
                });
            });

            this.button.on('pointerover', () => {
                scene.tweens.add({
                    targets: this.container,
                    scale: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            });

            this.button.on('pointerout', () => {
                scene.tweens.add({
                    targets: this.container,
                    scale: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            });
        }
    }
}
