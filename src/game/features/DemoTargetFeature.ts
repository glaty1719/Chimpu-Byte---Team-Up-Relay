import { Scene, GameObjects } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';

/**
 * Demo Feature: Target Spawner & Click Collector
 * Demonstrates feature-based gameplay logic decoupled from the Game scene.
 */
export class DemoTargetFeature {
    private scene: Scene;
    private targets: GameObjects.Sprite[] = [];
    private onCollectCallback: (collected: number, total: number) => void;
    private onCompleteCallback: () => void;

    private collectedCount: number = 0;
    private totalTargets: number = 5;
    private isDestroyed: boolean = false;

    constructor(
        scene: Scene,
        totalTargets: number = 5,
        onCollect: (collected: number, total: number) => void,
        onComplete: () => void
    ) {
        this.scene = scene;
        this.totalTargets = totalTargets;
        this.onCollectCallback = onCollect;
        this.onCompleteCallback = onComplete;

        this.spawnTargets();
    }

    private spawnTargets() {
        const { width, height } = this.scene.scale;

        for (let i = 0; i < this.totalTargets; i++) {
            // Random positions with padding
            const x = Phaser.Math.Between(200, width - 200);
            const y = Phaser.Math.Between(250, height - 200);

            // Create target sprite with character texture
            const target = this.scene.add.sprite(x, y, 'chimpu_run')
                .setScale(0.9)
                .setDepth(UILayers.GAME_PLAYER)
                .setInteractive({ useHandCursor: true });

            // Play run animation
            target.play('run');

            // Float / bob animation
            this.scene.tweens.add({
                targets: target,
                y: y - 25,
                duration: Phaser.Math.Between(800, 1400),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Click / Collect interaction
            target.once('pointerdown', () => {
                this.collectTarget(target);
            });

            this.targets.push(target);
        }
    }

    private collectTarget(target: GameObjects.Sprite) {
        if (this.isDestroyed) return;

        AudioManager.getInstance().playSFX('click');
        this.collectedCount++;

        // Pop & fade animation on collect
        this.scene.tweens.add({
            targets: target,
            scale: 1.4,
            alpha: 0,
            y: target.y - 50,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                target.destroy();
            }
        });

        // Notify HUD
        this.onCollectCallback(this.collectedCount, this.totalTargets);

        // Check level completion
        if (this.collectedCount >= this.totalTargets) {
            this.scene.time.delayedCall(500, () => {
                if (!this.isDestroyed) {
                    this.onCompleteCallback();
                }
            });
        }
    }

    public destroy() {
        this.isDestroyed = true;
        this.targets.forEach(t => t.destroy());
        this.targets = [];
    }
}
