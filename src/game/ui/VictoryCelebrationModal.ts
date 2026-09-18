import { Scene, GameObjects } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';

export class VictoryCelebrationModal {
    private container: GameObjects.Container;
    private overlay: GameObjects.Rectangle;

    constructor(
        scene: Scene,
        levelNumber: number,
        _score: number,
        _maxCombo: number,
        onNext: () => void,
        onPlayAgain: () => void,
        onHome: () => void
    ) {
        const { width, height } = scene.scale;

        // Dark Modal Overlay
        this.overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setDepth(UILayers.MODAL_BACKGROUND)
            .setInteractive();

        this.container = scene.add.container(width / 2, height / 2)
            .setDepth(UILayers.MODAL_PANEL)
            .setScale(0.7)
            .setAlpha(0);

        // Modal Frame Box
        const mw = 760;
        const mh = 480;
        const bg = scene.add.graphics();

        // Layered Outer Glow: Team Violet (Synergy) + Cyber Cyan
        bg.fillStyle(0x7c3aed, 0.28);
        bg.fillRoundedRect(-mw / 2 - 16, -mh / 2 - 16, mw + 32, mh + 32, 42);
        bg.fillStyle(0x00f2fe, 0.12);
        bg.fillRoundedRect(-mw / 2 - 8, -mh / 2 - 8, mw + 16, mh + 16, 36);

        // Panel Background: Deep Midnight Slate (Cyber Asphalt theme)
        bg.fillStyle(0x0c1022, 0.98);
        bg.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, 32);

        // Panel Border: Neon Electric Cyan (Byte Accent)
        bg.lineStyle(5, 0x00f2fe, 1);
        bg.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, 32);

        this.container.add(bg);

        // --- Radiant Golden Glow Behind Stars ---
        const starCenterY = -mh / 2 + 58;
        const starGlow = scene.add.graphics();
        starGlow.fillStyle(0xfbbf24, 0.25);
        starGlow.fillCircle(0, starCenterY, 120);
        starGlow.fillStyle(0xf59e0b, 0.14);
        starGlow.fillCircle(0, starCenterY, 170);
        this.container.add(starGlow);

        // --- 3 Golden 3D Stars ---
        const starGraphics = scene.add.graphics();
        // Left Star (Tilted left, slightly lower)
        this.drawStyledStar(starGraphics, -88, starCenterY + 10, 5, 38, 19, -0.18);
        // Right Star (Tilted right, slightly lower)
        this.drawStyledStar(starGraphics, 88, starCenterY + 10, 5, 38, 19, 0.18);
        // Center Star (Largest, highest)
        this.drawStyledStar(starGraphics, 0, starCenterY - 6, 5, 52, 26, 0);
        this.container.add(starGraphics);

        // --- Sparkle Glints around stars ---
        const sparkles = scene.add.graphics();
        this.drawSparkle(sparkles, -135, starCenterY + 2, 7);
        this.drawSparkle(sparkles, -42, starCenterY - 32, 6);
        this.drawSparkle(sparkles, 42, starCenterY - 32, 6);
        this.drawSparkle(sparkles, 135, starCenterY + 2, 7);
        this.container.add(sparkles);

        // --- Championship Ribbon Banner: "LEVEL COMPLETED" ---
        const bannerY = -mh / 2 + 138;
        const bannerGraphics = scene.add.graphics();

        // 1. Left Ribbon Tail (Folded & notched swallowtail)
        bannerGraphics.fillStyle(0x4c1d95, 1); // Darker purple fold
        bannerGraphics.beginPath();
        bannerGraphics.moveTo(-235, bannerY - 30);
        bannerGraphics.lineTo(-295, bannerY - 16);
        bannerGraphics.lineTo(-275, bannerY + 6);
        bannerGraphics.lineTo(-295, bannerY + 28);
        bannerGraphics.lineTo(-235, bannerY + 34);
        bannerGraphics.closePath();
        bannerGraphics.fillPath();
        bannerGraphics.lineStyle(3, 0xffd166, 1);
        bannerGraphics.strokePath();

        // Left fold shadow triangle
        bannerGraphics.fillStyle(0x2e1065, 1);
        bannerGraphics.fillTriangle(-235, bannerY - 30, -235, bannerY + 34, -220, bannerY + 20);

        // 2. Right Ribbon Tail (Folded & notched swallowtail)
        bannerGraphics.fillStyle(0x4c1d95, 1);
        bannerGraphics.beginPath();
        bannerGraphics.moveTo(235, bannerY - 30);
        bannerGraphics.lineTo(295, bannerY - 16);
        bannerGraphics.lineTo(275, bannerY + 6);
        bannerGraphics.lineTo(295, bannerY + 28);
        bannerGraphics.lineTo(235, bannerY + 34);
        bannerGraphics.closePath();
        bannerGraphics.fillPath();
        bannerGraphics.lineStyle(3, 0xffd166, 1);
        bannerGraphics.strokePath();

        // Right fold shadow triangle
        bannerGraphics.fillStyle(0x2e1065, 1);
        bannerGraphics.fillTriangle(235, bannerY - 30, 235, bannerY + 34, 220, bannerY + 20);

        // 3. Main Center Ribbon Plaque
        const bw = 480;
        const bh = 76;
        const br = 18;

        // Shadow under plaque
        bannerGraphics.fillStyle(0x1e1b4b, 0.9);
        bannerGraphics.fillRoundedRect(-bw / 2, bannerY - bh / 2 + 4, bw, bh, br);

        // Royal Violet Ribbon body
        bannerGraphics.fillStyle(0x6b21a8, 1);
        bannerGraphics.fillRoundedRect(-bw / 2, bannerY - bh / 2, bw, bh, br);

        // Top glossy shine
        bannerGraphics.fillStyle(0xc084fc, 0.35);
        bannerGraphics.fillRoundedRect(-bw / 2 + 4, bannerY - bh / 2 + 4, bw - 8, bh / 2 - 4, br - 4);

        // Outer Gold Trim
        bannerGraphics.lineStyle(4, 0xffd166, 1);
        bannerGraphics.strokeRoundedRect(-bw / 2, bannerY - bh / 2, bw, bh, br);

        // Inner Golden Accent Pinstripe
        bannerGraphics.lineStyle(1.5, 0xfbbf24, 0.7);
        bannerGraphics.strokeRoundedRect(-bw / 2 + 6, bannerY - bh / 2 + 6, bw - 12, bh - 12, br - 6);

        this.container.add(bannerGraphics);

        // "LEVEL COMPLETED" Title (Championship Gold Typography)
        const title = scene.add.text(0, bannerY - 1, 'LEVEL COMPLETED', {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: '#fef08a',
            stroke: '#3b0764',
            strokeThickness: 8
        }).setOrigin(0.5);
        this.container.add(title);

        // --- Action Buttons Layout ---
        const hasNextLevel = levelNumber < 3;
        const row1Y = 32;
        const row2Y = 132;

        if (hasNextLevel) {
            // 1. Prominent full-width NEXT LEVEL button at top (Emerald Victory)
            this.createButton(
                scene,
                0,
                row1Y,
                610,
                84,
                0x059669,
                0x34d399,
                '#064e3b',
                'NEXT LEVEL',
                '40px',
                onNext
            );

            // 2. Smaller PLAY AGAIN & HOME buttons side-by-side underneath with clean padding
            const subBtnW = 288;
            const subBtnH = 74;
            const subFontSize = '32px';
            const gapSpacing = 162; // Provides a generous 36px clean gap between the buttons

            // PLAY AGAIN (Byte Neon Azure / Cyan theme)
            this.createButton(
                scene,
                -gapSpacing,
                row2Y,
                subBtnW,
                subBtnH,
                0x0284c7,
                0x00f2fe,
                '#0c4a6e',
                'PLAY AGAIN',
                subFontSize,
                onPlayAgain
            );

            // HOME (Chimpu Warm Gold / Cyber Slate theme)
            this.createButton(
                scene,
                gapSpacing,
                row2Y,
                subBtnW,
                subBtnH,
                0x1e293b,
                0xffd166,
                '#0f172a',
                'HOME',
                subFontSize,
                onHome
            );
        } else {
            // Final level: Prominent PLAY AGAIN at top, HOME underneath
            this.createButton(
                scene,
                0,
                row1Y,
                360,
                74,
                0x0284c7,
                0x00f2fe,
                '#0c4a6e',
                'PLAY AGAIN',
                '38px',
                onPlayAgain
            );

            this.createButton(
                scene,
                0,
                row2Y,
                360,
                74,
                0x1e293b,
                0xffd166,
                '#0f172a',
                'HOME',
                '34px',
                onHome
            );
        }

        // Pop in animation
        scene.tweens.add({
            targets: this.container,
            scale: 1,
            alpha: 1,
            duration: 380,
            ease: 'Back.easeOut'
        });
    }

    private drawStyledStar(
        graphics: GameObjects.Graphics,
        cx: number,
        cy: number,
        points: number,
        outerR: number,
        innerR: number,
        angleOffset: number
    ) {
        // Outer glow/shadow
        this.renderStarPath(graphics, cx, cy + 3, points, outerR + 2, innerR + 1, angleOffset, 0xb45309, 1, 0, 0);
        // Base gold star
        this.renderStarPath(graphics, cx, cy, points, outerR, innerR, angleOffset, 0xfbbf24, 1, 0xd97706, 3);
        // Top highlight shine
        this.renderStarPath(graphics, cx, cy - 2, points, outerR * 0.72, innerR * 0.72, angleOffset, 0xfef08a, 0.45, 0, 0);
    }

    private renderStarPath(
        graphics: GameObjects.Graphics,
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

    private drawSparkle(graphics: GameObjects.Graphics, x: number, y: number, size: number) {
        graphics.fillStyle(0xfef08a, 0.9);
        graphics.fillRect(x - size, y - size / 4, size * 2, size / 2);
        graphics.fillRect(x - size / 4, y - size, size / 2, size * 2);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x, y, size / 2.5);
    }

    private createButton(
        scene: Scene,
        x: number,
        y: number,
        w: number,
        h: number,
        bgColor: number,
        borderColor: number,
        strokeColor: string,
        label: string,
        fontSize: string,
        onClick: () => void
    ) {
        const btnCont = scene.add.container(x, y);

        const bg = scene.add.graphics();
        const r = 22;

        // Bottom shadow bevel
        bg.fillStyle(0x000000, 0.35);
        bg.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, r);

        // Main button fill
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);

        // Top glossy shine
        bg.fillStyle(0xffffff, 0.18);
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 3, w - 8, h / 2 - 3, r - 4);

        // Border outline
        bg.lineStyle(4, borderColor, 1);
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
        btnCont.add(bg);

        // Button text with enlarged font and crisp outline
        const text = scene.add.text(0, 0, label, {
            fontFamily: 'Arial Black',
            fontSize: fontSize,
            color: '#ffffff',
            stroke: strokeColor,
            strokeThickness: 5
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
