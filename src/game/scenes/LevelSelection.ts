import { Scene } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { GameDataManager } from '../services/GameDataManager';
import { AudioManager } from '../services/AudioManager';
import { GAME_LEVELS } from '../data/GateData';

export class LevelSelection extends Scene {
    constructor() {
        super('LevelSelection');
    }

    create() {
        const { width, height } = this.scale;
        const dataManager = GameDataManager.getInstance();

        // 1. Fullscreen Background Image
        this.add.image(width / 2, height / 2, 'bg')
            .setDisplaySize(width, height)
            .setDepth(UILayers.GAME_BACKGROUND);

        // 2. Dark Modal Backdrop Overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65)
            .setDepth(UILayers.GAME_BACKGROUND + 1)
            .setInteractive(); // Blocks clicks behind modal

        // 3. Centered Classic Modal Container
        const modal = this.add.container(width / 2, height / 2)
            .setDepth(UILayers.UI_BACKGROUND_PANELS)
            .setScale(0.85)
            .setAlpha(0);

        const mw = 1080;
        const mh = 660;

        // Draw Cyber-Sports Modal Frame (matching App Branding)
        this.drawCyberModalFrame(modal, mw, mh);

        // Header Plaque: "SELECT LEVEL" (Royal Violet & Championship Gold)
        this.createHeaderPlaque(modal, 0, -mh / 2 + 10);

        // 3 Level Buttons
        const cardSpacing = 310;
        const cardY = 44;
        const cardW = 265;
        const cardH = 430;

        for (let i = 1; i <= 3; i++) {
            const isUnlocked = dataManager.isLevelUnlocked(i);
            const cardX = (i - 2) * cardSpacing;
            this.createClassicLevelButton(modal, cardX, cardY, cardW, cardH, i, isUnlocked);
        }

        // Pop in animation for modal
        this.tweens.add({
            targets: modal,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });

        // 4. Navigation Buttons in Top-Left (Back & Settings)
        this.addTopNavigationButtons();
    }

    private drawCyberModalFrame(container: Phaser.GameObjects.Container, w: number, h: number) {
        const g = this.add.graphics();
        const r = 36;

        // Layered Outer Glow: Team Synergy Violet + Cyber Cyan
        g.fillStyle(0x7c3aed, 0.28);
        g.fillRoundedRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 32, r + 6);
        g.fillStyle(0x00f2fe, 0.12);
        g.fillRoundedRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, r + 2);

        // Main Panel Background: Deep Midnight Slate (Cyber Track theme)
        g.fillStyle(0x0c1022, 0.98);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

        // Neon Electric Cyan Outer Border (Byte Theme Accent)
        g.lineStyle(5, 0x00f2fe, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

        // Inner Plate (Sleek Slate gradient plate)
        g.fillStyle(0x0f172a, 0.95);
        g.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, r - 8);

        // Subtle top gradient shine
        g.fillStyle(0x1e1b4b, 0.6);
        g.fillRoundedRect(-w / 2 + 16, -h / 2 + 16, w - 32, 160, r - 10);

        // Inner Cyber Pinstripe
        g.lineStyle(2, 0x38bdf8, 0.6);
        g.strokeRoundedRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, r - 10);

        container.add(g);
    }

    private createHeaderPlaque(container: Phaser.GameObjects.Container, x: number, y: number) {
        const headerCont = this.add.container(x, y);

        const pw = 560;
        const ph = 90;
        const pr = 26;
        const g = this.add.graphics();

        // Plaque drop shadow
        g.fillStyle(0x000000, 0.45);
        g.fillRoundedRect(-pw / 2, -ph / 2 + 6, pw, ph, pr);

        // Royal Violet Plaque Body (matching Victory Celebration Ribbon)
        g.fillStyle(0x6b21a8, 1);
        g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, pr);

        // Top Gloss Highlight
        g.fillStyle(0xc084fc, 0.35);
        g.fillRoundedRect(-pw / 2 + 4, -ph / 2 + 4, pw - 8, ph / 2 - 4, pr - 4);

        // Golden Outer Trim
        g.lineStyle(4, 0xffd166, 1);
        g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, pr);

        // Inner Gold Pinstripe Inlay
        g.lineStyle(1.5, 0xfbbf24, 0.8);
        g.strokeRoundedRect(-pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12, pr - 6);

        headerCont.add(g);

        // Plaque Text: "SELECT LEVEL" (Championship Gold)
        const title = this.add.text(0, -1, 'SELECT LEVEL', {
            fontFamily: 'Arial Black',
            fontSize: '50px',
            color: '#fef08a',
            stroke: '#3b0764',
            strokeThickness: 8
        }).setOrigin(0.5);
        headerCont.add(title);

        container.add(headerCont);
    }

    private createClassicLevelButton(
        container: Phaser.GameObjects.Container,
        x: number,
        y: number,
        w: number,
        h: number,
        level: number,
        isUnlocked: boolean
    ) {
        const cardCont = this.add.container(x, y);
        const levelConfig = GAME_LEVELS.find(l => l.levelNumber === level) || GAME_LEVELS[0];
        const r = 24;

        // Level theme accents reflecting the app's core character and team identities
        const levelThemes = [
            {
                primary: 0x00f2fe, // Byte: Electric Cyan
                secondary: 0x0284c7, // Byte: Azure
                plateBg: 0x082f49,
                tagColor: '#38bdf8', // Byte Light Cyan
                crestRim: 0x0284c7,
                crestCore: 0x00f2fe,
                crestStroke: '#0284c7'
            },
            {
                primary: 0xff477e, // Chimpu: Vibrant Coral Rose
                secondary: 0xffd166, // Chimpu: Warm Gold
                plateBg: 0x4c0519,
                tagColor: '#ff758f', // Chimpu Light Rose
                crestRim: 0xbe123c,
                crestCore: 0xff477e,
                crestStroke: '#4c0519'
            },
            {
                primary: 0xa855f7, // Synergy: Team Purple
                secondary: 0xffd166, // Synergy: Championship Gold
                plateBg: 0x2e1065,
                tagColor: '#c084fc', // Team Synergy Light Purple
                crestRim: 0x6b21a8,
                crestCore: 0xa855f7,
                crestStroke: '#3b0764'
            }
        ];
        const theme = levelThemes[level - 1] || levelThemes[0];

        const cardG = this.add.graphics();

        if (isUnlocked) {
            // Unlocked Cyber Card Plate
            cardG.fillStyle(0x000000, 0.4);
            cardG.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);

            // Deep Midnight Slate Body
            cardG.fillStyle(0x0c1022, 0.96);
            cardG.fillRoundedRect(-w / 2, -h / 2, w, h, r);

            // Top gradient plate with theme accent
            cardG.fillStyle(theme.plateBg, 0.55);
            cardG.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, 155, r - 4);

            // Level Theme Neon Border
            cardG.lineStyle(5, theme.primary, 1);
            cardG.strokeRoundedRect(-w / 2, -h / 2, w, h, r);

            // Inner Accent Thread
            cardG.lineStyle(1.5, theme.primary, 0.45);
            cardG.strokeRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, r - 6);
            cardCont.add(cardG);

            // 1. Three Golden 3D Stars on top of the card
            const starsY = -h / 2 + 40;
            const starG = this.add.graphics();
            this.drawStyledStar(starG, -46, starsY + 3, 5, 15, 7.5, -0.15);
            this.drawStyledStar(starG, 46, starsY + 3, 5, 15, 7.5, 0.15);
            this.drawStyledStar(starG, 0, starsY - 2, 5, 20, 10, 0);
            cardCont.add(starG);

            // 2. Large Level Number Shield / Crest
            const crestY = -h / 2 + 138;
            const crestG = this.add.graphics();

            // Radiant circular shield
            crestG.fillStyle(theme.primary, 0.25);
            crestG.fillCircle(0, crestY, 52);
            crestG.fillStyle(theme.crestRim, 1);
            crestG.fillCircle(0, crestY, 46);
            crestG.fillStyle(theme.crestCore, 1);
            crestG.fillCircle(0, crestY, 42);
            crestG.fillStyle(0xffffff, 0.35);
            crestG.fillCircle(0, crestY - 9, 24);
            crestG.lineStyle(3, 0xffffff, 0.85);
            crestG.strokeCircle(0, crestY, 42);
            cardCont.add(crestG);

            // Large Level Number
            const numText = this.add.text(0, crestY, `${level}`, {
                fontFamily: 'Arial Black',
                fontSize: '58px',
                color: '#ffffff',
                stroke: theme.crestStroke,
                strokeThickness: 8
            }).setOrigin(0.5);
            cardCont.add(numText);

            // 3. Level Title
            const titleY = -h / 2 + 238;
            const titleText = this.add.text(0, titleY, levelConfig.title.replace(`Level ${level}: `, ''), {
                fontFamily: 'Arial Black',
                fontSize: '35px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center',
                wordWrap: { width: w - 20 }
            }).setOrigin(0.5);
            cardCont.add(titleText);

            // 4. Tactile Green "PLAY" Button (Victory Green)
            const btnW = 200;
            const btnH = 60;
            const btnY = h / 2 - 48;
            const btnCont = this.add.container(0, btnY);

            const btnG = this.add.graphics();
            btnG.fillStyle(0x000000, 0.35);
            btnG.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 20);
            btnG.fillStyle(0x059669, 1);
            btnG.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
            btnG.fillStyle(0x34d399, 0.4);
            btnG.fillRoundedRect(-btnW / 2 + 3, -btnH / 2 + 3, btnW - 6, btnH / 2 - 3, 16);
            btnG.lineStyle(3, 0x34d399, 1);
            btnG.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 20);
            btnCont.add(btnG);

            const btnText = this.add.text(0, 0, 'PLAY', {
                fontFamily: 'Arial Black',
                fontSize: '32px',
                color: '#ffffff',
                stroke: '#064e3b',
                strokeThickness: 6
            }).setOrigin(0.5);
            btnCont.add(btnText);
            cardCont.add(btnCont);

            // Interactive Hover & Click on Card
            const hitZone = this.add.zone(0, 0, w, h).setInteractive({ useHandCursor: true });
            hitZone.on('pointerover', () => {
                AudioManager.getInstance().playSFX('button_tap');
                this.tweens.add({
                    targets: cardCont,
                    scale: 1.05,
                    duration: 160,
                    ease: 'Sine.easeOut',
                    overwrite: true
                });
                cardG.clear();
                cardG.fillStyle(0x000000, 0.45);
                cardG.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);
                cardG.fillStyle(0x131a33, 0.98);
                cardG.fillRoundedRect(-w / 2, -h / 2, w, h, r);
                cardG.fillStyle(theme.plateBg, 0.7);
                cardG.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, 155, r - 4);
                cardG.lineStyle(6, 0xffffff, 1);
                cardG.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
            });

            hitZone.on('pointerout', () => {
                this.tweens.add({
                    targets: cardCont,
                    scale: 1,
                    duration: 160,
                    ease: 'Sine.easeOut',
                    overwrite: true
                });
                cardG.clear();
                cardG.fillStyle(0x000000, 0.4);
                cardG.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);
                cardG.fillStyle(0x0c1022, 0.96);
                cardG.fillRoundedRect(-w / 2, -h / 2, w, h, r);
                cardG.fillStyle(theme.plateBg, 0.55);
                cardG.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, 155, r - 4);
                cardG.lineStyle(5, theme.primary, 1);
                cardG.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
                cardG.lineStyle(1.5, theme.primary, 0.45);
                cardG.strokeRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, r - 6);
            });

            hitZone.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('click');
                this.tweens.add({
                    targets: cardCont,
                    scale: 0.95,
                    duration: 80,
                    yoyo: true,
                    onComplete: () => {
                        this.scene.start('Game', { level: level });
                    }
                });
            });

            cardCont.add(hitZone);
        } else {
            // --- Locked Cyber Card ---
            cardG.fillStyle(0x000000, 0.35);
            cardG.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);

            // Dark frosted cyber plate
            cardG.fillStyle(0x090d1a, 0.88);
            cardG.fillRoundedRect(-w / 2, -h / 2, w, h, r);
            cardG.lineStyle(4, 0x334155, 0.8);
            cardG.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
            cardCont.add(cardG);

            // Level Tag
            const tagText = this.add.text(0, -h / 2 + 48, `LEVEL ${level}`, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#64748b',
                stroke: '#0f172a',
                strokeThickness: 5
            }).setOrigin(0.5);
            cardCont.add(tagText);

            // 3D Padlock
            const lockG = this.add.graphics();
            const lY = -18;
            const lW = 92;
            const lH = 80;

            // Shackle
            lockG.lineStyle(12, 0x64748b, 1);
            lockG.beginPath();
            lockG.arc(0, lY - 42, 32, Math.PI, 0, false);
            lockG.strokePath();

            // Lock Body
            lockG.fillStyle(0x334155, 1);
            lockG.fillRoundedRect(-lW / 2, lY - lH / 2, lW, lH, 16);
            lockG.lineStyle(3, 0x94a3b8, 0.8);
            lockG.strokeRoundedRect(-lW / 2, lY - lH / 2, lW, lH, 16);

            // Golden Keyhole
            lockG.fillStyle(0xd97706, 1);
            lockG.fillCircle(0, lY - 4, 9);
            lockG.beginPath();
            lockG.moveTo(-4, lY - 4);
            lockG.lineTo(4, lY - 4);
            lockG.lineTo(7, lY + 18);
            lockG.lineTo(-7, lY + 18);
            lockG.closePath();
            lockG.fillPath();
            cardCont.add(lockG);

            // Locked Label
            const lockLabel = this.add.text(0, 70, 'LOCKED', {
                fontFamily: 'Arial Black',
                fontSize: '34px',
                color: '#94a3b8',
                stroke: '#0f172a',
                strokeThickness: 6
            }).setOrigin(0.5);

            // Unlock Hint
            const unlockHint = this.add.text(0, 124, `Clear Level ${level - 1}\nto unlock`, {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#64748b',
                stroke: '#0f172a',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);

            cardCont.add([lockLabel, unlockHint]);
        }

        container.add(cardCont);
    }

    private drawStyledStar(
        graphics: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        points: number,
        outerR: number,
        innerR: number,
        angleOffset: number = 0
    ) {
        // Outer shadow
        this.renderStarPath(graphics, cx, cy + 2, points, outerR + 1, innerR + 0.5, angleOffset, 0xb45309, 1, 0, 0);
        // Base gold star
        this.renderStarPath(graphics, cx, cy, points, outerR, innerR, angleOffset, 0xfbbf24, 1, 0xd97706, 2);
        // Top highlight shine
        this.renderStarPath(graphics, cx, cy - 1.5, points, outerR * 0.72, innerR * 0.72, angleOffset, 0xfef08a, 0.45, 0, 0);
    }

    private renderStarPath(
        graphics: Phaser.GameObjects.Graphics,
        cx: number,
        cy: number,
        points: number,
        outerR: number,
        innerR: number,
        angleOffset: number,
        fillColor: number,
        fillAlpha: number,
        strokeColor: number,
        strokeWidth: number
    ) {
        const startAngle = -Math.PI / 2 + angleOffset;
        const step = Math.PI / points;

        graphics.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = startAngle + i * step;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        }
        graphics.closePath();
        graphics.fillStyle(fillColor, fillAlpha);
        graphics.fillPath();

        if (strokeWidth > 0) {
            graphics.lineStyle(strokeWidth, strokeColor, 1);
            graphics.strokePath();
        }
    }

    private addTopNavigationButtons() {
        // Slot 0 (1st button): Back button -> (100, 100)
        const backPos = UIPositions.getTopLeftButtonPos(0);
        const backBtn = new IconButton(
            this,
            backPos.x,
            backPos.y,
            'back_icon',
            () => {
                AudioManager.getInstance().playSFX('button_tap');
                this.scene.start('MainMenu');
            }
        );
        backBtn.setDepth(UILayers.UI_BUTTONS);

        // Slot 1 (2nd button): Settings button -> (220, 100)
        const settingsPos = UIPositions.getTopLeftButtonPos(1);
        const settingsBtn = new IconButton(
            this,
            settingsPos.x,
            settingsPos.y,
            'settings_icon',
            () => {
                AudioManager.getInstance().playSFX('button_tap');
                new SettingsPanel(this, () => { });
            }
        );
        settingsBtn.setDepth(UILayers.UI_BUTTONS);
    }
}
