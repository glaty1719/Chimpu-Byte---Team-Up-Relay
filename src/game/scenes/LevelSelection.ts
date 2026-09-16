import { Scene } from 'phaser';
import { IconButton } from '../ui/IconButton';
import { SettingsPanel } from '../ui/SettingsPanel';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { GameDataManager } from '../services/GameDataManager';
import { AudioManager } from '../services/AudioManager';

export class LevelSelection extends Scene {

    constructor() {
        super('LevelSelection');
    }

    create() {
        const { width, height } = this.scale;
        const dataManager = GameDataManager.getInstance();

        // Background Image (As requested: GameBG.png)
        this.add.image(width / 2, height / 2, 'gameBG')
            .setDisplaySize(width, height)
            .setDepth(UILayers.GAME_BACKGROUND);

        // Dark overlay for background to make the panel pop
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4)
            .setDepth(UILayers.GAME_BACKGROUND + 1);

        // Main Panel Dimensions
        const panelW = 1200;
        const panelH = 700;
        const panelX = width / 2;
        const panelY = height / 2 + 50;

        // Draw Main Panel
        const panelGraphics = this.add.graphics();
        panelGraphics.setDepth(UILayers.UI_BACKGROUND_PANELS);

        // Shadow
        panelGraphics.fillStyle(0x000000, 0.3);
        panelGraphics.fillRoundedRect(panelX - panelW / 2 + 10, panelY - panelH / 2 + 10, panelW, panelH, 40);

        // Panel Border
        panelGraphics.lineStyle(8, 0x7db9e8, 1);
        panelGraphics.fillStyle(0x00334d, 0.95);
        panelGraphics.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 40);
        panelGraphics.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 40);

        // Rivets/Bolts decoration (as seen in reference)
        panelGraphics.fillStyle(0x7db9e8, 0.6);
        const rivetOffset = 30;
        panelGraphics.fillCircle(panelX - panelW / 2 + rivetOffset, panelY - panelH / 2 + rivetOffset, 8);
        panelGraphics.fillCircle(panelX + panelW / 2 - rivetOffset, panelY - panelH / 2 + rivetOffset, 8);
        panelGraphics.fillCircle(panelX - panelW / 2 + rivetOffset, panelY + panelH / 2 - rivetOffset, 8);
        panelGraphics.fillCircle(panelX + panelW / 2 - rivetOffset, panelY + panelH / 2 - rivetOffset, 8);

        panelGraphics.fillCircle(panelX - panelW / 4, panelY - panelH / 2 + rivetOffset / 2, 5);
        panelGraphics.fillCircle(panelX + panelW / 4, panelY - panelH / 2 + rivetOffset / 2, 5);

        // Header Label ("Level Select")
        const headerW = 400;
        const headerH = 80;
        const headerX = panelX;
        const headerY = panelY - panelH / 2;

        const headerGraphics = this.add.graphics();
        headerGraphics.setDepth(UILayers.UI_BACKGROUND_PANELS + 5);
        headerGraphics.fillStyle(0x004d66, 1);
        headerGraphics.lineStyle(6, 0x7db9e8, 1);
        headerGraphics.fillRoundedRect(headerX - headerW / 2, headerY - headerH / 2, headerW, headerH, 40);
        headerGraphics.strokeRoundedRect(headerX - headerW / 2, headerY - headerH / 2, headerW, headerH, 40);

        this.add.text(headerX, headerY, "Level Select", {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(UILayers.UI_TEXT + 10);

        // Cards layout
        const cardSpacing = 360;
        const cardY = panelY + 40;
        const cardW = 320;
        const cardH = 480;

        for (let i = 1; i <= 3; i++) {
            const isUnlocked = dataManager.isLevelUnlocked(i);
            const x = panelX + (i - 2) * cardSpacing;
            this.createLevelCard(x, cardY, cardW, cardH, i, isUnlocked);
        }

        // Top right buttons: Back and Settings
        this.addTopRightButtons();
    }

    private createLevelCard(x: number, y: number, w: number, h: number, level: number, isUnlocked: boolean) {
        const container = this.add.container(x, y);
        container.setDepth(UILayers.UI_BUTTONS);

        const graphics = this.add.graphics();

        // Card Border/Outer
        const borderColor = isUnlocked ? 0xffcc00 : 0x2d5a7a;
        graphics.lineStyle(8, borderColor, 1);
        graphics.fillStyle(0x001a26, 1);
        graphics.fillRoundedRect(-w / 2, -h / 2, w, h, 25);
        graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 25);

        container.add(graphics);

        if (isUnlocked) {
            // Level Glow
            const glow = this.add.graphics();
            glow.fillStyle(0xffcc00, 0.1);
            glow.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 30);
            container.addAt(glow, 0);

            // Level Preview Image (GameBG cropped/scaled)
            const preview = this.add.image(0, 0, 'gameBG');
            preview.setDisplaySize(w * 2, h).setAlpha(0.7);
            container.add(preview);

            // Create Mask for internal image
            const maskGraphics = this.make.graphics({ x: x, y: y }).setVisible(false);
            maskGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 20);
            preview.setMask(maskGraphics.createGeometryMask());

            // Level Titles from GDD
            const levelNames = ["Pick the Leader", "Strength Switch", "Team-Up Final"];
            const levelTitle = this.add.text(0, -40, `Level ${level}`, {
                fontFamily: 'Arial Black', fontSize: '50px', color: '#ffffff',
                stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5);

            const levelSub = this.add.text(0, 30, levelNames[level - 1] || "", {
                fontFamily: 'Arial Black', fontSize: '26px', color: '#ffcc00',
                stroke: '#000000', strokeThickness: 3, align: 'center', wordWrap: { width: w - 40 }
            }).setOrigin(0.5);

            container.add([levelTitle, levelSub]);


            // Interaction
            const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
            graphics.setInteractive({
                hitArea: hitArea, 
                hitAreaCallback: Phaser.Geom.Rectangle.Contains, 
                cursor: 'pointer' 
            });

            graphics.on('pointerover', () => {
                this.tweens.add({ targets: [container, maskGraphics], scale: 1.05, duration: 250, ease: 'Sine.easeOut', overwrite: true });
                graphics.clear();
                graphics.lineStyle(8, 0xffffff, 1);
                graphics.fillStyle(0x001a26, 1);
                graphics.fillRoundedRect(-w / 2, -h / 2, w, h, 25);
                graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 25);
            });

            graphics.on('pointerout', () => {
                this.tweens.add({ targets: [container, maskGraphics], scale: 1, duration: 250, ease: 'Sine.easeOut', overwrite: true });
                graphics.clear();
                graphics.lineStyle(8, 0xffcc00, 1);
                graphics.fillStyle(0x001a26, 1);
                graphics.fillRoundedRect(-w / 2, -h / 2, w, h, 25);
                graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 25);
            });

            graphics.on('pointerdown', () => {
                AudioManager.getInstance().playSFX('click');
                this.scene.start('Game', { level: level });
            });

        } else {
            // Locked State - Matching Reference Visual
            const lockColor = 0xbdc3c7;
            const lockShade = 0x95a5a6;
            const lockDark = 0x2c3e50;

            // Simple Border for locked card
            graphics.lineStyle(6, 0x2d5a7a, 1);
            graphics.strokeRoundedRect(-w / 2, -h / 2, w, h, 25);
            container.add(graphics);

            // Padlock Graphic
            const lockGraphics = this.add.graphics();
            const lW = 120;
            const lH = 100;
            const lY = 20;

            // 1. Shackle (The U-part)
            lockGraphics.lineStyle(15, lockColor, 1);
            lockGraphics.beginPath();
            lockGraphics.arc(0, lY - 60, 45, Math.PI, 0, false);
            lockGraphics.strokePath();

            lockGraphics.lineStyle(15, lockShade, 1);
            lockGraphics.lineBetween(-45, lY - 60, -45, lY - 10);
            lockGraphics.lineBetween(45, lY - 60, 45, lY - 10);

            // 2. Lock Body
            lockGraphics.fillStyle(lockColor, 1);
            lockGraphics.fillRoundedRect(-lW / 2, lY - lH / 2, lW, lH, 15);

            // Body Details/Shading
            lockGraphics.fillStyle(lockShade, 1);
            lockGraphics.fillRoundedRect(-lW / 2 + 5, lY - lH / 2 + 5, lW - 10, lH - 10, 12);

            lockGraphics.fillStyle(lockColor, 1);
            lockGraphics.fillRoundedRect(-lW / 2 + 10, lY - lH / 2 + 10, lW - 20, lH - 25, 10);

            // 3. Keyhole
            lockGraphics.fillStyle(lockDark, 1);
            lockGraphics.fillCircle(0, lY, 12);
            lockGraphics.beginPath();
            lockGraphics.moveTo(-6, lY);
            lockGraphics.lineTo(6, lY);
            lockGraphics.lineTo(10, lY + 25);
            lockGraphics.lineTo(-10, lY + 25);
            lockGraphics.closePath();
            lockGraphics.fillPath();

            // Rivets on lock body
            lockGraphics.fillStyle(lockDark, 0.4);
            lockGraphics.fillCircle(-lW / 2 + 15, lY - lH / 2 + 15, 4);
            lockGraphics.fillCircle(lW / 2 - 15, lY - lH / 2 + 15, 4);
            lockGraphics.fillCircle(-lW / 2 + 15, lY + lH / 2 - 15, 4);
            lockGraphics.fillCircle(lW / 2 - 15, lY + lH / 2 - 15, 4);

            container.add(lockGraphics);
        }
    }

    private addTopRightButtons() {
        // Slot 0 (1st button): Back button -> (100, 100)
        const backPos = UIPositions.getTopLeftButtonPos(0);
        const backBtn = new IconButton(
            this,
            backPos.x,
            backPos.y,
            'back_icon',
            () => this.scene.start('MainMenu')
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
                new SettingsPanel(this, () => { });
            }
        );
        settingsBtn.setDepth(UILayers.UI_BUTTONS);
    }
}
