import { GameObjects, Scene } from 'phaser';
import { IconButton } from './IconButton';
import { UILayers } from '../utils/UILayers';

export class GameOverPanel {
    private scene: Scene;
    private bgLayer: GameObjects.Container;
    private contentLayer: GameObjects.Container;
    private buttons: IconButton[] = [];

    constructor(
        scene: Scene,
        win: boolean,
        level: number | string,
        onRetry: () => void,
        onHome: () => void,
        onNext?: () => void
    ) {
        this.scene = scene;
        const { width, height } = scene.scale;

        // master container
        this.bgLayer = scene.add.container(0, 0)
            .setDepth(UILayers.MODAL_BACKGROUND)
            .setScrollFactor(0);

        // content layer
        this.contentLayer = scene.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL)
            .setScrollFactor(0);

        // Overlay
        const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
            .setInteractive();
        this.bgLayer.add(overlay);

        // Background Image
        const bgTexture = win ? 'game_completed_bg' : 'game_over_bg';
        const panelBg = scene.add.image(0, 0, bgTexture);
        this.contentLayer.add(panelBg);

        // Circular Buttons
        const buttonSpacing = win ? 170 : 200;
        const buttonY = win ? 220 : 200;
        const levelTextPos = 140;

        if (win) {
            const levelStr = level === 0 ? 'Tutorial' : `Level ${level}`;
            const levelText = scene.add.text(0, levelTextPos, levelStr, {
                fontFamily: 'Arial Black',
                fontSize: '32px',
                color: '#FFFFFF',
                stroke: '#4D240E',
                strokeThickness: 6
            }).setOrigin(0.5);
            this.contentLayer.add(levelText);
        }

        if (win && onNext) {
            // Completed: Replay, Home, Next
            this.addLabeledButton(scene, -buttonSpacing, buttonY, 'retry_icon', 'REPLAY', () => {
                this.destroy();
                onRetry();
            });
            this.addLabeledButton(scene, 0, buttonY, 'home_icon', 'HOME', () => {
                this.destroy();
                onHome();
            });
            this.addLabeledButton(scene, buttonSpacing, buttonY, 'next_icon', 'NEXT', () => {
                this.destroy();
                onNext();
            });
        } else {
            // Game Over: Retry, Home
            this.addLabeledButton(scene, -buttonSpacing / 2, buttonY, 'retry_icon', 'RETRY', () => {
                this.destroy();
                onRetry();
            });
            this.addLabeledButton(scene, buttonSpacing / 2, buttonY, 'home_icon', 'HOME', () => {
                this.destroy();
                onHome();
            });
        }
    }

    private addLabeledButton(scene: Scene, x: number, y: number, texture: string, labelText: string, callback: () => void) {
        const btn = new IconButton(scene, x, y, texture, callback);
        const label = scene.add.text(x, y + 70, labelText, {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#FFFFFF',
            stroke: '#4D240E',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.buttons.push(btn);
        this.contentLayer.add([btn.sprite, label]);
    }

    public destroy() {
        this.scene.game.events.emit('tutorial-end');
        this.buttons.forEach(btn => btn.destroy());
        this.bgLayer.destroy();
        this.contentLayer.destroy();
    }
}
