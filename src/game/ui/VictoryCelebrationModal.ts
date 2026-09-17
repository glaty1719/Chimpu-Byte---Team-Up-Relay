import { Scene, GameObjects } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { GAME_LEVELS } from '../data/GateData';
import { AudioManager } from '../services/AudioManager';

export class VictoryCelebrationModal {
    private container: GameObjects.Container;
    private overlay: GameObjects.Rectangle;

    constructor(
        scene: Scene,
        levelNumber: number,
        score: number,
        maxCombo: number,
        onNext: () => void,
        onPlayAgain: () => void,
        onHome: () => void
    ) {
        const { width, height } = scene.scale;
        const levelConfig = GAME_LEVELS.find(l => l.levelNumber === levelNumber) || GAME_LEVELS[0];

        // Dark Modal Overlay
        this.overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
            .setDepth(UILayers.MODAL_BACKGROUND)
            .setInteractive();

        this.container = scene.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL)
            .setScale(0.7)
            .setAlpha(0);

        // Modal Frame Box
        const mw = 1060;
        const mh = 700;
        const bg = scene.add.graphics();

        // Outer glow
        bg.fillStyle(0xa855f7, 0.22);
        bg.fillRoundedRect(-mw / 2 - 14, -mh / 2 - 14, mw + 28, mh + 28, 40);

        // Panel background
        bg.fillStyle(0x0f172a, 0.98);
        bg.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, 32);
        bg.lineStyle(6, 0x00f2fe, 1);
        bg.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, 32);

        this.container.add(bg);

        // Title Ribbon (Enlarged)
        const title = scene.add.text(0, -mh / 2 + 65, '★★★ LEVEL COMPLETED ★★★', {
            fontFamily: 'Arial Black',
            fontSize: '66px',
            color: '#facc15',
            stroke: '#000000',
            strokeThickness: 9
        }).setOrigin(0.5);
        this.container.add(title);

        // Subtitle (Enlarged)
        const levelSub = scene.add.text(0, -mh / 2 + 135, levelConfig.title, {
            fontFamily: 'Arial Black',
            fontSize: '40px',
            color: '#38bdf8',
            stroke: '#0369a1',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(levelSub);

        // Centered Stats Box
        const statsBox = scene.add.graphics();
        statsBox.fillStyle(0x1e293b, 0.95);
        statsBox.fillRoundedRect(-380, -75, 760, 240, 24);
        statsBox.lineStyle(3.5, 0x00f2fe, 0.75);
        statsBox.strokeRoundedRect(-380, -75, 760, 240, 24);
        this.container.add(statsBox);

        // Stats Texts (Enlarged)
        const scoreText = scene.add.text(0, -20, `Total Score: ${score}`, {
            fontFamily: 'Arial Black',
            fontSize: '50px',
            color: '#4ade80',
            stroke: '#064e3b',
            strokeThickness: 5
        }).setOrigin(0.5);

        const comboText = scene.add.text(0, 40, `Max Streak: ${maxCombo}x Combo`, {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#38bdf8',
            stroke: '#0c4a6e',
            strokeThickness: 4
        }).setOrigin(0.5);

        const teamSparkText = scene.add.text(0, 100, `Team Chemistry: 100% Spark!`, {
            fontFamily: 'Arial Black',
            fontSize: '38px',
            color: '#c084fc',
            stroke: '#4a044e',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.container.add([scoreText, comboText, teamSparkText]);

        // Action Buttons
        const hasNextLevel = levelNumber < 3;
        const buttonY = 255;

        if (hasNextLevel) {
            // 3 Buttons: Home, Play Again, Next Level
            const btnW = 290;
            const btnH = 76;
            const fontSize = '28px';

            // 1. Home Button
            this.createButton(scene, -320, buttonY, btnW, btnH, 0x475569, 0x94a3b8, '🏠 HOME', fontSize, onHome);

            // 2. Play Again Button
            this.createButton(scene, 0, buttonY, btnW, btnH, 0x2563eb, 0x38bdf8, '🔄 PLAY AGAIN', fontSize, onPlayAgain);

            // 3. Next Level Button
            this.createButton(scene, 320, buttonY, btnW, btnH, 0x10b981, 0x34d399, 'NEXT LEVEL ▶', fontSize, onNext);
        } else {
            // 2 Buttons (Final Level): Home, Play Again
            const btnW = 340;
            const btnH = 76;
            const fontSize = '32px';

            // 1. Home Button
            this.createButton(scene, -190, buttonY, btnW, btnH, 0x475569, 0x94a3b8, '🏠 HOME', fontSize, onHome);

            // 2. Play Again Button
            this.createButton(scene, 190, buttonY, btnW, btnH, 0x2563eb, 0x38bdf8, '🔄 PLAY AGAIN', fontSize, onPlayAgain);
        }

        // Pop in animation
        scene.tweens.add({
            targets: this.container,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });
    }

    private createButton(
        scene: Scene,
        x: number,
        y: number,
        w: number,
        h: number,
        bgColor: number,
        borderColor: number,
        label: string,
        fontSize: string,
        onClick: () => void
    ) {
        const btnCont = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
        bg.lineStyle(4, borderColor, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
        btnCont.add(bg);

        const text = scene.add.text(0, 0, label, {
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            color: '#ffffff',
            stroke: '#0f172a',
            strokeThickness: 4
        }).setOrigin(0.5);
        btnCont.add(text);

        const hit = scene.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => {
            AudioManager.getInstance().playSFX('button_tap');
            this.destroy();
            onClick();
        });
        hit.on('pointerover', () => {
            btnCont.setScale(1.05);
        });
        hit.on('pointerout', () => {
            btnCont.setScale(1.0);
        });
        btnCont.add(hit);

        this.container.add(btnCont);
    }

    public destroy() {
        this.overlay.destroy();
        this.container.destroy();
    }
}
