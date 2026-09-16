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
        onLevelSelect: () => void
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
        const mw = 900;
        const mh = 620;
        const bg = scene.add.graphics();

        // Outer glow
        bg.fillStyle(0xa855f7, 0.2);
        bg.fillRoundedRect(-mw / 2 - 12, -mh / 2 - 12, mw + 24, mh + 24, 36);

        // Panel background
        bg.fillStyle(0x0f172a, 0.98);
        bg.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, 28);
        bg.lineStyle(6, 0x00f2fe, 1);
        bg.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, 28);

        this.container.add(bg);

        // Title Ribbon
        const title = scene.add.text(0, -mh / 2 + 50, '★ RELAY VICTORY! ★', {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: '#facc15',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.container.add(title);

        const levelSub = scene.add.text(0, -mh / 2 + 105, levelConfig.title, {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#38bdf8'
        }).setOrigin(0.5);
        this.container.add(levelSub);

        // Badge Award Display
        if (scene.textures.exists(levelConfig.badgeKey)) {
            const badgeImg = scene.add.image(-260, -20, levelConfig.badgeKey)
                .setScale(1.1);
            this.container.add(badgeImg);

            // Badge pulse tween
            scene.tweens.add({
                targets: badgeImg,
                scale: 1.18,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            const badgeTitle = scene.add.text(-260, 80, levelConfig.badgeName, {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#facc15',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            this.container.add(badgeTitle);
        }

        // Stats Box
        const statsBox = scene.add.graphics();
        statsBox.fillStyle(0x1e293b, 0.9);
        statsBox.fillRoundedRect(-120, -110, 520, 160, 16);
        statsBox.lineStyle(2, 0x475569, 1);
        statsBox.strokeRoundedRect(-120, -110, 520, 160, 16);
        this.container.add(statsBox);

        const scoreText = scene.add.text(140, -75, `Total Score: ${score}`, {
            fontFamily: 'Arial Black',
            fontSize: '26px',
            color: '#4ade80'
        }).setOrigin(0.5);

        const comboText = scene.add.text(140, -35, `Max Streak: ${maxCombo}x Combo`, {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#38bdf8'
        }).setOrigin(0.5);

        const teamSparkText = scene.add.text(140, 5, `Team Chemistry: 100% Spark!`, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#c084fc'
        }).setOrigin(0.5);

        this.container.add([scoreText, comboText, teamSparkText]);

        // Educational Takeaway Card
        const eduBox = scene.add.graphics();
        eduBox.fillStyle(0x1e1b4b, 0.9);
        eduBox.fillRoundedRect(-mw / 2 + 40, 120, mw - 80, 100, 14);
        eduBox.lineStyle(2, 0xa855f7, 0.8);
        eduBox.strokeRoundedRect(-mw / 2 + 40, 120, mw - 80, 100, 14);
        this.container.add(eduBox);

        const eduLabel = scene.add.text(0, 140, '💡 KEY TAKEAWAY', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#facc15'
        }).setOrigin(0.5);

        const eduDesc = scene.add.text(0, 175, levelConfig.description, {
            fontFamily: 'Arial',
            fontSize: '19px',
            color: '#e2e8f0',
            align: 'center',
            wordWrap: { width: mw - 120 }
        }).setOrigin(0.5);

        this.container.add([eduLabel, eduDesc]);

        // Action Buttons
        const hasNextLevel = levelNumber < 3;
        const btnNextText = hasNextLevel ? 'NEXT LEVEL ▶' : 'PLAY AGAIN 🔄';

        // 1. Next Level Button
        const nextBtnBg = scene.add.graphics();
        nextBtnBg.fillStyle(0x10b981, 1);
        nextBtnBg.fillRoundedRect(60, 240, 260, 60, 14);
        nextBtnBg.lineStyle(3, 0xffffff, 1);
        nextBtnBg.strokeRoundedRect(60, 240, 260, 60, 14);

        const nextLabel = scene.add.text(190, 270, btnNextText, {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const nextHit = scene.add.zone(190, 270, 260, 60).setInteractive({ useHandCursor: true });
        nextHit.on('pointerdown', () => {
            AudioManager.getInstance().playSFX('button_tap');
            this.destroy();
            onNext();
        });

        // 2. Level Select Button
        const lvlBtnBg = scene.add.graphics();
        lvlBtnBg.fillStyle(0x3b82f6, 1);
        lvlBtnBg.fillRoundedRect(-320, 240, 260, 60, 14);
        lvlBtnBg.lineStyle(3, 0xffffff, 1);
        lvlBtnBg.strokeRoundedRect(-320, 240, 260, 60, 14);

        const lvlLabel = scene.add.text(-190, 270, 'LEVEL SELECT', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const lvlHit = scene.add.zone(-190, 270, 260, 60).setInteractive({ useHandCursor: true });
        lvlHit.on('pointerdown', () => {
            AudioManager.getInstance().playSFX('button_tap');
            this.destroy();
            onLevelSelect();
        });

        this.container.add([nextBtnBg, nextLabel, nextHit, lvlBtnBg, lvlLabel, lvlHit]);

        // Pop in animation
        scene.tweens.add({
            targets: this.container,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });
    }

    public destroy() {
        this.overlay.destroy();
        this.container.destroy();
    }
}
