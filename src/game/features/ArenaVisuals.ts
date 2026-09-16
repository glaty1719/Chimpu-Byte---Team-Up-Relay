import { Scene } from 'phaser';

/**
 * ArenaVisuals dynamically draws high-definition vector graphics and textures
 * for the Team-Up Relay sports arena, characters, gates, task icons, and reward badges.
 */
export class ArenaVisuals {
    public static generateAll(scene: Scene) {
        this.generateTrackAndArena(scene);
        this.generateCharacterVisuals(scene);
        this.generateGateFrames(scene);
        this.generateTaskIcons(scene);
        this.generateRewardBadges(scene);
        this.generateButtonSymbols(scene);
    }

    private static generateTrackAndArena(scene: Scene) {
        // 1. Looping Neon Track Tile (512x256)
        const track = scene.make.graphics({ x: 0, y: 0 });
        const tw = 512;
        const th = 256;

        // Dark navy base
        track.fillStyle(0x0a0f1d, 1);
        track.fillRect(0, 0, tw, th);

        // Track grid lines
        track.lineStyle(2, 0x16233d, 0.8);
        for (let x = 0; x <= tw; x += 64) {
            track.lineBetween(x, 0, x, th);
        }
        for (let y = 0; y <= th; y += 32) {
            track.lineBetween(0, y, tw, y);
        }

        // Outer Neon Track Borders
        track.lineStyle(6, 0x00f2fe, 0.9); // Left AI lane cyan
        track.lineBetween(16, 0, 16, th);
        track.lineStyle(6, 0xff6b6b, 0.9); // Right Human lane coral
        track.lineBetween(tw - 16, 0, tw - 16, th);

        // Center Divider
        track.lineStyle(4, 0xa855f7, 0.7); // Purple center dashed line
        for (let y = 8; y < th; y += 32) {
            track.lineBetween(tw / 2, y, tw / 2, y + 16);
        }

        // Glowing Chevron speed arrows
        track.fillStyle(0x00f2fe, 0.15);
        track.beginPath();
        track.moveTo(tw * 0.25 - 20, 40);
        track.lineTo(tw * 0.25, 20);
        track.lineTo(tw * 0.25 + 20, 40);
        track.lineTo(tw * 0.25, 30);
        track.closePath();
        track.fillPath();

        track.fillStyle(0xff6b6b, 0.15);
        track.beginPath();
        track.moveTo(tw * 0.75 - 20, 40);
        track.lineTo(tw * 0.75, 20);
        track.lineTo(tw * 0.75 + 20, 40);
        track.lineTo(tw * 0.75, 30);
        track.closePath();
        track.fillPath();

        track.generateTexture('neon_track_tile', tw, th);

        // 2. Audience & Stadium Silhouette (960x140)
        const aud = scene.make.graphics({ x: 0, y: 0 });
        aud.fillStyle(0x080b14, 0.95);
        aud.fillRect(0, 0, 960, 140);

        // Audience crowd heads & waving hands
        const colors = [0x3b82f6, 0xec4899, 0x8b5cf6, 0x06b6d4, 0xf59e0b];
        for (let i = 0; i < 960; i += 18) {
            const h = 24 + Math.sin(i * 0.1) * 12;
            const col = colors[(i / 18) % colors.length];
            aud.fillStyle(col, 0.35);
            aud.fillCircle(i + 8, 140 - h, 9);
            aud.fillRect(i + 2, 140 - h + 6, 12, h);
        }

        // Colorful stadium light glow dots
        for (let j = 40; j < 960; j += 120) {
            aud.fillStyle(0x00f2fe, 0.6);
            aud.fillCircle(j, 25, 6);
            aud.fillStyle(0xffffff, 0.8);
            aud.fillCircle(j, 25, 3);
        }

        aud.generateTexture('arena_audience_layer', 960, 140);

        // 3. Shard polygon for particle break
        const shard = scene.make.graphics({ x: 0, y: 0 });
        shard.fillStyle(0xffffff, 1);
        shard.beginPath();
        shard.moveTo(0, 0);
        shard.lineTo(24, 6);
        shard.lineTo(16, 22);
        shard.lineTo(4, 18);
        shard.closePath();
        shard.fillPath();
        shard.generateTexture('break_shard', 24, 24);

        // Large polygonal structural shard
        const shardLg = scene.make.graphics({ x: 0, y: 0 });
        shardLg.fillStyle(0xffffff, 0.95);
        shardLg.beginPath();
        shardLg.moveTo(4, 8);
        shardLg.lineTo(46, 2);
        shardLg.lineTo(52, 38);
        shardLg.lineTo(28, 50);
        shardLg.lineTo(2, 36);
        shardLg.closePath();
        shardLg.fillPath();
        shardLg.lineStyle(2, 0xffffff, 1);
        shardLg.strokePath();
        shardLg.generateTexture('break_shard_large', 54, 54);

        // Long crystal needle shard
        const shardLong = scene.make.graphics({ x: 0, y: 0 });
        shardLong.fillStyle(0xffffff, 1);
        shardLong.beginPath();
        shardLong.moveTo(2, 2);
        shardLong.lineTo(12, 0);
        shardLong.lineTo(40, 18);
        shardLong.lineTo(22, 20);
        shardLong.closePath();
        shardLong.fillPath();
        shardLong.generateTexture('break_shard_long', 42, 22);

        // Triangular shard
        const shardTri = scene.make.graphics({ x: 0, y: 0 });
        shardTri.fillStyle(0xffffff, 1);
        shardTri.beginPath();
        shardTri.moveTo(0, 0);
        shardTri.lineTo(28, 8);
        shardTri.lineTo(12, 28);
        shardTri.closePath();
        shardTri.fillPath();
        shardTri.generateTexture('break_shard_tri', 30, 30);

        // 4. Sparkle Star Particle
        const spark = scene.make.graphics({ x: 0, y: 0 });
        spark.fillStyle(0xffffff, 1);
        spark.fillCircle(16, 16, 8);
        spark.fillRect(14, 0, 4, 32);
        spark.fillRect(0, 14, 32, 4);
        spark.generateTexture('sparkle_star', 32, 32);

        // 5. Shatter Shockwave Ring
        const sw = scene.make.graphics({ x: 0, y: 0 });
        sw.lineStyle(6, 0xffffff, 0.95);
        sw.strokeEllipse(64, 40, 120, 70);
        sw.lineStyle(3, 0xffffff, 0.5);
        sw.strokeEllipse(64, 40, 126, 76);
        sw.generateTexture('shatter_shockwave', 130, 80);
    }

    private static generateCharacterVisuals(scene: Scene) {
        // Generate 4-Frame Running Animation Cycle for Byte
        for (let frame = 0; frame < 4; frame++) {
            const byteG = scene.make.graphics({ x: 0, y: 0 });
            const cx = 90;
            const cy = 100;

            // Stride kinematics for athletic humanoid running
            let backArmAngle = 0;   // Left arm
            let frontArmAngle = 0;  // Right arm
            let backLegOffY = 0;
            let backLegOffX = 0;
            let frontLegOffY = 0;
            let frontLegOffX = 0;
            let bodyDip = 0;
            let thrusterGlow = 0.3;

            if (frame === 0) {
                // Right leg forward, Left leg back; Left arm forward, Right arm back
                backArmAngle = 0.55;    // Back arm swinging forward
                frontArmAngle = -0.55;  // Front arm swinging back
                backLegOffX = -8;
                backLegOffY = -4;       // Leg trailing
                frontLegOffX = 8;
                frontLegOffY = 4;        // Leg forward stride
                thrusterGlow = 0.4;
            } else if (frame === 1) {
                // Passing plant phase (dip)
                backArmAngle = 0.1;
                frontArmAngle = -0.1;
                backLegOffX = -2;
                backLegOffY = 0;
                frontLegOffX = 2;
                frontLegOffY = 0;
                bodyDip = 2;
                thrusterGlow = 0.48;
            } else if (frame === 2) {
                // Left leg forward, Right leg back; Right arm forward, Left arm back
                backArmAngle = -0.55;   // Back arm swinging back
                frontArmAngle = 0.55;   // Front arm swinging forward
                backLegOffX = 8;
                backLegOffY = 4;        // Leg forward stride
                frontLegOffX = -8;
                frontLegOffY = -4;      // Leg trailing
                thrusterGlow = 0.4;
            } else if (frame === 3) {
                // Passing lift phase (rebound)
                backArmAngle = -0.1;
                frontArmAngle = 0.1;
                backLegOffX = 2;
                backLegOffY = 0;
                frontLegOffX = -2;
                frontLegOffY = 0;
                bodyDip = -2;
                thrusterGlow = 0.32;
            }

            const bodyY = cy + bodyDip;

            // 1. Ground Energy Shadow
            byteG.fillStyle(0x00f2fe, thrusterGlow);
            byteG.fillEllipse(cx, cy + 86, 68, 16);
            byteG.fillStyle(0x00f2fe, thrusterGlow * 0.4);
            byteG.fillEllipse(cx, cy + 86, 92, 22);

            // 2. LAYER: Back Arm (Left Arm - Behind Torso)
            const bShoulderX = cx - 18;
            const bShoulderY = bodyY + 6;
            const bElbowX = bShoulderX + Math.sin(backArmAngle) * 16 - 6;
            const bElbowY = bShoulderY + Math.cos(backArmAngle) * 16;
            const bHandX = bElbowX + Math.sin(backArmAngle * 1.2) * 16;
            const bHandY = bElbowY + Math.cos(backArmAngle * 1.2) * 16;

            // Back Shoulder Socket
            byteG.fillStyle(0x334155, 1);
            byteG.fillCircle(bShoulderX, bShoulderY, 6);
            // Upper Arm & Forearm
            byteG.lineStyle(8, 0x0284c7, 1);
            byteG.lineBetween(bShoulderX, bShoulderY, bElbowX, bElbowY);
            byteG.lineStyle(6, 0xf1f5f9, 1);
            byteG.lineBetween(bShoulderX, bShoulderY, bElbowX, bElbowY);
            byteG.lineStyle(7, 0x0284c7, 1);
            byteG.lineBetween(bElbowX, bElbowY, bHandX, bHandY);
            byteG.lineStyle(5, 0xf1f5f9, 1);
            byteG.lineBetween(bElbowX, bElbowY, bHandX, bHandY);
            // Back Hand / Mitten
            byteG.fillStyle(0x0ea5e9, 1);
            byteG.fillCircle(bHandX, bHandY, 7);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(bHandX, bHandY, 3.5);

            // 3. LAYER: Back Leg (Behind Torso)
            const bHipX = cx - 14 + backLegOffX;
            const bHipY = bodyY + 36;
            byteG.fillStyle(0x334155, 1);
            byteG.fillRoundedRect(bHipX - 6, bHipY, 12, 18, 4);
            // Shin Armor
            byteG.fillStyle(0xf1f5f9, 1);
            byteG.lineStyle(2, 0x0284c7, 1);
            byteG.fillRoundedRect(bHipX - 7, bHipY + 14 + backLegOffY, 14, 20, 4);
            byteG.strokeRoundedRect(bHipX - 7, bHipY + 14 + backLegOffY, 14, 20, 4);
            // Back Sneaker / Boot
            byteG.fillStyle(0x0f172a, 1);
            byteG.fillRoundedRect(bHipX - 10, bHipY + 32 + backLegOffY, 20, 13, 4);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillRoundedRect(bHipX - 9, bHipY + 41 + backLegOffY, 18, 4, 2);

            // 4. LAYER: Torso & Neck
            byteG.fillStyle(0x1e293b, 1);
            byteG.fillRoundedRect(cx - 24, bodyY - 2, 48, 42, 12);
            byteG.fillStyle(0xf8fafc, 1);
            byteG.lineStyle(3, 0x0284c7, 1);
            byteG.fillRoundedRect(cx - 20, bodyY, 40, 38, 10);
            byteG.strokeRoundedRect(cx - 20, bodyY, 40, 38, 10);

            // Circuit Traces on Torso
            byteG.lineStyle(2, 0x00f2fe, 0.9);
            byteG.beginPath();
            byteG.moveTo(cx - 14, bodyY + 6);
            byteG.lineTo(cx - 5, bodyY + 18);
            byteG.lineTo(cx + 5, bodyY + 18);
            byteG.lineTo(cx + 14, bodyY + 6);
            byteG.strokePath();

            // Chest Reactor Core
            byteG.fillStyle(0x0f172a, 1);
            byteG.fillCircle(cx, bodyY + 22, 10);
            byteG.lineStyle(2, 0x00f2fe, 1);
            byteG.strokeCircle(cx, bodyY + 22, 10);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(cx, bodyY + 22, 6.5);
            byteG.fillStyle(0xffffff, 1);
            byteG.fillCircle(cx - 2, bodyY + 20, 2);

            // Neck Segment
            byteG.fillStyle(0x334155, 1);
            byteG.fillRoundedRect(cx - 8, bodyY - 10, 16, 12, 4);

            // 5. LAYER: Front Leg
            const fHipX = cx + 10 + frontLegOffX;
            const fHipY = bodyY + 36;
            byteG.fillStyle(0x334155, 1);
            byteG.fillRoundedRect(fHipX - 6, fHipY, 12, 18, 4);
            // Shin Armor
            byteG.fillStyle(0xf1f5f9, 1);
            byteG.lineStyle(2, 0x0284c7, 1);
            byteG.fillRoundedRect(fHipX - 7, fHipY + 14 + frontLegOffY, 14, 20, 4);
            byteG.strokeRoundedRect(fHipX - 7, fHipY + 14 + frontLegOffY, 14, 20, 4);
            // Cyan circuit seam
            byteG.lineStyle(2, 0x00f2fe, 1);
            byteG.lineBetween(fHipX, fHipY + 16 + frontLegOffY, fHipX, fHipY + 30 + frontLegOffY);
            // Front Sneaker / Boot
            byteG.fillStyle(0x0f172a, 1);
            byteG.fillRoundedRect(fHipX - 10, fHipY + 32 + frontLegOffY, 22, 14, 5);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillRoundedRect(fHipX - 9, fHipY + 41 + frontLegOffY, 20, 5, 2);

            // 6. LAYER: Head & Screen Visor
            // Round Helmet
            byteG.fillStyle(0xf8fafc, 1);
            byteG.lineStyle(4, 0x0284c7, 1);
            byteG.fillRoundedRect(cx - 40, bodyY - 66, 80, 58, 24);
            byteG.strokeRoundedRect(cx - 40, bodyY - 66, 80, 58, 24);

            // Ear Pods
            byteG.fillStyle(0x0ea5e9, 1);
            byteG.fillRoundedRect(cx - 46, bodyY - 46, 8, 20, 4);
            byteG.fillRoundedRect(cx + 38, bodyY - 46, 8, 20, 4);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(cx - 42, bodyY - 36, 3);
            byteG.fillCircle(cx + 42, bodyY - 36, 3);

            // Antenna (leaning slightly towards gate)
            byteG.lineStyle(3, 0x64748b, 1);
            byteG.lineBetween(cx - 2, bodyY - 66, cx + 4, bodyY - 80);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(cx + 5, bodyY - 84, 7);
            byteG.fillStyle(0xffffff, 1);
            byteG.fillCircle(cx + 3, bodyY - 86, 2.5);

            // Screen Face Visor (facing towards gate)
            byteG.fillStyle(0x090d16, 1);
            byteG.fillRoundedRect(cx - 30, bodyY - 56, 64, 40, 14);
            byteG.lineStyle(2.5, 0x00f2fe, 0.9);
            byteG.strokeRoundedRect(cx - 30, bodyY - 56, 64, 40, 14);

            // Visor reflection
            byteG.lineStyle(2, 0xffffff, 0.4);
            byteG.beginPath();
            byteG.moveTo(cx - 20, bodyY - 50);
            byteG.lineTo(cx - 10, bodyY - 50);
            byteG.strokePath();

            // Friendly Cyan LED Eyes (Looking towards the gate)
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillRoundedRect(cx - 18, bodyY - 44, 14, 14, 4);
            byteG.fillRoundedRect(cx + 10, bodyY - 44, 14, 14, 4);
            byteG.fillStyle(0xffffff, 1);
            byteG.fillCircle(cx - 13, bodyY - 40, 2.5);
            byteG.fillCircle(cx + 15, bodyY - 40, 2.5);

            // Cheek Blush
            byteG.fillStyle(0x00f2fe, 0.45);
            byteG.fillCircle(cx - 20, bodyY - 26, 3);
            byteG.fillCircle(cx + 26, bodyY - 26, 3);

            // Smile
            byteG.lineStyle(3, 0x00f2fe, 1);
            byteG.beginPath();
            byteG.arc(cx + 2, bodyY - 25, 9, 0.2, Math.PI - 0.2, false);
            byteG.strokePath();

            // 7. LAYER: Front Arm (Right Arm - IN FRONT of Torso)
            const fShoulderX = cx + 18;
            const fShoulderY = bodyY + 6;
            const fElbowX = fShoulderX + Math.sin(frontArmAngle) * 16 + 6;
            const fElbowY = fShoulderY + Math.cos(frontArmAngle) * 16;
            const fHandX = fElbowX + Math.sin(frontArmAngle * 1.2) * 16;
            const fHandY = fElbowY + Math.cos(frontArmAngle * 1.2) * 16;

            // Front Shoulder Joint Socket (Connected firmly to torso)
            byteG.fillStyle(0x334155, 1);
            byteG.fillCircle(fShoulderX, fShoulderY, 7);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(fShoulderX, fShoulderY, 3);

            // Upper Arm
            byteG.lineStyle(9, 0x0284c7, 1);
            byteG.lineBetween(fShoulderX, fShoulderY, fElbowX, fElbowY);
            byteG.lineStyle(7, 0xf8fafc, 1);
            byteG.lineBetween(fShoulderX, fShoulderY, fElbowX, fElbowY);

            // Forearm
            byteG.lineStyle(8, 0x0284c7, 1);
            byteG.lineBetween(fElbowX, fElbowY, fHandX, fHandY);
            byteG.lineStyle(6, 0xf8fafc, 1);
            byteG.lineBetween(fElbowX, fElbowY, fHandX, fHandY);

            // Front Hand / Mitten (In front of chest)
            byteG.fillStyle(0x0ea5e9, 1);
            byteG.fillCircle(fHandX, fHandY, 8);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(fHandX, fHandY, 4);

            byteG.generateTexture(`byte_run_${frame}`, 180, 200);
            if (frame === 0) {
                byteG.generateTexture('byte_robot_default', 180, 200);
            }
        }

        // Register Phaser animation 'byte_run'
        if (!scene.anims.exists('byte_run')) {
            scene.anims.create({
                key: 'byte_run',
                frames: [
                    { key: 'byte_run_0' },
                    { key: 'byte_run_1' },
                    { key: 'byte_run_2' },
                    { key: 'byte_run_3' }
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        // Generate 4-Frame Walking Animation Cycle for Byte (Smooth awaiting lateral stride)
        for (let frame = 0; frame < 4; frame++) {
            const byteG = scene.make.graphics({ x: 0, y: 0 });
            const cx = 90;
            const cy = 100;

            // Subtle walking kinematics (relaxed arms and gentle footstep offset)
            let backArmAngle = 0;
            let frontArmAngle = 0;
            let backLegOffY = 0;
            let backLegOffX = 0;
            let frontLegOffY = 0;
            let frontLegOffX = 0;
            let bodyDip = 0;

            if (frame === 0) {
                // Right foot stepping forward gently, Left foot trailing slightly
                backArmAngle = 0.25;
                frontArmAngle = -0.25;
                backLegOffX = -4;
                backLegOffY = -2;
                frontLegOffX = 4;
                frontLegOffY = 2;
            } else if (frame === 1) {
                // Passing plant phase
                backArmAngle = 0.05;
                frontArmAngle = -0.05;
                backLegOffX = -1;
                backLegOffY = 0;
                frontLegOffX = 1;
                frontLegOffY = 0;
                bodyDip = 1;
            } else if (frame === 2) {
                // Left foot stepping forward gently, Right foot trailing slightly
                backArmAngle = -0.25;
                frontArmAngle = 0.25;
                backLegOffX = 4;
                backLegOffY = 2;
                frontLegOffX = -4;
                frontLegOffY = -2;
            } else if (frame === 3) {
                // Passing lift phase
                backArmAngle = -0.05;
                frontArmAngle = 0.05;
                backLegOffX = 1;
                backLegOffY = 0;
                frontLegOffX = -1;
                frontLegOffY = 0;
                bodyDip = -1;
            }

            const bodyY = cy + bodyDip;

            // Ground Energy Shadow
            byteG.fillStyle(0x00f2fe, 0.35);
            byteG.fillEllipse(cx, cy + 86, 68, 16);

            // Back Arm (Left Arm)
            const bShoulderX = cx - 18;
            const bShoulderY = bodyY + 6;
            const bElbowX = bShoulderX + Math.sin(backArmAngle) * 14 - 4;
            const bElbowY = bShoulderY + Math.cos(backArmAngle) * 14;
            const bHandX = bElbowX + Math.sin(backArmAngle * 1.1) * 14;
            const bHandY = bElbowY + Math.cos(backArmAngle * 1.1) * 14;

            byteG.fillStyle(0x334155, 1);
            byteG.fillCircle(bShoulderX, bShoulderY, 6);
            byteG.lineStyle(8, 0x0284c7, 1);
            byteG.lineBetween(bShoulderX, bShoulderY, bElbowX, bElbowY);
            byteG.lineStyle(6, 0xf1f5f9, 1);
            byteG.lineBetween(bShoulderX, bShoulderY, bElbowX, bElbowY);
            byteG.lineStyle(7, 0x0284c7, 1);
            byteG.lineBetween(bElbowX, bElbowY, bHandX, bHandY);
            byteG.lineStyle(5, 0xf1f5f9, 1);
            byteG.lineBetween(bElbowX, bElbowY, bHandX, bHandY);
            byteG.fillStyle(0x0ea5e9, 1);
            byteG.fillCircle(bHandX, bHandY, 7);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(bHandX, bHandY, 3.5);

            // Back Leg
            const bHipX = cx - 10 + backLegOffX;
            const bHipY = bodyY + 36;
            byteG.fillStyle(0x334155, 1);
            byteG.fillRoundedRect(bHipX - 6, bHipY, 12, 18, 4);
            byteG.fillStyle(0xe2e8f0, 1);
            byteG.lineStyle(2, 0x0284c7, 1);
            byteG.fillRoundedRect(bHipX - 7, bHipY + 14 + backLegOffY, 14, 20, 4);
            byteG.strokeRoundedRect(bHipX - 7, bHipY + 14 + backLegOffY, 14, 20, 4);
            byteG.fillStyle(0x0f172a, 1);
            byteG.fillRoundedRect(bHipX - 10, bHipY + 32 + backLegOffY, 20, 14, 4);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillRoundedRect(bHipX - 9, bHipY + 41 + backLegOffY, 18, 5, 2);

            // Torso
            byteG.fillStyle(0x1e293b, 1);
            byteG.fillRoundedRect(cx - 24, bodyY - 2, 48, 42, 12);
            byteG.fillStyle(0xf8fafc, 1);
            byteG.lineStyle(3, 0x0284c7, 1);
            byteG.fillRoundedRect(cx - 20, bodyY, 40, 38, 10);
            byteG.strokeRoundedRect(cx - 20, bodyY, 40, 38, 10);

            // Circuit Traces
            byteG.lineStyle(2, 0x00f2fe, 0.9);
            byteG.beginPath();
            byteG.moveTo(cx - 14, bodyY + 6);
            byteG.lineTo(cx - 5, bodyY + 18);
            byteG.lineTo(cx + 5, bodyY + 18);
            byteG.lineTo(cx + 14, bodyY + 6);
            byteG.strokePath();

            // Chest Reactor
            byteG.fillStyle(0x0f172a, 1);
            byteG.fillCircle(cx, bodyY + 22, 10);
            byteG.lineStyle(2, 0x00f2fe, 1);
            byteG.strokeCircle(cx, bodyY + 22, 10);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(cx, bodyY + 22, 6.5);
            byteG.fillStyle(0xffffff, 1);
            byteG.fillCircle(cx - 2, bodyY + 20, 2);

            // Neck
            byteG.fillStyle(0x334155, 1);
            byteG.fillRoundedRect(cx - 8, bodyY - 10, 16, 12, 4);

            // Front Leg
            const fHipX = cx + 10 + frontLegOffX;
            const fHipY = bodyY + 36;
            byteG.fillStyle(0x334155, 1);
            byteG.fillRoundedRect(fHipX - 6, fHipY, 12, 18, 4);
            byteG.fillStyle(0xf1f5f9, 1);
            byteG.lineStyle(2, 0x0284c7, 1);
            byteG.fillRoundedRect(fHipX - 7, fHipY + 14 + frontLegOffY, 14, 20, 4);
            byteG.strokeRoundedRect(fHipX - 7, fHipY + 14 + frontLegOffY, 14, 20, 4);
            byteG.lineStyle(2, 0x00f2fe, 1);
            byteG.lineBetween(fHipX, fHipY + 16 + frontLegOffY, fHipX, fHipY + 30 + frontLegOffY);
            byteG.fillStyle(0x0f172a, 1);
            byteG.fillRoundedRect(fHipX - 10, fHipY + 32 + frontLegOffY, 22, 14, 5);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillRoundedRect(fHipX - 9, fHipY + 41 + frontLegOffY, 20, 5, 2);

            // Head & Screen Visor
            byteG.fillStyle(0xf8fafc, 1);
            byteG.lineStyle(4, 0x0284c7, 1);
            byteG.fillRoundedRect(cx - 40, bodyY - 66, 80, 58, 24);
            byteG.strokeRoundedRect(cx - 40, bodyY - 66, 80, 58, 24);

            byteG.fillStyle(0x0ea5e9, 1);
            byteG.fillRoundedRect(cx - 46, bodyY - 46, 8, 20, 4);
            byteG.fillRoundedRect(cx + 38, bodyY - 46, 8, 20, 4);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(cx - 42, bodyY - 36, 3);
            byteG.fillCircle(cx + 42, bodyY - 36, 3);

            byteG.lineStyle(3, 0x64748b, 1);
            byteG.lineBetween(cx, bodyY - 66, cx, bodyY - 80);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(cx, bodyY - 84, 7);
            byteG.fillStyle(0xffffff, 1);
            byteG.fillCircle(cx - 2, bodyY - 86, 2.5);

            // Screen Visor with Focused Alert Eyes
            byteG.fillStyle(0x090d16, 1);
            byteG.fillRoundedRect(cx - 32, bodyY - 56, 64, 40, 14);
            byteG.lineStyle(2.5, 0x00f2fe, 0.9);
            byteG.strokeRoundedRect(cx - 32, bodyY - 56, 64, 40, 14);

            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillRoundedRect(cx - 22, bodyY - 44, 14, 12, 4);
            byteG.fillRoundedRect(cx + 8, bodyY - 44, 14, 12, 4);
            byteG.fillStyle(0xffffff, 1);
            byteG.fillCircle(cx - 16, bodyY - 40, 2.5);
            byteG.fillCircle(cx + 14, bodyY - 40, 2.5);

            byteG.lineStyle(3, 0x00f2fe, 1);
            byteG.beginPath();
            byteG.arc(cx + 2, bodyY - 25, 9, 0.2, Math.PI - 0.2, false);
            byteG.strokePath();

            // Front Arm (Right Arm)
            const fShoulderX = cx + 18;
            const fShoulderY = bodyY + 6;
            const fElbowX = fShoulderX + Math.sin(frontArmAngle) * 14 + 4;
            const fElbowY = fShoulderY + Math.cos(frontArmAngle) * 14;
            const fHandX = fElbowX + Math.sin(frontArmAngle * 1.1) * 14;
            const fHandY = fElbowY + Math.cos(frontArmAngle * 1.1) * 14;

            byteG.fillStyle(0x334155, 1);
            byteG.fillCircle(fShoulderX, fShoulderY, 7);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(fShoulderX, fShoulderY, 3);
            byteG.lineStyle(9, 0x0284c7, 1);
            byteG.lineBetween(fShoulderX, fShoulderY, fElbowX, fElbowY);
            byteG.lineStyle(7, 0xf8fafc, 1);
            byteG.lineBetween(fShoulderX, fShoulderY, fElbowX, fElbowY);
            byteG.lineStyle(8, 0x0284c7, 1);
            byteG.lineBetween(fElbowX, fElbowY, fHandX, fHandY);
            byteG.lineStyle(6, 0xf8fafc, 1);
            byteG.lineBetween(fElbowX, fElbowY, fHandX, fHandY);
            byteG.fillStyle(0x0ea5e9, 1);
            byteG.fillCircle(fHandX, fHandY, 8);
            byteG.fillStyle(0x00f2fe, 1);
            byteG.fillCircle(fHandX, fHandY, 4);

            byteG.generateTexture(`byte_walk_${frame}`, 180, 200);
        }

        // Register Phaser animation 'byte_walk'
        if (!scene.anims.exists('byte_walk')) {
            scene.anims.create({
                key: 'byte_walk',
                frames: [
                    { key: 'byte_walk_0' },
                    { key: 'byte_walk_1' },
                    { key: 'byte_walk_2' },
                    { key: 'byte_walk_3' }
                ],
                frameRate: 6,
                repeat: -1
            });
        }

        // Register chimpu_walk animation if not already registered
        if (scene.textures.exists('chimpu_run') && !scene.anims.exists('chimpu_walk')) {
            scene.anims.create({
                key: 'chimpu_walk',
                frames: scene.anims.generateFrameNumbers('chimpu_run', { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1
            });
        }

        // 2. Byte Happy Frame (Celebrating with arms up and happy ^ ^ eyes)
        const byteH = scene.make.graphics({ x: 0, y: 0 });
        const cx = 90;
        const cy = 100;
        // Glow shadow
        byteH.fillStyle(0x00f2fe, 0.4);
        byteH.fillEllipse(cx, cy + 86, 76, 18);

        // Legs
        byteH.fillStyle(0x334155, 1);
        byteH.fillRoundedRect(cx - 20, cy + 36, 12, 18, 4);
        byteH.fillRoundedRect(cx + 8, cy + 36, 12, 18, 4);

        byteH.fillStyle(0xf1f5f9, 1);
        byteH.lineStyle(2, 0x0284c7, 1);
        byteH.fillRoundedRect(cx - 21, cy + 50, 14, 20, 4);
        byteH.strokeRoundedRect(cx - 21, cy + 50, 14, 20, 4);
        byteH.fillRoundedRect(cx + 7, cy + 50, 14, 20, 4);
        byteH.strokeRoundedRect(cx + 7, cy + 50, 14, 20, 4);

        byteH.fillStyle(0x0f172a, 1);
        byteH.fillRoundedRect(cx - 24, cy + 68, 20, 14, 4);
        byteH.fillRoundedRect(cx + 4, cy + 68, 20, 14, 4);
        byteH.fillStyle(0x00f2fe, 1);
        byteH.fillRoundedRect(cx - 23, cy + 77, 18, 5, 2);
        byteH.fillRoundedRect(cx + 5, cy + 77, 18, 5, 2);

        // Torso
        byteH.fillStyle(0x1e293b, 1);
        byteH.fillRoundedRect(cx - 24, cy - 2, 48, 42, 12);
        byteH.fillStyle(0xf8fafc, 1);
        byteH.lineStyle(3, 0x0284c7, 1);
        byteH.fillRoundedRect(cx - 20, cy, 40, 38, 10);
        byteH.strokeRoundedRect(cx - 20, cy, 40, 38, 10);

        byteH.fillStyle(0x0f172a, 1);
        byteH.fillCircle(cx, cy + 22, 10);
        byteH.lineStyle(2, 0x00f2fe, 1);
        byteH.strokeCircle(cx, cy + 22, 10);
        byteH.fillStyle(0x00f2fe, 1);
        byteH.fillCircle(cx, cy + 22, 6.5);
        byteH.fillStyle(0xffffff, 1);
        byteH.fillCircle(cx - 2, cy + 20, 2);

        // Neck
        byteH.fillStyle(0x334155, 1);
        byteH.fillRoundedRect(cx - 8, cy - 10, 16, 12, 4);

        // Round Head & Antenna
        byteH.fillStyle(0xf8fafc, 1);
        byteH.lineStyle(4, 0x0284c7, 1);
        byteH.fillRoundedRect(cx - 40, cy - 66, 80, 58, 24);
        byteH.strokeRoundedRect(cx - 40, cy - 66, 80, 58, 24);

        byteH.fillStyle(0x0ea5e9, 1);
        byteH.fillRoundedRect(cx - 46, cy - 46, 8, 20, 4);
        byteH.fillRoundedRect(cx + 38, cy - 46, 8, 20, 4);
        byteH.fillStyle(0x00f2fe, 1);
        byteH.fillCircle(cx - 42, cy - 36, 3);
        byteH.fillCircle(cx + 42, cy - 36, 3);

        byteH.lineStyle(3, 0x64748b, 1);
        byteH.lineBetween(cx, cy - 66, cx, cy - 80);
        byteH.fillStyle(0x00f2fe, 1);
        byteH.fillCircle(cx, cy - 84, 7);
        byteH.fillStyle(0xffffff, 1);
        byteH.fillCircle(cx - 2, cy - 86, 2.5);

        // Screen Visor
        byteH.fillStyle(0x090d16, 1);
        byteH.fillRoundedRect(cx - 32, cy - 56, 64, 40, 14);
        byteH.lineStyle(2.5, 0x00f2fe, 0.9);
        byteH.strokeRoundedRect(cx - 32, cy - 56, 64, 40, 14);

        // Happy ^ ^ Eyes
        byteH.lineStyle(3.5, 0x00f2fe, 1);
        byteH.beginPath();
        byteH.moveTo(cx - 22, cy - 36);
        byteH.lineTo(cx - 15, cy - 46);
        byteH.lineTo(cx - 8, cy - 36);
        byteH.moveTo(cx + 8, cy - 36);
        byteH.lineTo(cx + 15, cy - 46);
        byteH.lineTo(cx + 22, cy - 36);
        byteH.strokePath();

        // Big Happy Open Smile
        byteH.fillStyle(0x00f2fe, 1);
        byteH.beginPath();
        byteH.arc(cx, cy - 25, 9, 0.1, Math.PI - 0.1, false);
        byteH.closePath();
        byteH.fillPath();

        // Raised Happy Arms (Attached to Shoulders)
        byteH.fillStyle(0x334155, 1);
        byteH.fillCircle(cx - 18, cy + 6, 6);
        byteH.fillCircle(cx + 18, cy + 6, 6);

        byteH.lineStyle(8, 0x0284c7, 1);
        byteH.lineBetween(cx - 18, cy + 6, cx - 36, cy - 20);
        byteH.lineBetween(cx + 18, cy + 6, cx + 36, cy - 20);
        byteH.lineStyle(6, 0xf8fafc, 1);
        byteH.lineBetween(cx - 18, cy + 6, cx - 36, cy - 20);
        byteH.lineBetween(cx + 18, cy + 6, cx + 36, cy - 20);

        byteH.fillStyle(0x0ea5e9, 1);
        byteH.fillCircle(cx - 38, cy - 22, 7);
        byteH.fillCircle(cx + 38, cy - 22, 7);
        byteH.fillStyle(0x00f2fe, 1);
        byteH.fillCircle(cx - 38, cy - 22, 3.5);
        byteH.fillCircle(cx + 38, cy - 22, 3.5);

        byteH.generateTexture('byte_robot_happy', 180, 200);

        // 3. Avatar Portraits (For HUD Buttons)
        // Chimpu Avatar
        const chAv = scene.make.graphics({ x: 0, y: 0 });
        chAv.fillStyle(0xff6b6b, 1);
        chAv.fillCircle(48, 48, 46);
        chAv.lineStyle(4, 0xffffff, 1);
        chAv.strokeCircle(48, 48, 46);
        // Stylized human head & cap
        chAv.fillStyle(0xffd166, 1);
        chAv.fillCircle(48, 52, 28);
        chAv.fillStyle(0xff477e, 1);
        chAv.fillRoundedRect(28, 22, 40, 22, 8);
        chAv.fillStyle(0x222222, 1);
        chAv.fillCircle(40, 50, 4);
        chAv.fillCircle(56, 50, 4);
        chAv.lineStyle(3, 0xff477e, 1);
        chAv.beginPath();
        chAv.arc(48, 60, 10, 0.1, Math.PI - 0.1, false);
        chAv.strokePath();
        chAv.generateTexture('avatar_chimpu', 96, 96);

        // Byte Avatar
        const byAv = scene.make.graphics({ x: 0, y: 0 });
        byAv.fillStyle(0x0ea5e9, 1);
        byAv.fillCircle(48, 48, 46);
        byAv.lineStyle(4, 0x00f2fe, 1);
        byAv.strokeCircle(48, 48, 46);
        // Round Robot head
        byAv.fillStyle(0xf8fafc, 1);
        byAv.lineStyle(3, 0x0284c7, 1);
        byAv.fillRoundedRect(20, 20, 56, 44, 18);
        byAv.strokeRoundedRect(20, 20, 56, 44, 18);
        // Screen Visor
        byAv.fillStyle(0x090d16, 1);
        byAv.fillRoundedRect(26, 26, 44, 30, 10);
        byAv.lineStyle(2, 0x00f2fe, 1);
        byAv.strokeRoundedRect(26, 26, 44, 30, 10);
        // Glowing cyan eyes
        byAv.fillStyle(0x00f2fe, 1);
        byAv.fillRoundedRect(32, 34, 10, 10, 3);
        byAv.fillRoundedRect(54, 34, 10, 10, 3);
        byAv.beginPath();
        byAv.arc(48, 50, 6, 0.2, Math.PI - 0.2, false);
        byAv.strokePath();
        byAv.generateTexture('avatar_byte', 96, 96);
    }

    private static generateGateFrames(scene: Scene) {
        const gw = 1000;
        const gh = 430;

        // 1. AI Gate Frame (Cyan)
        const aiG = scene.make.graphics({ x: 0, y: 0 });
        aiG.fillStyle(0x00f2fe, 0.12);
        aiG.fillRoundedRect(10, 10, gw - 20, gh - 20, 24);
        aiG.lineStyle(10, 0x00f2fe, 0.95);
        aiG.strokeRoundedRect(10, 10, gw - 20, gh - 20, 24);
        aiG.lineStyle(4, 0xffffff, 0.8);
        aiG.strokeRoundedRect(18, 18, gw - 36, gh - 36, 18);

        // Neon AI Pillar accents
        aiG.fillStyle(0x00f2fe, 1);
        aiG.fillCircle(30, 30, 14);
        aiG.fillCircle(gw - 30, 30, 14);
        aiG.fillCircle(30, gh - 30, 14);
        aiG.fillCircle(gw - 30, gh - 30, 14);
        aiG.generateTexture('gate_frame_ai', gw, gh);

        // 2. Human Gate Frame (Coral/Orange)
        const humG = scene.make.graphics({ x: 0, y: 0 });
        humG.fillStyle(0xff6b6b, 0.12);
        humG.fillRoundedRect(10, 10, gw - 20, gh - 20, 24);
        humG.lineStyle(10, 0xff6b6b, 0.95);
        humG.strokeRoundedRect(10, 10, gw - 20, gh - 20, 24);
        humG.lineStyle(4, 0xffd166, 0.8);
        humG.strokeRoundedRect(18, 18, gw - 36, gh - 36, 18);

        humG.fillStyle(0xff6b6b, 1);
        humG.fillCircle(30, 30, 14);
        humG.fillCircle(gw - 30, 30, 14);
        humG.fillCircle(30, gh - 30, 14);
        humG.fillCircle(gw - 30, gh - 30, 14);
        humG.generateTexture('gate_frame_human', gw, gh);

        // 3. Team Gate Frame (Purple Dual-Gate)
        const teamG = scene.make.graphics({ x: 0, y: 0 });
        teamG.fillStyle(0xa855f7, 0.15);
        teamG.fillRoundedRect(10, 10, gw - 20, gh - 20, 24);
        teamG.lineStyle(10, 0xa855f7, 0.95);
        teamG.strokeRoundedRect(10, 10, gw - 20, gh - 20, 24);

        // Split Divider in the center
        teamG.lineStyle(6, 0xffffff, 0.8);
        teamG.lineBetween(gw / 2, 20, gw / 2, gh - 20);

        // Left Cyan Half & Right Coral Half Highlights
        teamG.fillStyle(0x00f2fe, 0.2);
        teamG.fillRoundedRect(20, 20, gw / 2 - 30, gh - 40, 14);
        teamG.fillStyle(0xff6b6b, 0.2);
        teamG.fillRoundedRect(gw / 2 + 10, 20, gw / 2 - 30, gh - 40, 14);

        teamG.generateTexture('gate_frame_team', gw, gh);
    }

    private static generateTaskIcons(scene: Scene) {
        const size = 128;
        const half = size / 2;

        // 1. File Sorting
        const fs = scene.make.graphics({ x: 0, y: 0 });
        fs.fillStyle(0x1e293b, 1);
        fs.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        fs.lineStyle(3, 0x38bdf8, 1);
        fs.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Folder shapes
        fs.fillStyle(0x38bdf8, 1);
        fs.fillRoundedRect(28, 38, 72, 48, 8);
        fs.fillStyle(0x0284c7, 1);
        fs.fillRoundedRect(28, 28, 32, 14, 4);
        // Sorting arrows
        fs.lineStyle(4, 0xffd166, 1);
        fs.lineBetween(40, 96, 88, 96);
        fs.beginPath();
        fs.moveTo(80, 90);
        fs.lineTo(88, 96);
        fs.lineTo(80, 102);
        fs.strokePath();
        fs.generateTexture('icon_file_sorting', size, size);

        // 2. Calculator
        const calc = scene.make.graphics({ x: 0, y: 0 });
        calc.fillStyle(0x1e293b, 1);
        calc.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        calc.lineStyle(3, 0x00f2fe, 1);
        calc.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Calculator body
        calc.fillStyle(0x0f172a, 1);
        calc.fillRoundedRect(28, 22, 72, 84, 10);
        // Screen
        calc.fillStyle(0x00f2fe, 0.4);
        calc.fillRect(36, 30, 56, 18);
        // Math keys
        calc.fillStyle(0x38bdf8, 1);
        calc.fillCircle(44, 62, 6);
        calc.fillCircle(64, 62, 6);
        calc.fillCircle(84, 62, 6);
        calc.fillCircle(44, 82, 6);
        calc.fillCircle(64, 82, 6);
        calc.fillStyle(0x10b981, 1);
        calc.fillRoundedRect(76, 74, 16, 16, 4);
        calc.generateTexture('icon_calculator', size, size);

        // 3. Pattern Grid
        const pat = scene.make.graphics({ x: 0, y: 0 });
        pat.fillStyle(0x1e293b, 1);
        pat.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        pat.lineStyle(3, 0x38bdf8, 1);
        pat.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Sequence of shapes: Circle, Triangle, Square, Question mark
        pat.fillStyle(0x00f2fe, 1);
        pat.fillCircle(38, 44, 12);
        pat.fillStyle(0xff6b6b, 1);
        pat.beginPath();
        pat.moveTo(90, 32);
        pat.lineTo(102, 54);
        pat.lineTo(78, 54);
        pat.closePath();
        pat.fillPath();
        pat.fillStyle(0xfbbf24, 1);
        pat.fillRect(28, 72, 22, 22);
        pat.lineStyle(4, 0xa855f7, 1);
        pat.strokeCircle(90, 84, 14);
        pat.generateTexture('icon_pattern', size, size);

        // 4. Image Search
        const img = scene.make.graphics({ x: 0, y: 0 });
        img.fillStyle(0x1e293b, 1);
        img.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        img.lineStyle(3, 0x38bdf8, 1);
        img.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Photo frame
        img.fillStyle(0x334155, 1);
        img.fillRect(28, 28, 72, 52);
        img.fillStyle(0x38bdf8, 1);
        img.fillCircle(44, 44, 7);
        img.fillStyle(0x10b981, 1);
        img.beginPath();
        img.moveTo(32, 70);
        img.lineTo(50, 48);
        img.lineTo(68, 70);
        img.closePath();
        img.fillPath();
        // Magnifying glass
        img.lineStyle(5, 0xffcc00, 1);
        img.strokeCircle(76, 76, 18);
        img.lineBetween(88, 88, 106, 106);
        img.generateTexture('icon_image_search', size, size);

        // 5. Route Comparison
        const rt = scene.make.graphics({ x: 0, y: 0 });
        rt.fillStyle(0x1e293b, 1);
        rt.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        rt.lineStyle(3, 0x38bdf8, 1);
        rt.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Map paths
        rt.lineStyle(4, 0x00f2fe, 1);
        rt.lineBetween(32, 96, 64, 48);
        rt.lineBetween(64, 48, 96, 32);
        rt.lineStyle(4, 0xff477e, 0.8);
        rt.lineBetween(32, 96, 80, 80);
        rt.lineBetween(80, 80, 96, 32);
        // Pins
        rt.fillStyle(0x10b981, 1);
        rt.fillCircle(32, 96, 8);
        rt.fillStyle(0xef4444, 1);
        rt.fillCircle(96, 32, 8);
        rt.generateTexture('icon_route', size, size);

        // 6. Comfort a Friend
        const cf = scene.make.graphics({ x: 0, y: 0 });
        cf.fillStyle(0x1e293b, 1);
        cf.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        cf.lineStyle(3, 0xff6b6b, 1);
        cf.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Heart
        cf.fillStyle(0xff477e, 1);
        cf.fillCircle(50, 48, 18);
        cf.fillCircle(78, 48, 18);
        cf.beginPath();
        cf.moveTo(34, 54);
        cf.lineTo(64, 94);
        cf.lineTo(94, 54);
        cf.closePath();
        cf.fillPath();
        // Warm glow sparkle
        cf.fillStyle(0xffffff, 0.9);
        cf.fillCircle(50, 44, 5);
        cf.generateTexture('icon_comfort_friend', size, size);

        // 7. Decide Fairness
        const fair = scene.make.graphics({ x: 0, y: 0 });
        fair.fillStyle(0x1e293b, 1);
        fair.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        fair.lineStyle(3, 0xff6b6b, 1);
        fair.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Scales
        fair.lineStyle(4, 0xfbbf24, 1);
        fair.lineBetween(half, 24, half, 96);
        fair.lineBetween(28, 44, 100, 44);
        // Bowls
        fair.strokeCircle(34, 70, 12);
        fair.strokeCircle(94, 70, 12);
        fair.generateTexture('icon_fairness', size, size);

        // 8. Personal Memory
        const mem = scene.make.graphics({ x: 0, y: 0 });
        mem.fillStyle(0x1e293b, 1);
        mem.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        mem.lineStyle(3, 0xff6b6b, 1);
        mem.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Cloud memory bubble
        mem.fillStyle(0xffa8ba, 0.9);
        mem.fillCircle(48, 54, 20);
        mem.fillCircle(80, 54, 20);
        mem.fillCircle(64, 40, 22);
        mem.fillCircle(64, 68, 16);
        mem.fillCircle(36, 88, 6);
        mem.fillCircle(28, 98, 4);
        // Sparkle inside
        mem.fillStyle(0xffffff, 1);
        mem.fillCircle(64, 52, 6);
        mem.generateTexture('icon_memory', size, size);

        // 9. Personal Goal
        const gl = scene.make.graphics({ x: 0, y: 0 });
        gl.fillStyle(0x1e293b, 1);
        gl.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        gl.lineStyle(3, 0xff6b6b, 1);
        gl.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Target & Flag
        gl.lineStyle(4, 0xff477e, 1);
        gl.strokeCircle(52, 64, 28);
        gl.strokeCircle(52, 64, 14);
        gl.fillStyle(0xf59e0b, 1);
        gl.fillRect(80, 24, 6, 72);
        gl.beginPath();
        gl.moveTo(86, 24);
        gl.lineTo(112, 38);
        gl.lineTo(86, 52);
        gl.closePath();
        gl.fillPath();
        gl.generateTexture('icon_goal', size, size);

        // 10. Responsibility
        const resp = scene.make.graphics({ x: 0, y: 0 });
        resp.fillStyle(0x1e293b, 1);
        resp.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        resp.lineStyle(3, 0xff6b6b, 1);
        resp.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Golden Badge & Checkmark
        resp.fillStyle(0xf59e0b, 1);
        resp.beginPath();
        resp.moveTo(half, 22);
        resp.lineTo(96, 44);
        resp.lineTo(half, 102);
        resp.lineTo(32, 44);
        resp.closePath();
        resp.fillPath();
        // Checkmark
        resp.lineStyle(6, 0xffffff, 1);
        resp.beginPath();
        resp.moveTo(46, 58);
        resp.lineTo(58, 72);
        resp.lineTo(82, 46);
        resp.strokePath();
        resp.generateTexture('icon_responsibility', size, size);

        // 11. Story Check
        const sc = scene.make.graphics({ x: 0, y: 0 });
        sc.fillStyle(0x1e293b, 1);
        sc.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        sc.lineStyle(3, 0xa855f7, 1);
        sc.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Storybook
        sc.fillStyle(0xfff, 0.9);
        sc.fillRect(32, 30, 64, 52);
        sc.lineStyle(2, 0x64748b, 1);
        sc.lineBetween(40, 42, 88, 42);
        sc.lineBetween(40, 52, 88, 52);
        sc.lineBetween(40, 62, 70, 62);
        // Checkmark / Edit pencil
        sc.fillStyle(0xf59e0b, 1);
        sc.fillRoundedRect(68, 60, 36, 36, 8);
        sc.lineStyle(4, 0xffffff, 1);
        sc.beginPath();
        sc.moveTo(76, 78);
        sc.lineTo(84, 86);
        sc.lineTo(98, 70);
        sc.strokePath();
        sc.generateTexture('icon_story_check', size, size);

        // 12. Video Check
        const vc = scene.make.graphics({ x: 0, y: 0 });
        vc.fillStyle(0x1e293b, 1);
        vc.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        vc.lineStyle(3, 0xa855f7, 1);
        vc.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Screen & play icon
        vc.fillStyle(0x0f172a, 1);
        vc.fillRoundedRect(26, 26, 76, 56, 8);
        vc.fillStyle(0xef4444, 1);
        vc.beginPath();
        vc.moveTo(56, 42);
        vc.lineTo(74, 54);
        vc.lineTo(56, 66);
        vc.closePath();
        vc.fillPath();
        // Verification badge
        vc.fillStyle(0x10b981, 1);
        vc.fillCircle(84, 82, 16);
        vc.lineStyle(3, 0xffffff, 1);
        vc.beginPath();
        vc.moveTo(78, 82);
        vc.lineTo(83, 87);
        vc.lineTo(91, 77);
        vc.strokePath();
        vc.generateTexture('icon_video_check', size, size);

        // 13. Homework Check
        const hc = scene.make.graphics({ x: 0, y: 0 });
        hc.fillStyle(0x1e293b, 1);
        hc.fillRoundedRect(10, 10, size - 20, size - 20, 18);
        hc.lineStyle(3, 0xa855f7, 1);
        hc.strokeRoundedRect(10, 10, size - 20, size - 20, 18);
        // Sheet & question mark
        hc.fillStyle(0xf8fafc, 1);
        hc.fillRect(36, 22, 56, 78);
        hc.lineStyle(4, 0xef4444, 1);
        hc.strokeCircle(64, 48, 10);
        hc.fillStyle(0x10b981, 1);
        hc.fillCircle(64, 80, 8);
        hc.generateTexture('icon_homework_check', size, size);
    }

    private static generateRewardBadges(scene: Scene) {
        const sz = 160;
        const c = sz / 2;

        // 1. Level 1: Strengths Explorer Badge
        const b1 = scene.make.graphics({ x: 0, y: 0 });
        b1.fillStyle(0x0284c7, 1);
        b1.fillCircle(c, c, 72);
        b1.lineStyle(6, 0xfbbf24, 1);
        b1.strokeCircle(c, c, 72);
        b1.fillStyle(0xff6b6b, 1);
        b1.fillCircle(c - 22, c, 22);
        b1.fillStyle(0x00f2fe, 1);
        b1.fillCircle(c + 22, c, 22);
        b1.fillStyle(0xffffff, 1);
        b1.fillCircle(c, c, 12);
        b1.generateTexture('badge_level_1', sz, sz);

        // 2. Level 2: Smart Verifier Badge
        const b2 = scene.make.graphics({ x: 0, y: 0 });
        b2.fillStyle(0x065f46, 1);
        b2.fillCircle(c, c, 72);
        b2.lineStyle(6, 0x10b981, 1);
        b2.strokeCircle(c, c, 72);
        b2.lineStyle(8, 0xfbbf24, 1);
        b2.strokeCircle(c - 8, c - 8, 30);
        b2.lineBetween(c + 14, c + 14, c + 38, c + 38);
        b2.fillStyle(0x10b981, 1);
        b2.fillCircle(c - 8, c - 8, 18);
        b2.generateTexture('badge_level_2', sz, sz);

        // 3. Level 3: Smart Team Captain Badge
        const b3 = scene.make.graphics({ x: 0, y: 0 });
        b3.fillStyle(0x581c87, 1);
        b3.fillCircle(c, c, 72);
        b3.lineStyle(8, 0xa855f7, 1);
        b3.strokeCircle(c, c, 72);
        // Star & Crown
        b3.fillStyle(0xfbbf24, 1);
        b3.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = 38;
            const x = c + r * Math.cos(angle);
            const y = c + r * Math.sin(angle);
            if (i === 0) b3.moveTo(x, y);
            else b3.lineTo(x, y);
        }
        b3.closePath();
        b3.fillPath();
        b3.generateTexture('badge_level_3', sz, sz);
    }

    private static generateButtonSymbols(scene: Scene) {
        // 1. Heart Symbol for Chimpu (Human Empathy/Warmth)
        const hg = scene.make.graphics({ x: 0, y: 0 });
        // Subtle glow outline
        hg.fillStyle(0xff6b6b, 0.4);
        hg.fillCircle(24, 24, 20);
        hg.fillCircle(48, 24, 20);
        // Main Heart shape
        hg.fillStyle(0xff2a6d, 1);
        hg.beginPath();
        hg.moveTo(36, 62);
        hg.lineTo(10, 32);
        hg.arc(23, 23, 14, Math.PI * 0.85, Math.PI * 2, false);
        hg.arc(49, 23, 14, Math.PI, Math.PI * 2.15, false);
        hg.lineTo(36, 62);
        hg.closePath();
        hg.fillPath();
        // Inner 3D highlight
        hg.fillStyle(0xffffff, 0.85);
        hg.fillEllipse(22, 18, 5, 3);
        hg.generateTexture('symbol_heart', 72, 72);

        // 2. Person Symbol for Chimpu (Human Presence/Identity)
        const pg = scene.make.graphics({ x: 0, y: 0 });
        // Person Head
        pg.fillStyle(0xffd166, 1);
        pg.fillCircle(36, 22, 13);
        pg.fillStyle(0xffffff, 0.85);
        pg.fillCircle(33, 19, 4);
        // Person Body / Torso
        pg.fillStyle(0xffd166, 1);
        pg.beginPath();
        pg.moveTo(12, 60);
        pg.lineTo(60, 60);
        pg.lineTo(56, 46);
        pg.arc(36, 46, 19, 0, Math.PI, true);
        pg.lineTo(16, 46);
        pg.closePath();
        pg.fillPath();
        pg.generateTexture('symbol_person', 72, 72);

        // 3. Combined Heart & Person Symbol Badge for Chimpu
        const hpg = scene.make.graphics({ x: 0, y: 0 });
        hpg.fillStyle(0x4c0519, 0.85);
        hpg.fillRoundedRect(4, 4, 104, 52, 14);
        hpg.lineStyle(2, 0xff6b6b, 0.9);
        hpg.strokeRoundedRect(4, 4, 104, 52, 14);
        // Mini Heart on left
        hpg.fillStyle(0xff2a6d, 1);
        hpg.beginPath();
        hpg.moveTo(32, 42);
        hpg.lineTo(16, 24);
        hpg.arc(24, 18, 8, Math.PI * 0.85, Math.PI * 2, false);
        hpg.arc(40, 18, 8, Math.PI, Math.PI * 2.15, false);
        hpg.lineTo(32, 42);
        hpg.closePath();
        hpg.fillPath();
        // Mini Person on right
        hpg.fillStyle(0xffd166, 1);
        hpg.fillCircle(80, 20, 8);
        hpg.beginPath();
        hpg.moveTo(66, 44);
        hpg.lineTo(94, 44);
        hpg.lineTo(92, 34);
        hpg.arc(80, 34, 12, 0, Math.PI, true);
        hpg.lineTo(68, 34);
        hpg.closePath();
        hpg.fillPath();
        hpg.generateTexture('symbol_heart_person', 112, 60);

        // 4. Microchip Symbol for Byte (AI / Logic / Hardware Processor)
        const mg = scene.make.graphics({ x: 0, y: 0 });
        // Metallic connector pins (gold/cyan pins)
        mg.fillStyle(0x38bdf8, 1);
        // Top pins
        mg.fillRect(20, 4, 6, 12);
        mg.fillRect(33, 4, 6, 12);
        mg.fillRect(46, 4, 6, 12);
        // Bottom pins
        mg.fillRect(20, 56, 6, 12);
        mg.fillRect(33, 56, 6, 12);
        mg.fillRect(46, 56, 6, 12);
        // Left pins
        mg.fillRect(4, 20, 12, 6);
        mg.fillRect(4, 33, 12, 6);
        mg.fillRect(4, 46, 12, 6);
        // Right pins
        mg.fillRect(56, 20, 12, 6);
        mg.fillRect(56, 33, 12, 6);
        mg.fillRect(56, 46, 12, 6);

        // Chip main package body
        mg.fillStyle(0x0a1628, 1);
        mg.fillRoundedRect(12, 12, 48, 48, 8);
        mg.lineStyle(3, 0x00f2fe, 1);
        mg.strokeRoundedRect(12, 12, 48, 48, 8);

        // Silicon Core / Die
        mg.fillStyle(0x0284c7, 1);
        mg.fillRoundedRect(22, 22, 28, 28, 4);
        mg.lineStyle(2, 0x38bdf8, 0.9);
        mg.strokeRoundedRect(22, 22, 28, 28, 4);

        // Etched circuit traces
        mg.lineStyle(2, 0x00f2fe, 0.9);
        mg.lineBetween(36, 22, 36, 30);
        mg.lineBetween(36, 42, 36, 50);
        mg.lineBetween(22, 36, 30, 36);
        mg.lineBetween(42, 36, 50, 36);

        // Center glowing node
        mg.fillStyle(0x00f2fe, 1);
        mg.fillCircle(36, 36, 5);
        mg.fillStyle(0xffffff, 1);
        mg.fillCircle(36, 36, 2.5);
        mg.generateTexture('symbol_microchip', 72, 72);

        // 5. Microchip Badge for Byte
        const mbg = scene.make.graphics({ x: 0, y: 0 });
        mbg.fillStyle(0x082f49, 0.85);
        mbg.fillRoundedRect(4, 4, 104, 52, 14);
        mbg.lineStyle(2, 0x00f2fe, 0.9);
        mbg.strokeRoundedRect(4, 4, 104, 52, 14);
        // Draw centered mini microchip
        mbg.fillStyle(0x38bdf8, 1);
        mbg.fillRect(50, 10, 4, 6);
        mbg.fillRect(58, 10, 4, 6);
        mbg.fillRect(50, 44, 4, 6);
        mbg.fillRect(58, 44, 4, 6);
        mbg.fillRect(38, 22, 6, 4);
        mbg.fillRect(38, 30, 6, 4);
        mbg.fillRect(68, 22, 6, 4);
        mbg.fillRect(68, 30, 6, 4);
        mbg.fillStyle(0x0c4a6e, 1);
        mbg.fillRoundedRect(42, 14, 28, 28, 4);
        mbg.lineStyle(2, 0x00f2fe, 1);
        mbg.strokeRoundedRect(42, 14, 28, 28, 4);
        mbg.fillStyle(0x00f2fe, 1);
        mbg.fillCircle(56, 28, 4);
        mbg.fillStyle(0xffffff, 1);
        mbg.fillCircle(56, 28, 2);
        mbg.generateTexture('symbol_microchip_badge', 112, 60);
    }
}
