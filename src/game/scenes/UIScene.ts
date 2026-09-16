import { Scene, GameObjects } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { PausePanel } from '../ui/PausePanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { VictoryCelebrationModal } from '../ui/VictoryCelebrationModal';
import { RelayHUDState } from '../features/TeamUpRelayFeature';

export class UIScene extends Scene {
    private pauseButton!: IconButton;
    private settingsButton!: IconButton;
    private victoryModal: VictoryCelebrationModal | null = null;

    private gameScene!: Scene;
    private gameEvents!: Phaser.Events.EventEmitter;

    // Top HUD UI Elements
    private levelTitleText!: GameObjects.Text;
    private gateProgressText!: GameObjects.Text;
    private scoreText!: GameObjects.Text;
    private comboText!: GameObjects.Text;
    private teamSparkBar!: GameObjects.Graphics;


    // Bottom Action Buttons (Chimpu & Byte)
    private chimpuBtnContainer!: GameObjects.Container;
    private byteBtnContainer!: GameObjects.Container;
    private chimpuHitZone!: GameObjects.Zone;
    private byteHitZone!: GameObjects.Zone;
    private chimpuGlowTween: Phaser.Tweens.Tween | null = null;
    private byteGlowTween: Phaser.Tweens.Tween | null = null;


    // Level 3 Bottom Info Text
    private level3InfoContainer!: GameObjects.Container;

    // Tutorial Helper Hand/Pointer
    private tutorialPointer!: GameObjects.Container;

    constructor() {
        super({ key: 'UIScene' });
    }

    init(data: { gameScene: Scene }) {
        this.gameScene = data.gameScene;
        this.gameEvents = this.gameScene.events;
    }

    create() {
        this.input.setTopOnly(true);

        this.setupTopHUD();
        this.setupActionButtons();
        this.setupBottomInfoText();
        this.setupTutorialPointer();
        this.setupTopButtons();

        this.gameEvents.on('update-relay-hud', this.onUpdateRelayHUD, this);
        this.gameEvents.on('show-victory', this.showVictoryCelebration, this);

        this.events.on('shutdown', () => {
            this.cleanup();
        });
    }

    private setupTopHUD() {
        const { width } = this.scale;

        // Top Right: Level & Gate Progress Box (Positioned in Top-Right to prevent overlap with Top-Left toolbar)
        const rightBoxX = width - 400;
        const rightBox = this.add.graphics().setDepth(UILayers.UI_BACKGROUND_PANELS);
        rightBox.fillStyle(0x0f172a, 0.9);
        rightBox.fillRoundedRect(rightBoxX, 30, 360, 90, 16);
        rightBox.lineStyle(3, 0x38bdf8, 0.9);
        rightBox.strokeRoundedRect(rightBoxX, 30, 360, 90, 16);

        this.levelTitleText = this.add.text(rightBoxX + 20, 45, 'Level 1: Pick the Leader', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#ffffff'
        }).setDepth(UILayers.UI_TEXT);

        this.gateProgressText = this.add.text(rightBoxX + 20, 80, 'Gate: 1 / 10', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#facc15'
        }).setDepth(UILayers.UI_TEXT);

        // Top Center: Team Spark & Combo Meter Box
        const centerBox = this.add.graphics().setDepth(UILayers.UI_BACKGROUND_PANELS);
        centerBox.fillStyle(0x0f172a, 0.92);
        centerBox.fillRoundedRect(width / 2 - 240, 24, 480, 96, 18);
        centerBox.lineStyle(3, 0xa855f7, 0.9);
        centerBox.strokeRoundedRect(width / 2 - 240, 24, 480, 96, 18);

        this.add.text(width / 2 - 210, 38, '⚡ TEAM SPARK', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#c084fc'
        }).setDepth(UILayers.UI_TEXT);

        this.comboText = this.add.text(width / 2 + 210, 38, 'COMBO x1', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#38bdf8'
        }).setOrigin(1, 0).setDepth(UILayers.UI_TEXT);

        this.teamSparkBar = this.add.graphics().setDepth(UILayers.UI_TEXT);
        this.drawSparkBar(0);

        // Score in Top Center (increased size and generous top padding)
        this.scoreText = this.add.text(width / 2, 158, 'SCORE: 0', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#4ade80',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);
    }

    private drawSparkBar(percent: number) {
        const { width } = this.scale;
        const bx = width / 2 - 210;
        const by = 72;
        const bw = 420;
        const bh = 24;

        this.teamSparkBar.clear();
        // Background track
        this.teamSparkBar.fillStyle(0x1e1b4b, 1);
        this.teamSparkBar.fillRoundedRect(bx, by, bw, bh, 8);
        this.teamSparkBar.lineStyle(1.5, 0x6366f1, 0.4);
        this.teamSparkBar.strokeRoundedRect(bx, by, bw, bh, 8);

        // Filled gradient bar
        const clamped = Math.min(100, Math.max(0, percent));
        if (clamped > 0) {
            const fillW = Math.max(10, (bw - 4) * (clamped / 100));
            this.teamSparkBar.fillStyle(0xa855f7, 1);
            this.teamSparkBar.fillRoundedRect(bx + 2, by + 2, fillW, bh - 4, 6);

            // Top highlight line
            this.teamSparkBar.fillStyle(0xf0abfc, 0.8);
            this.teamSparkBar.fillRect(bx + 4, by + 4, fillW - 8, 4);
        }
    }

    private setupActionButtons() {
        const { width, height } = this.scale;
        const btnY = height - 105;
        const btnW = 390;
        const btnH = 120;

        // 1. Chimpu Button (Bottom-Left: Large Chimpu button with Heart and Person symbols)
        const chimpuX = width - 245;
        this.chimpuBtnContainer = this.add.container(chimpuX, btnY).setDepth(UILayers.UI_BUTTONS);

        const chGlow = this.add.graphics();
        chGlow.fillStyle(0xff6b6b, 0.35);
        chGlow.fillRoundedRect(-btnW / 2 - 10, -btnH / 2 - 10, btnW + 20, btnH + 20, 26);
        this.chimpuBtnContainer.add(chGlow);

        const chBg = this.add.graphics();
        // Deep vibrant coral/rose plate
        chBg.fillStyle(0xff477e, 0.96);
        chBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        // Top highlight
        chBg.fillStyle(0xff758f, 0.6);
        chBg.fillRoundedRect(-btnW / 2 + 4, -btnH / 2 + 4, btnW - 8, btnH / 2 - 4, 18);
        // Golden accent border
        chBg.lineStyle(5, 0xffd166, 1);
        chBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        this.chimpuBtnContainer.add(chBg);

        // Avatar Icon
        if (this.textures.exists('avatar_chimpu')) {
            const chAvatar = this.add.image(-btnW / 2 + 56, 0, 'avatar_chimpu').setScale(0.9);
            this.chimpuBtnContainer.add(chAvatar);
        }

        // Titles & Subtitles (centered horizontally & vertically with enlarged font)
        const chTitle = this.add.text(0, 0, 'CHIMPU', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.chimpuBtnContainer.add(chTitle);

        // Heart and Person Symbol Badge on Chimpu Button
        if (this.textures.exists('symbol_heart') && this.textures.exists('symbol_person')) {
            const symBg = this.add.graphics();
            symBg.fillStyle(0x4c0519, 0.8);
            symBg.fillRoundedRect(btnW / 2 - 100, -28, 92, 56, 14);
            symBg.lineStyle(2, 0xffd166, 0.8);
            symBg.strokeRoundedRect(btnW / 2 - 100, -28, 92, 56, 14);
            this.chimpuBtnContainer.add(symBg);

            const heartIcon = this.add.image(btnW / 2 - 77, 0, 'symbol_heart').setScale(0.58);
            const personIcon = this.add.image(btnW / 2 - 32, 0, 'symbol_person').setScale(0.58);
            this.chimpuBtnContainer.add([heartIcon, personIcon]);
        }

        // Chimpu Button Interaction
        this.chimpuHitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        this.chimpuHitZone.on('pointerdown', () => {
            this.animateButtonPress(this.chimpuBtnContainer);
            this.gameEvents.emit('relay-player-action', 'chimpu');
        });
        this.chimpuBtnContainer.add(this.chimpuHitZone);

        // 2. Byte Button (Bottom-Right: Large Byte button with Microchip symbol)
        const byteX = 245;
        this.byteBtnContainer = this.add.container(byteX, btnY).setDepth(UILayers.UI_BUTTONS);

        const byGlow = this.add.graphics();
        byGlow.fillStyle(0x00f2fe, 0.35);
        byGlow.fillRoundedRect(-btnW / 2 - 10, -btnH / 2 - 10, btnW + 20, btnH + 20, 26);
        this.byteBtnContainer.add(byGlow);

        const byBg = this.add.graphics();
        // Deep electric blue plate
        byBg.fillStyle(0x0284c7, 0.96);
        byBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        // Top highlight
        byBg.fillStyle(0x38bdf8, 0.6);
        byBg.fillRoundedRect(-btnW / 2 + 4, -btnH / 2 + 4, btnW - 8, btnH / 2 - 4, 18);
        // Electric Cyan border
        byBg.lineStyle(5, 0x00f2fe, 1);
        byBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 22);
        this.byteBtnContainer.add(byBg);

        // Avatar Icon
        if (this.textures.exists('avatar_byte')) {
            const byAvatar = this.add.image(-btnW / 2 + 56, 0, 'avatar_byte').setScale(0.9);
            this.byteBtnContainer.add(byAvatar);
        }

        // Titles & Subtitles (centered horizontally & vertically with enlarged font)
        const byTitle = this.add.text(0, 0, 'BYTE', {
            fontFamily: 'Arial Black',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.byteBtnContainer.add(byTitle);

        // Microchip Symbol on Byte Button
        if (this.textures.exists('symbol_microchip')) {
            const symBg = this.add.graphics();
            symBg.fillStyle(0x082f49, 0.8);
            symBg.fillRoundedRect(btnW / 2 - 86, -28, 76, 56, 14);
            symBg.lineStyle(2, 0x00f2fe, 0.8);
            symBg.strokeRoundedRect(btnW / 2 - 86, -28, 76, 56, 14);
            this.byteBtnContainer.add(symBg);

            const chipIcon = this.add.image(btnW / 2 - 48, 0, 'symbol_microchip').setScale(0.72);
            this.byteBtnContainer.add(chipIcon);
        }

        // Byte Button Interaction
        this.byteHitZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        this.byteHitZone.on('pointerdown', () => {
            this.animateButtonPress(this.byteBtnContainer);
            this.gameEvents.emit('relay-player-action', 'byte');
        });
        this.byteBtnContainer.add(this.byteHitZone);
    }

    private setupBottomInfoText() {
        const { width, height } = this.scale;
        this.level3InfoContainer = this.add.container(width / 2, height - 105)
            .setDepth(UILayers.UI_BUTTONS)
            .setVisible(false);

        const infoBg = this.add.graphics();
        infoBg.fillStyle(0x0f172a, 0.92);
        infoBg.fillRoundedRect(-280, -32, 560, 64, 18);
        infoBg.lineStyle(2.5, 0xa855f7, 0.85);
        infoBg.strokeRoundedRect(-280, -32, 560, 64, 18);

        const infoText = this.add.text(0, 0, 'Tap Chimpu and Byte in the correct sequence', {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: '#f0abfc',
            align: 'center'
        }).setOrigin(0.5);

        this.level3InfoContainer.add([infoBg, infoText]);
    }

    private setupTutorialPointer() {
        this.tutorialPointer = this.add.container(0, 0)
            .setDepth(UILayers.OVERLAY_PANEL + 10)
            .setVisible(false);

        // Inner container for smooth relative bouncing without mutating parent container coordinates
        const pointerBody = this.add.container(0, 0);

        // Glowing backdrop pill/bubble with pointer arrow
        const pointerBg = this.add.graphics();
        // Golden outer glow
        pointerBg.fillStyle(0xf59e0b, 0.45);
        pointerBg.fillRoundedRect(-82, -42, 164, 60, 20);

        // Solid vibrant gold badge
        pointerBg.fillStyle(0xfbbf24, 1);
        pointerBg.fillRoundedRect(-76, -37, 152, 50, 16);
        pointerBg.lineStyle(4, 0xffffff, 1);
        pointerBg.strokeRoundedRect(-76, -37, 152, 50, 16);

        // Downward pointer arrow triangle
        pointerBg.fillStyle(0xfbbf24, 1);
        pointerBg.beginPath();
        pointerBg.moveTo(-16, 13);
        pointerBg.lineTo(16, 13);
        pointerBg.lineTo(0, 30);
        pointerBg.closePath();
        pointerBg.fillPath();

        // Downward arrow border
        pointerBg.lineStyle(4, 0xffffff, 1);
        pointerBg.beginPath();
        pointerBg.moveTo(-16, 13);
        pointerBg.lineTo(0, 30);
        pointerBg.lineTo(16, 13);
        pointerBg.strokePath();

        const pointerText = this.add.text(0, -12, '👇 TAP HERE!', {
            fontFamily: 'Arial Black',
            fontSize: '19px',
            color: '#0f172a'
        }).setOrigin(0.5);

        pointerBody.add([pointerBg, pointerText]);
        this.tutorialPointer.add(pointerBody);

        // Relative floating bounce on inner pointerBody
        this.tweens.add({
            targets: pointerBody,
            y: -16,
            duration: 450,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private animateButtonPress(container: GameObjects.Container) {
        this.tweens.add({
            targets: container,
            scale: 0.92,
            duration: 80,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    private onUpdateRelayHUD(state: RelayHUDState) {
        this.levelTitleText.setText(state.levelTitle);
        this.gateProgressText.setText(`Gate: ${state.gateIndex} / ${state.totalGates}`);
        this.scoreText.setText(`SCORE: ${state.score}`);
        
        if (state.combo >= 2) {
            this.comboText.setText(`COMBO x${state.combo} 🔥`);
            this.comboText.setColor('#facc15');
        } else {
            this.comboText.setText(`COMBO x${Math.max(1, state.combo)}`);
            this.comboText.setColor('#38bdf8');
        }

        this.drawSparkBar(state.teamSpark);

        // Level 3 Bottom Info Text (appears after gate spawns and is ready, disappears as soon as gate shatters)
        const showBottomInfo = (state.levelNumber === 3 || state.isTeamGate) && state.isInputEnabled;
        this.level3InfoContainer?.setVisible(showBottomInfo);

        // Action buttons interactive state and visual opacity
        if (state.isInputEnabled) {
            this.chimpuHitZone?.setInteractive({ useHandCursor: true });
            this.byteHitZone?.setInteractive({ useHandCursor: true });
            this.chimpuBtnContainer?.setAlpha(1.0);
            this.byteBtnContainer?.setAlpha(1.0);
        } else {
            this.chimpuHitZone?.disableInteractive();
            this.byteHitZone?.disableInteractive();
            this.chimpuBtnContainer?.setAlpha(0.45);
            this.byteBtnContainer?.setAlpha(0.45);
        }

        // Tutorial / Hint pulse (shown only when gate is spawned in position and input is enabled)
        if (state.isTutorial && state.tutorialTarget && state.isInputEnabled) {
            this.showTutorialGuidance(state.tutorialTarget);
        } else {
            this.hideTutorialGuidance();
        }
    }


    private showTutorialGuidance(target: 'byte' | 'chimpu') {
        this.tutorialPointer.setVisible(true);
        if (target === 'byte') {
            this.tutorialPointer.setPosition(this.byteBtnContainer.x, this.byteBtnContainer.y - 95);
            this.pulseButton(this.byteBtnContainer, true);
            this.pulseButton(this.chimpuBtnContainer, false);
        } else {
            this.tutorialPointer.setPosition(this.chimpuBtnContainer.x, this.chimpuBtnContainer.y - 95);
            this.pulseButton(this.chimpuBtnContainer, true);
            this.pulseButton(this.byteBtnContainer, false);
        }
    }

    private hideTutorialGuidance() {
        this.tutorialPointer.setVisible(false);
        this.pulseButton(this.chimpuBtnContainer, false);
        this.pulseButton(this.byteBtnContainer, false);
    }

    private pulseButton(container: GameObjects.Container, enable: boolean) {
        if (enable) {
            if (container === this.chimpuBtnContainer && !this.chimpuGlowTween) {
                this.chimpuGlowTween = this.tweens.add({
                    targets: container,
                    scale: 1.08,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (container === this.byteBtnContainer && !this.byteGlowTween) {
                this.byteGlowTween = this.tweens.add({
                    targets: container,
                    scale: 1.08,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        } else {
            if (container === this.chimpuBtnContainer && this.chimpuGlowTween) {
                this.chimpuGlowTween.stop();
                this.chimpuGlowTween = null;
                container.setScale(1);
            } else if (container === this.byteBtnContainer && this.byteGlowTween) {
                this.byteGlowTween.stop();
                this.byteGlowTween = null;
                container.setScale(1);
            }
        }
    }

    private showVictoryCelebration(data: { score: number; maxCombo: number; level: number }) {
        this.disableTopButtonsOnly();
        this.victoryModal?.destroy();

        this.victoryModal = new VictoryCelebrationModal(
            this,
            data.level,
            data.score,
            data.maxCombo,
            () => {
                // Next level or replay
                const nextLevel = data.level < 3 ? data.level + 1 : data.level;
                this.gameEvents.emit('restart-game', { level: nextLevel });
                this.enableTopButtonsOnly();
                this.victoryModal = null;
            },
            () => {
                // Return to Level Select
                this.gameEvents.emit('quit-game');
                this.enableTopButtonsOnly();
                this.victoryModal = null;
            }
        );
    }

    private setupTopButtons() {
        // Pause button (Slot 0 -> 100, 100)
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

        // Settings button (Slot 1 -> 220, 100)
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

    private cleanup() {
        if (this.victoryModal) {
            this.victoryModal.destroy();
            this.victoryModal = null;
        }
        if (this.gameEvents) {
            this.gameEvents.off('update-relay-hud', this.onUpdateRelayHUD, this);
            this.gameEvents.off('show-victory', this.showVictoryCelebration, this);
        }
    }
}
