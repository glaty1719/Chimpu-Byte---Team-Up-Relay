import { Scene, GameObjects } from 'phaser';
import { UILayers } from '../utils/UILayers';
import { AudioManager } from '../services/AudioManager';
import { GateTask, LevelConfig, GAME_LEVELS } from '../data/GateData';

export interface RelayHUDState {
    levelNumber: number;
    levelTitle: string;
    gateIndex: number;
    totalGates: number;
    score: number;
    combo: number;
    teamSpark: number;
    activeTask: GateTask | null;
    isTeamGate: boolean;
    teamStep: number;
    requiredSequence?: ('byte' | 'chimpu')[];
    isTutorial: boolean;
    tutorialTarget?: 'byte' | 'chimpu';
    isInputEnabled: boolean;
}

export class TeamUpRelayFeature {
    private scene: Scene;
    private levelConfig: LevelConfig;
    private currentTaskIndex: number = 0;
    private score: number = 0;
    private combo: number = 0;
    private maxCombo: number = 0;
    private teamSpark: number = 0; // 0 to 100
    private isDestroyed: boolean = false;
    private isPaused: boolean = false;
    private isTransitioning: boolean = false;
    private canAcceptInput: boolean = false;
    private isTrackScrolling: boolean = true;
    private attemptsOnCurrentGate: number = 0;



    // HUD Callback
    private onHUDUpdate: (state: RelayHUDState) => void;
    private onCompleteCallback: (result: { score: number; maxCombo: number; level: number; badgeKey: string }) => void;

    // Visual Objects
    private trackTiles: GameObjects.TileSprite[] = [];
    private leftAudienceLayer: GameObjects.TileSprite | null = null;
    private rightAudienceLayer: GameObjects.TileSprite | null = null;
    private sideDecorations: GameObjects.GameObject[] = [];
    private chimpuContainer!: GameObjects.Container;
    private byteContainer!: GameObjects.Container;
    private chimpuSprite!: GameObjects.Sprite;
    private byteSprite!: GameObjects.Sprite;
    private chimpuGlow!: GameObjects.Graphics;
    private byteGlow!: GameObjects.Graphics;
    private byteBobTween: Phaser.Tweens.Tween | null = null;
    private chimpuBobTween: Phaser.Tweens.Tween | null = null;
    private byteSidewaysTween: Phaser.Tweens.Tween | null = null;
    private chimpuSidewaysTween: Phaser.Tweens.Tween | null = null;

    // Active Gate
    private activeGateContainer: GameObjects.Container | null = null;
    private gateApproachTween: Phaser.Tweens.Tween | null = null;
    private gateBobTween: Phaser.Tweens.Tween | null = null;
    private introContainer: GameObjects.Container | null = null;
    private currentTeamStep: number = 0; // 0 = first step, 1 = second step
    private linkingBeam: GameObjects.Graphics | null = null;

    // Tutorial state
    private isTutorialActive: boolean = false;

    // Constants
    private readonly LANE_X_BYTE = 720;
    private readonly LANE_X_CHIMPU = 1200;
    private readonly RUNNER_Y = 900;
    private readonly HORIZON_Y = 0;
    private readonly GATE_TARGET_Y = 460;


    constructor(
        scene: Scene,
        levelNumber: number,
        onHUDUpdate: (state: RelayHUDState) => void,
        onComplete: (result: { score: number; maxCombo: number; level: number; badgeKey: string }) => void
    ) {
        this.scene = scene;
        const config = GAME_LEVELS.find(l => l.levelNumber === levelNumber) || GAME_LEVELS[0];
        this.levelConfig = config;
        this.onHUDUpdate = onHUDUpdate;
        this.onCompleteCallback = onComplete;

        this.setupEnvironment();
        this.setupRunners();
        this.setupKeyboardInput();

        // Level 1 tutorial check
        if (levelNumber === 1) {
            this.isTutorialActive = true;
        }

        // Initial intro: Both start at center running together, then smoothly move outward to their track lanes
        this.playLevelIntroRun();
    }

    private setupEnvironment() {
        const { width, height } = this.scene.scale;

        // 1. Deep space cyber arena background fill
        this.scene.add.rectangle(width / 2, height / 2, width, height, 0x050811)
            .setDepth(UILayers.GAME_BACKGROUND);

        // 3. PARALLEL AUDIENCE & STADIUM SILHOUETTES ON BOTH SIDES
        // Left Stadium & Audience Grandstand (x: 0 to 460)
        this.leftAudienceLayer = this.scene.add.tileSprite(230, height / 2, 460, height, 'stadium_left_side')
            .setDepth(UILayers.GAME_BACKGROUND + 2)
            .setAlpha(0.95);

        // Right Stadium & Audience Grandstand (x: 1460 to 1920)
        this.rightAudienceLayer = this.scene.add.tileSprite(1690, height / 2, 460, height, 'stadium_right_side')
            .setDepth(UILayers.GAME_BACKGROUND + 2)
            .setAlpha(0.95);

        // 4. Two-Lane Neon Arena Track (Center x: 460 to 1460, width: 1000)
        const trackW = 1000;
        const trackH = height;
        const track = this.scene.add.tileSprite(width / 2, height / 2, trackW, trackH, 'neon_track_tile')
            .setDepth(UILayers.GAME_BACKGROUND + 3);
        this.trackTiles.push(track);

    }


    private setupRunners() {
        const { width } = this.scene.scale;
        const centerX = width / 2;
        const startY = 1050;

        // 1. Byte (AI Robot Runner - Starts bottom-center)
        this.byteContainer = this.scene.add.container(centerX - 35, startY)
            .setDepth(UILayers.GAME_PLAYER);

        this.byteGlow = this.scene.add.graphics();
        this.byteGlow.fillStyle(0x00f2fe, 0.4);
        this.byteGlow.fillCircle(0, -60, 65);
        this.byteGlow.setVisible(false);

        this.byteSprite = this.scene.add.sprite(0, 0, 'byte_robot_default')
            .setScale(0.85)
            .setOrigin(0.5, 0.9);

        if (this.scene.anims.exists('byte_run')) {
            this.byteSprite.play('byte_run');
        }

        this.byteContainer.add([this.byteGlow, this.byteSprite]);

        // 2. Chimpu (Human Runner - Starts bottom-center)
        this.chimpuContainer = this.scene.add.container(centerX + 35, startY)
            .setDepth(UILayers.GAME_PLAYER);

        this.chimpuGlow = this.scene.add.graphics();
        this.chimpuGlow.fillStyle(0xff6b6b, 0.4);
        this.chimpuGlow.fillCircle(0, -60, 65);
        this.chimpuGlow.setVisible(false);

        // Check if chimpu_run spritesheet exists in cache
        if (this.scene.textures.exists('chimpu_run')) {
            this.chimpuSprite = this.scene.add.sprite(0, 0, 'chimpu_run')
                .setScale(0.95)
                .setFlipX(true)
                .setOrigin(0.5, 0.9);
            this.chimpuSprite.play('run', true);
        } else {
            // Vector fallback avatar
            this.chimpuSprite = this.scene.add.sprite(0, 0, 'avatar_chimpu')
                .setScale(1.2)
                .setFlipX(true)
                .setOrigin(0.5, 0.9);
        }

        this.chimpuContainer.add([this.chimpuGlow, this.chimpuSprite]);

        // Linking beam for team actions
        this.linkingBeam = this.scene.add.graphics().setDepth(UILayers.GAME_EFFECTS);
    }

    private playLevelIntroRun() {
        this.isTrackScrolling = true;
        const { width, height } = this.scene.scale;

        // Level Intro Announcement Banner (displayed in center before sprites move outward)
        if (this.introContainer) {
            this.introContainer.destroy();
            this.introContainer = null;
        }

        const introCont = this.scene.add.container(width / 2, height / 2 - 40)
            .setDepth(UILayers.UI_TEXT + 10)
            .setScale(0.8)
            .setAlpha(0);
        this.introContainer = introCont;

        const cardW = 920;
        const cardH = 150;
        const bg = this.scene.add.graphics();
        // Cyber glowing backdrop
        bg.fillStyle(0x0f172a, 0.95);
        bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 24);
        bg.lineStyle(4, 0x00f2fe, 0.9);
        bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 24);

        // Header: LEVEL NUMBER & TITLE
        const titleStr = this.levelConfig.title || `Level ${this.levelConfig.levelNumber}`;
        const titleText = this.scene.add.text(0, 0, titleStr, {
            fontFamily: 'Arial Black',
            fontSize: '64px',
            color: '#38bdf8',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        introCont.add([bg, titleText]);

        // Intro Sequence:
        // 1. Pop-in smoothly
        this.scene.tweens.add({
            targets: introCont,
            scale: 1.0,
            alpha: 1,
            duration: 450,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 2. Hold on screen for 1.4s while runners run together at bottom-center
                this.scene.time.delayedCall(1400, () => {
                    if (this.isDestroyed) {
                        introCont.destroy();
                        this.introContainer = null;
                        return;
                    }

                    // 3. Fade and float out
                    this.scene.tweens.add({
                        targets: introCont,
                        alpha: 0,
                        scale: 1.08,
                        y: height / 2 - 80,
                        duration: 350,
                        ease: 'Quad.easeIn',
                        onComplete: () => {
                            introCont.destroy();
                            this.introContainer = null;
                        }
                    });

                    // 4. Sprites sprint diagonally into their respective lane positions
                    // Byte runs upward-left to lane position
                    this.scene.tweens.add({
                        targets: this.byteContainer,
                        x: this.LANE_X_BYTE,
                        y: this.RUNNER_Y,
                        duration: 850,
                        ease: 'Quad.easeOut'
                    });

                    // Chimpu runs upward-right to lane position
                    this.scene.tweens.add({
                        targets: this.chimpuContainer,
                        x: this.LANE_X_CHIMPU,
                        y: this.RUNNER_Y,
                        duration: 850,
                        ease: 'Quad.easeOut',
                        onComplete: () => {
                            if (this.isDestroyed) return;

                            // Start rhythmic running bob once settled in lane positions
                            this.byteBobTween = this.scene.tweens.add({
                                targets: this.byteContainer,
                                y: this.RUNNER_Y - 8,
                                duration: 260,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut'
                            });
                            this.chimpuBobTween = this.scene.tweens.add({
                                targets: this.chimpuContainer,
                                y: this.RUNNER_Y - 8,
                                duration: 260,
                                yoyo: true,
                                repeat: -1,
                                ease: 'Sine.easeInOut',
                                delay: 130
                            });

                            // Runners are in position: spawn the first gate
                            this.spawnGateForTask(0);
                        }
                    });
                });
            }
        });
    }

    private setRunnersState(state: 'running' | 'awaiting') {
        if (this.isDestroyed) return;

        // Clean up any ongoing bob & sideways pacing tweens
        if (this.byteBobTween) {
            this.byteBobTween.stop();
            this.byteBobTween = null;
        }
        if (this.chimpuBobTween) {
            this.chimpuBobTween.stop();
            this.chimpuBobTween = null;
        }
        if (this.byteSidewaysTween) {
            this.byteSidewaysTween.stop();
            this.byteSidewaysTween = null;
        }
        if (this.chimpuSidewaysTween) {
            this.chimpuSidewaysTween.stop();
            this.chimpuSidewaysTween = null;
        }

        if (state === 'running') {
            // Restore exact lane alignment and default orientation
            this.byteContainer.y = this.RUNNER_Y;
            this.chimpuContainer.y = this.RUNNER_Y;
            this.scene.tweens.add({
                targets: this.byteContainer,
                x: this.LANE_X_BYTE,
                duration: 200,
                ease: 'Sine.easeOut'
            });
            this.scene.tweens.add({
                targets: this.chimpuContainer,
                x: this.LANE_X_CHIMPU,
                duration: 200,
                ease: 'Sine.easeOut'
            });

            this.byteSprite.setFlipX(false);
            this.chimpuSprite.setFlipX(true);

            // Fast running animations
            if (this.scene.anims.exists('byte_run')) {
                this.byteSprite.play('byte_run', true);
            }
            if (this.scene.textures.exists('chimpu_run')) {
                this.chimpuSprite.play('run', true);
            }

            // Quick rhythmic running bob
            this.byteBobTween = this.scene.tweens.add({
                targets: this.byteContainer,
                y: this.RUNNER_Y - 8,
                duration: 260,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.chimpuBobTween = this.scene.tweens.add({
                targets: this.chimpuContainer,
                y: this.RUNNER_Y - 8,
                duration: 260,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            // Awaiting gate decision: sprites stop fast sprint, play slow awaiting walk & pace sideways on track
            if (this.scene.anims.exists('byte_walk')) {
                this.byteSprite.play('byte_walk', true);
            } else {
                this.byteSprite.stop();
                this.byteSprite.setTexture('byte_robot_default');
            }

            if (this.scene.anims.exists('chimpu_walk')) {
                this.chimpuSprite.play('chimpu_walk', true);
            } else if (this.scene.textures.exists('chimpu_run')) {
                this.chimpuSprite.stop();
                this.chimpuSprite.setFrame(0);
            }

            // Slow gentle vertical breathing bob
            this.byteBobTween = this.scene.tweens.add({
                targets: this.byteContainer,
                y: this.RUNNER_Y - 5,
                duration: 550,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.chimpuBobTween = this.scene.tweens.add({
                targets: this.chimpuContainer,
                y: this.RUNNER_Y - 5,
                duration: 550,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Byte walks sideways on its track lane (Moving LEFT initially -> face LEFT)
            this.byteContainer.x = this.LANE_X_BYTE + 30;
            this.byteSprite.setFlipX(false);
            this.byteSidewaysTween = this.scene.tweens.add({
                targets: this.byteContainer,
                x: this.LANE_X_BYTE - 30,
                duration: 1700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onYoyo: () => {
                    // Moving back RIGHT -> face RIGHT
                    this.byteSprite.setFlipX(true);
                },
                onRepeat: () => {
                    // Moving back LEFT -> face LEFT
                    this.byteSprite.setFlipX(false);
                }
            });

            // Chimpu walks sideways on its track lane (Moving RIGHT initially -> face RIGHT)
            this.chimpuContainer.x = this.LANE_X_CHIMPU - 30;
            this.chimpuSprite.setFlipX(false);
            this.chimpuSidewaysTween = this.scene.tweens.add({
                targets: this.chimpuContainer,
                x: this.LANE_X_CHIMPU + 30,
                duration: 1700,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onYoyo: () => {
                    // Moving back LEFT -> face LEFT
                    this.chimpuSprite.setFlipX(true);
                },
                onRepeat: () => {
                    // Moving back RIGHT -> face RIGHT
                    this.chimpuSprite.setFlipX(false);
                }
            });
        }
    }

    private setupKeyboardInput() {
        if (!this.scene.input || !this.scene.input.keyboard) return;

        this.scene.input.keyboard.on('keydown-A', () => this.handlePlayerAction('chimpu'));
        this.scene.input.keyboard.on('keydown-LEFT', () => this.handlePlayerAction('chimpu'));
        this.scene.input.keyboard.on('keydown-D', () => this.handlePlayerAction('byte'));
        this.scene.input.keyboard.on('keydown-RIGHT', () => this.handlePlayerAction('byte'));
    }

    public handleActionFromUI(leader: 'chimpu' | 'byte') {
        this.handlePlayerAction(leader);
    }

    private spawnGateForTask(taskIndex: number) {
        if (this.isDestroyed) return;
        if (taskIndex >= this.levelConfig.tasks.length) {
            this.playFinishLinePortal();
            return;
        }

        this.currentTaskIndex = taskIndex;
        this.attemptsOnCurrentGate = 0;
        this.currentTeamStep = 0;
        const task = this.levelConfig.tasks[taskIndex];

        // Clean up previous gate
        if (this.activeGateContainer) {
            this.activeGateContainer.destroy();
            this.activeGateContainer = null;
        }

        const { width } = this.scene.scale;
        const gateCont = this.scene.add.container(width / 2, this.HORIZON_Y)
            .setDepth(UILayers.GAME_EFFECTS)
            .setScale(0.05)
            .setAlpha(0);

        // Gate Frame selection
        let frameKey = 'gate_frame_ai';
        if (task.gateType === 'human') frameKey = 'gate_frame_human';
        else if (task.gateType === 'team') frameKey = 'gate_frame_team';

        const frameImg = this.scene.add.image(0, 0, frameKey).setOrigin(0.5, 0.5);
        gateCont.add(frameImg);

        // Task Billboard Card (matches gate frame width)
        const cardW = 940;
        const cardH = 390;
        const cardY = -195;
        const cardBg = this.scene.add.graphics();
        cardBg.fillStyle(0x0f172a, 0.95);
        cardBg.fillRoundedRect(-cardW / 2, cardY, cardW, cardH, 20);
        cardBg.lineStyle(4, task.gateType === 'team' ? 0xa855f7 : (task.gateType === 'ai' ? 0x00f2fe : 0xff6b6b), 0.9);
        cardBg.strokeRoundedRect(-cardW / 2, cardY, cardW, cardH, 20);
        gateCont.add(cardBg);

        // Task Category Icon (enlarged with clean top padding)
        if (this.scene.textures.exists(task.iconKey)) {
            const icon = this.scene.add.image(0, -122, task.iconKey).setScale(1.25);
            gateCont.add(icon);
        }

        // Task Title Text (enlarged with increased padding from icon)
        const titleText = this.scene.add.text(0, -2, task.title, {
            fontFamily: 'Arial Black',
            fontSize: '56px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 7
        }).setOrigin(0.5);
        gateCont.add(titleText);

        // Task Short Description (enlarged with clean padding from titleText)
        const isTeam = task.gateType === 'team';
        const descText = this.scene.add.text(0, 104, task.description, {
            fontFamily: 'Arial',
            fontSize: '40px',
            lineSpacing: 10,
            color: '#cbd5e1',
            align: isTeam ? 'left' : 'center',
            wordWrap: { width: cardW - 60 }
        }).setOrigin(0.5);
        gateCont.add(descText);

        this.activeGateContainer = gateCont;
        this.canAcceptInput = false;
        // Gate is approaching: keep runners running forward
        this.setRunnersState('running');

        // Animate Gate approaching with realistic 2.5D perspective scaling from the horizon
        const duration = Math.max(1400, task.decisionTimeSeconds * 1000 * 0.55);

        this.gateApproachTween = this.scene.tweens.add({
            targets: gateCont,
            y: this.GATE_TARGET_Y,
            scale: 1.0,
            alpha: 1,
            duration: duration,
            ease: 'Quad.easeIn',
            onUpdate: (tween) => {
                // Scroll track and parallel stadium audience grandstands based on approach speed
                if (this.trackTiles[0]) {
                    this.trackTiles[0].tilePositionY -= 3.0 + tween.progress * 3.5;
                }
                if (this.leftAudienceLayer) {
                    this.leftAudienceLayer.tilePositionY -= 2.0 + tween.progress * 2.2;
                }
                if (this.rightAudienceLayer) {
                    this.rightAudienceLayer.tilePositionY -= 2.0 + tween.progress * 2.2;
                }
            },
            onComplete: () => {
                // Gate has arrived and is in position: track is paused and runners switch to slow sideways awaiting walk
                this.isTrackScrolling = false;
                this.setRunnersState('awaiting');
                this.canAcceptInput = true;
                this.notifyHUD();

                if (this.isDestroyed || !gateCont.active) return;
                // Lively subtle floating/bouncing animation on gate
                this.gateBobTween = this.scene.tweens.add({
                    targets: gateCont,
                    y: this.GATE_TARGET_Y - 10,
                    duration: 750,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });


        // Emit HUD state (initial state: input disabled while gate approaches)
        this.notifyHUD();
    }

    private handlePlayerAction(chosenLeader: 'chimpu' | 'byte') {
        if (!this.canAcceptInput || this.isDestroyed || this.isPaused || this.isTransitioning) return;
        const task = this.levelConfig.tasks[this.currentTaskIndex];
        if (!task || !this.activeGateContainer) return;


        AudioManager.getInstance().playSFX('button_tap');

        // Handle Level 3 Team Sequence Gates
        if (task.gateType === 'team' && task.requiredSequence) {
            const expectedLeader = task.requiredSequence[this.currentTeamStep];
            if (chosenLeader === expectedLeader) {
                if (this.currentTeamStep === 0) {
                    // Step 1 Success!
                    this.currentTeamStep = 1;
                    this.playCharacterStepDash(chosenLeader);
                    this.playTeamConnectingBeam();
                    AudioManager.getInstance().playSFX('team_spark');
                    this.notifyHUD();
                } else {
                    // Step 2 Success! Complete team gate by striking the gate!
                    this.playCharacterDash(chosenLeader, true);
                }
            } else {
                // Team sequence error
                this.onIncorrectChoice(chosenLeader, task);
            }
            return;
        }

        // Single Leader Tasks (Level 1 & 2)
        const isCorrect = (chosenLeader === task.correctLeader);
        if (isCorrect) {
            this.playCharacterDash(chosenLeader, false);
        } else {
            this.onIncorrectChoice(chosenLeader, task);
        }
    }

    private playCharacterDash(leader: 'chimpu' | 'byte', isTeam: boolean) {
        this.canAcceptInput = false;
        this.isTransitioning = true;

        // Stop lateral/bob tweens so the dash path is clean and direct
        if (this.byteBobTween) { this.byteBobTween.stop(); this.byteBobTween = null; }
        if (this.chimpuBobTween) { this.chimpuBobTween.stop(); this.chimpuBobTween = null; }
        if (this.byteSidewaysTween) { this.byteSidewaysTween.stop(); this.byteSidewaysTween = null; }
        if (this.chimpuSidewaysTween) { this.chimpuSidewaysTween.stop(); this.chimpuSidewaysTween = null; }
        if (this.gateBobTween) { this.gateBobTween.stop(); this.gateBobTween = null; }

        const container = leader === 'chimpu' ? this.chimpuContainer : this.byteContainer;
        const glow = leader === 'chimpu' ? this.chimpuGlow : this.byteGlow;
        const targetX = this.scene.scale.width / 2 + (leader === 'chimpu' ? 90 : -90);

        glow.setVisible(true);
        if (leader === 'byte') {
            this.byteSprite.stop();
            this.byteSprite.setTexture('byte_robot_happy');
        } else if (this.scene.textures.exists('chimpu_run')) {
            this.chimpuSprite.play('run', true);
        }

        AudioManager.getInstance().playSFX('dash');

        // 1. Dash directly into the gate!
        this.scene.tweens.add({
            targets: container,
            x: targetX,
            y: this.GATE_TARGET_Y + 20, // Physical strike on the gate
            scaleX: 1.15,
            scaleY: 0.95,
            duration: 180,
            ease: 'Quad.easeIn',
            onComplete: () => {
                // 2. MOMENT OF IMPACT: Gate shatters!
                this.shatterActiveGate();
                this.onGateSolved(isTeam);

                // 3. Smooth follow-through back to lane running baseline
                this.scene.tweens.add({
                    targets: container,
                    x: leader === 'chimpu' ? this.LANE_X_CHIMPU : this.LANE_X_BYTE,
                    y: this.RUNNER_Y,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 320,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        glow.setVisible(false);
                    }
                });
            }
        });
    }

    private playCharacterStepDash(leader: 'chimpu' | 'byte') {
        const container = leader === 'chimpu' ? this.chimpuContainer : this.byteContainer;
        const glow = leader === 'chimpu' ? this.chimpuGlow : this.byteGlow;

        glow.setVisible(true);
        this.scene.tweens.add({
            targets: container,
            y: this.RUNNER_Y - 60,
            duration: 180,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                glow.setVisible(false);
            }
        });
    }

    private playTeamConnectingBeam() {
        if (!this.linkingBeam) return;
        this.linkingBeam.clear();
        this.linkingBeam.lineStyle(8, 0xa855f7, 0.9);
        this.linkingBeam.lineBetween(this.LANE_X_BYTE, this.RUNNER_Y - 60, this.LANE_X_CHIMPU, this.RUNNER_Y - 60);
        this.linkingBeam.lineStyle(3, 0xffffff, 1);
        this.linkingBeam.lineBetween(this.LANE_X_BYTE, this.RUNNER_Y - 60, this.LANE_X_CHIMPU, this.RUNNER_Y - 60);

        this.scene.tweens.add({
            targets: this.linkingBeam,
            alpha: 0,
            duration: 500,
            ease: 'Quad.easeOut',
            onComplete: () => {
                if (this.linkingBeam) {
                    this.linkingBeam.clear();
                    this.linkingBeam.setAlpha(1);
                }
            }
        });
    }

    private onGateSolved(isTeam: boolean) {
        this.isTransitioning = true;
        this.canAcceptInput = false;
        this.isTrackScrolling = true; // Gate shattered: resume track scrolling
        this.setRunnersState('running');

        if (this.gateApproachTween) {
            this.gateApproachTween.stop();
            this.gateApproachTween = null;
        }
        if (this.gateBobTween) {
            this.gateBobTween.stop();
            this.gateBobTween = null;
        }

        // Points calculation
        let points = 100;
        if (isTeam) points = 150;
        else if (this.attemptsOnCurrentGate === 1) points = 75;
        else if (this.attemptsOnCurrentGate > 1) points = 50;

        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        const totalGates = Math.max(1, this.levelConfig.tasks.length);
        const completedGates = this.currentTaskIndex + 1;
        this.teamSpark = Math.min(100, Math.round((completedGates / totalGates) * 100));
        this.score += points * Math.min(3, 1 + Math.floor(this.combo / 3) * 0.2);

        // Notify HUD immediately so score and combo update synchronously at the moment of impact!
        this.notifyHUD();

        // Sound effects: Shatter crystal break and combo arpeggio
        AudioManager.getInstance().playSFX('shatter');
        AudioManager.getInstance().playSFX('combo', Math.min(3, this.combo));
        if (this.combo % 3 === 0) AudioManager.getInstance().playSFX('cheer');

        // Tutorial completion advance
        if (this.isTutorialActive && this.currentTaskIndex >= 1) {
            this.isTutorialActive = false;
        }

        // Float score indicator
        this.showFloatingScore(`+${points} PTS!`, isTeam ? 0xa855f7 : 0x10b981);

        // Spawn next gate after delay
        this.scene.time.delayedCall(900, () => {
            this.isTransitioning = false;
            this.spawnGateForTask(this.currentTaskIndex + 1);
        });
    }

    private onIncorrectChoice(chosenLeader: 'chimpu' | 'byte', task: GateTask) {
        this.attemptsOnCurrentGate++;
        this.combo = 0; // Combo resets, but no score loss
        this.isTransitioning = true;
        this.canAcceptInput = false;
        this.notifyHUD();


        const container = chosenLeader === 'chimpu' ? this.chimpuContainer : this.byteContainer;
        const glow = chosenLeader === 'chimpu' ? this.chimpuGlow : this.byteGlow;
        const originX = chosenLeader === 'chimpu' ? this.LANE_X_CHIMPU : this.LANE_X_BYTE;
        const targetX = this.scene.scale.width / 2 + (chosenLeader === 'chimpu' ? 60 : -60);
        const hitGateY = this.GATE_TARGET_Y + 115; // Hits the bottom edge of gate

        glow.setVisible(true);
        AudioManager.getInstance().playSFX('dash');

        // 1. Dash forward towards the gate
        this.scene.tweens.add({
            targets: container,
            x: targetX,
            y: hitGateY,
            scaleX: 0.95,
            scaleY: 1.15,
            duration: 180,
            ease: 'Quad.easeIn',
            onComplete: () => {
                // 2. Impact on Gate: Play bounce sound, shake gate, and squish character
                AudioManager.getInstance().playSFX('bounce');

                if (this.activeGateContainer) {
                    this.scene.tweens.add({
                        targets: this.activeGateContainer,
                        y: this.GATE_TARGET_Y - 12,
                        scaleX: 1.04,
                        scaleY: 0.92,
                        duration: 80,
                        yoyo: true,
                        ease: 'Sine.easeInOut'
                    });
                }

                // 3. Rubbery Bounce Back
                this.scene.tweens.add({
                    targets: container,
                    x: originX,
                    y: this.RUNNER_Y + 35,
                    scaleX: 1.25,
                    scaleY: 0.8,
                    duration: 260,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: container,
                            y: this.RUNNER_Y,
                            scaleX: 1,
                            scaleY: 1,
                            duration: 160,
                            ease: 'Sine.easeInOut',
                            onComplete: () => {
                                glow.setVisible(false);
                                this.isTransitioning = false;
                                this.canAcceptInput = true;
                                this.setRunnersState('awaiting');
                                this.notifyHUD();
                            }

                        });
                    }
                });
            }
        });

        // Track slows down temporarily
        if (this.gateApproachTween) {
            this.gateApproachTween.pause();
            this.scene.time.delayedCall(700, () => {
                if (this.gateApproachTween && !this.isDestroyed) {
                    this.gateApproachTween.resume();
                }
            });
        }

        // Provide visual floating guidance hint
        const correctName = (task.gateType === 'team' && task.requiredSequence)
            ? task.requiredSequence[this.currentTeamStep].toUpperCase()
            : task.correctLeader.toUpperCase();

        this.showFloatingScore(`TRY ${correctName}!`, 0xfbbf24);

        // Notify HUD with hint pulse
        this.notifyHUD();
    }


    private shatterActiveGate() {
        if (!this.activeGateContainer) return;
        if (this.gateBobTween) {
            this.gateBobTween.stop();
            this.gateBobTween = null;
        }
        const gx = this.activeGateContainer.x;
        const gy = this.activeGateContainer.y;

        // Hide gate frame
        this.activeGateContainer.destroy();
        this.activeGateContainer = null;

        const currentTask = this.levelConfig.tasks[this.currentTaskIndex];
        const primaryColor = currentTask?.gateType === 'team' ? 0xa855f7 : (currentTask?.gateType === 'ai' ? 0x00f2fe : 0xff6b6b);
        const accentColors = [primaryColor, 0xffffff, 0x00f2fe, 0xffd166, 0xa855f7];

        // 1. Camera Impact Shake
        this.scene.cameras.main.shake(220, 0.008);

        // 2. High-Energy Impact Bloom Flash
        const flash = this.scene.add.ellipse(gx, gy, 850, 320, 0xffffff, 0.8)
            .setDepth(UILayers.GAME_EFFECTS + 15);
        this.scene.tweens.add({
            targets: flash,
            scaleX: 1.4,
            scaleY: 1.4,
            alpha: 0,
            duration: 160,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });

        // 3. Expanding Dual Neon Shockwave Blast Rings
        for (let r = 0; r < 2; r++) {
            const wave = this.scene.add.image(gx, gy, 'shatter_shockwave')
                .setDepth(UILayers.GAME_EFFECTS + 6)
                .setTint(r === 0 ? primaryColor : 0xffffff)
                .setScale(0.4)
                .setAlpha(0.9);

            this.scene.tweens.add({
                targets: wave,
                scaleX: 7.5 + r * 2.0,
                scaleY: 4.2 + r * 1.5,
                alpha: 0,
                duration: 440 + r * 120,
                ease: 'Cubic.easeOut',
                onComplete: () => wave.destroy()
            });
        }

        // 4. Heavy Structural Gate Fracture Chunks (Distributed across the 1000px gate span)
        const heavyCount = 14;
        for (let i = 0; i < heavyCount; i++) {
            // Span starting positions across the actual width and height of the gate
            const startX = gx + Phaser.Math.Between(-440, 440);
            const startY = gy + Phaser.Math.Between(-140, 140);
            const shardKey = i % 2 === 0 ? 'break_shard_large' : 'break_shard_long';

            const heavyShard = this.scene.add.image(startX, startY, shardKey)
                .setDepth(UILayers.GAME_EFFECTS + 10)
                .setTint(accentColors[i % accentColors.length])
                .setScale(Phaser.Math.FloatBetween(1.1, 1.8))
                .setAlpha(0.95);

            // Outward explosive force away from the center
            const dirX = startX >= gx ? 1 : -1;
            const targetX = startX + dirX * Phaser.Math.Between(180, 520);
            const targetY = startY + Phaser.Math.Between(260, 580); // Gravity fall downward
            const spin = (dirX * Phaser.Math.Between(360, 720));

            // Upward pop then heavy gravity tumble
            this.scene.tweens.add({
                targets: heavyShard,
                x: targetX,
                y: targetY,
                angle: spin,
                scale: 0.3,
                alpha: 0,
                duration: Phaser.Math.Between(550, 850),
                ease: 'Cubic.easeIn',
                onComplete: () => heavyShard.destroy()
            });
        }

        // 5. Dense High-Velocity Crystal Needles & Splinters
        const mediumCount = 32;
        for (let i = 0; i < mediumCount; i++) {
            const startX = gx + Phaser.Math.Between(-380, 380);
            const startY = gy + Phaser.Math.Between(-120, 120);
            const shardKey = i % 3 === 0 ? 'break_shard_tri' : 'break_shard';

            const shard = this.scene.add.image(startX, startY, shardKey)
                .setDepth(UILayers.GAME_EFFECTS + 8)
                .setTint(accentColors[i % accentColors.length])
                .setScale(Phaser.Math.FloatBetween(0.8, 1.4));

            const angle = (i / mediumCount) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
            const speed = Phaser.Math.Between(220, 540);

            this.scene.tweens.add({
                targets: shard,
                x: startX + Math.cos(angle) * speed,
                y: startY + Math.sin(angle) * speed + 180, // Gravity bias
                angle: Phaser.Math.Between(-540, 540),
                alpha: 0,
                scale: 0.15,
                duration: Phaser.Math.Between(480, 750),
                ease: 'Quad.easeOut',
                onComplete: () => shard.destroy()
            });
        }

        // 6. Sparkling Star Embers & Neon Dust Particles
        const sparkleCount = 24;
        for (let i = 0; i < sparkleCount; i++) {
            const spark = this.scene.add.image(
                gx + Phaser.Math.Between(-300, 300),
                gy + Phaser.Math.Between(-100, 100),
                'sparkle_star'
            )
                .setDepth(UILayers.GAME_EFFECTS + 12)
                .setTint(i % 2 === 0 ? 0xffffff : primaryColor)
                .setScale(Phaser.Math.FloatBetween(0.5, 1.2));

            const angle = Math.random() * Math.PI * 2;
            const distance = Phaser.Math.Between(160, 420);

            this.scene.tweens.add({
                targets: spark,
                x: spark.x + Math.cos(angle) * distance,
                y: spark.y + Math.sin(angle) * distance,
                angle: Phaser.Math.Between(-180, 180),
                alpha: 0,
                scale: 0.1,
                duration: Phaser.Math.Between(350, 600),
                ease: 'Quad.easeOut',
                onComplete: () => spark.destroy()
            });
        }

        // Stadium Confetti Cannons burst on gate shatter!
        this.launchConfetti(true);
    }

    private showFloatingScore(text: string, color: number) {
        const { width } = this.scene.scale;
        const floatText = this.scene.add.text(width / 2, this.GATE_TARGET_Y - 40, text, {
            fontFamily: 'Arial Black',
            fontSize: '44px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(UILayers.GAME_EFFECTS + 10);

        this.scene.tweens.add({
            targets: floatText,
            y: floatText.y - 70,
            scale: 1.2,
            alpha: 0,
            duration: 800,
            ease: 'Back.easeOut',
            onComplete: () => floatText.destroy()
        });
    }

    private playFinishLinePortal() {
        this.isTransitioning = true;
        const { width } = this.scene.scale;

        AudioManager.getInstance().playSFX('cheer');
        AudioManager.getInstance().playSFX('fireworks');

        // Grand Holographic Finish-Line Portal (2.5D Scale-In)
        const portal = this.scene.add.image(width / 2, this.GATE_TARGET_Y - 40, 'finish_portal_arch')
            .setDepth(UILayers.GAME_EFFECTS)
            .setScale(0.5)
            .setAlpha(0);

        this.scene.tweens.add({
            targets: portal,
            scale: 1.15,
            alpha: 1,
            y: this.GATE_TARGET_Y,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Victory Ribbon & Finish Banner
        const victoryRibbon = this.scene.add.text(width / 2, this.GATE_TARGET_Y + 18, '★ FINISH LINE - RELAY COMPLETE! ★', {
            fontFamily: 'Arial Black',
            fontSize: '38px',
            color: '#ffffff',
            backgroundColor: '#d946ef',
            padding: { x: 36, y: 16 }
        }).setOrigin(0.5).setScale(0.8).setDepth(UILayers.GAME_EFFECTS + 2);

        this.scene.tweens.add({
            targets: victoryRibbon,
            scale: 1.05,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Launch double stadium confetti cannon blast
        this.launchConfetti(true);
        this.scene.time.delayedCall(450, () => {
            if (!this.isDestroyed) this.launchConfetti(false);
        });

        // High-five runners sprint forward through portal
        this.setRunnersState('running');
        this.scene.tweens.add({
            targets: [this.byteContainer],
            x: width / 2 - 70,
            y: this.GATE_TARGET_Y + 50,
            duration: 700,
            ease: 'Sine.easeOut'
        });

        this.scene.tweens.add({
            targets: [this.chimpuContainer],
            x: width / 2 + 70,
            y: this.GATE_TARGET_Y + 50,
            duration: 700,
            ease: 'Sine.easeOut',
            onComplete: () => {
                if (this.byteBobTween) { this.byteBobTween.stop(); this.byteBobTween = null; }
                if (this.chimpuBobTween) { this.chimpuBobTween.stop(); this.chimpuBobTween = null; }
                if (this.byteSidewaysTween) { this.byteSidewaysTween.stop(); this.byteSidewaysTween = null; }
                if (this.chimpuSidewaysTween) { this.chimpuSidewaysTween.stop(); this.chimpuSidewaysTween = null; }
                AudioManager.getInstance().playSFX('badge');
                this.scene.time.delayedCall(1200, () => {
                    this.onCompleteCallback({
                        score: this.score,
                        maxCombo: this.maxCombo,
                        level: this.levelConfig.levelNumber,
                        badgeKey: this.levelConfig.badgeKey
                    });
                });
            }
        });
    }


    private launchConfetti(fromCannons: boolean = false) {
        const { width } = this.scene.scale;
        const confettiColors = [0x00f2fe, 0xff477e, 0xa855f7, 0xfacc15, 0x10b981, 0x38bdf8];

        if (fromCannons) {
            // Muzzle flash on both trackside cannons
            const flashL = this.scene.add.circle(480, 755, 32, 0x00f2fe, 0.9)
                .setDepth(UILayers.GAME_EFFECTS + 12);
            this.scene.tweens.add({
                targets: flashL,
                scale: 2.2,
                alpha: 0,
                duration: 200,
                onComplete: () => flashL.destroy()
            });

            const flashR = this.scene.add.circle(1440, 755, 32, 0xff477e, 0.9)
                .setDepth(UILayers.GAME_EFFECTS + 12);
            this.scene.tweens.add({
                targets: flashR,
                scale: 2.2,
                alpha: 0,
                duration: 200,
                onComplete: () => flashR.destroy()
            });

            // Burst 30 confetti flakes from left cannon angled upward-right
            for (let i = 0; i < 28; i++) {
                const color = confettiColors[i % confettiColors.length];
                const conf = this.scene.add.rectangle(
                    480, 755,
                    Phaser.Math.Between(12, 22),
                    Phaser.Math.Between(8, 14),
                    color
                ).setDepth(UILayers.GAME_EFFECTS + 8);

                const targetX = 480 + Phaser.Math.Between(160, 520);
                const targetY = 755 - Phaser.Math.Between(200, 500);

                this.scene.tweens.add({
                    targets: conf,
                    x: targetX,
                    y: targetY,
                    angle: Phaser.Math.Between(-360, 360),
                    duration: Phaser.Math.Between(400, 700),
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: conf,
                            y: targetY + Phaser.Math.Between(300, 600),
                            x: targetX + Phaser.Math.Between(-80, 80),
                            alpha: 0,
                            angle: Phaser.Math.Between(-720, 720),
                            duration: Phaser.Math.Between(800, 1400),
                            ease: 'Quad.easeIn',
                            onComplete: () => conf.destroy()
                        });
                    }
                });
            }

            // Burst 28 confetti flakes from right cannon angled upward-left
            for (let i = 0; i < 28; i++) {
                const color = confettiColors[(i + 2) % confettiColors.length];
                const conf = this.scene.add.rectangle(
                    1440, 755,
                    Phaser.Math.Between(12, 22),
                    Phaser.Math.Between(8, 14),
                    color
                ).setDepth(UILayers.GAME_EFFECTS + 8);

                const targetX = 1440 - Phaser.Math.Between(160, 520);
                const targetY = 755 - Phaser.Math.Between(200, 500);

                this.scene.tweens.add({
                    targets: conf,
                    x: targetX,
                    y: targetY,
                    angle: Phaser.Math.Between(-360, 360),
                    duration: Phaser.Math.Between(400, 700),
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: conf,
                            y: targetY + Phaser.Math.Between(300, 600),
                            x: targetX + Phaser.Math.Between(-80, 80),
                            alpha: 0,
                            angle: Phaser.Math.Between(-720, 720),
                            duration: Phaser.Math.Between(800, 1400),
                            ease: 'Quad.easeIn',
                            onComplete: () => conf.destroy()
                        });
                    }
                });
            }
        } else {
            // General celebratory shower across track
            for (let i = 0; i < 45; i++) {
                const conf = this.scene.add.rectangle(
                    Phaser.Math.Between(width * 0.25, width * 0.75),
                    Phaser.Math.Between(100, 350),
                    Phaser.Math.Between(12, 20),
                    Phaser.Math.Between(12, 20),
                    confettiColors[i % confettiColors.length]
                ).setDepth(UILayers.GAME_EFFECTS + 8);

                this.scene.tweens.add({
                    targets: conf,
                    y: conf.y + Phaser.Math.Between(400, 750),
                    x: conf.x + Phaser.Math.Between(-140, 140),
                    angle: Phaser.Math.Between(-720, 720),
                    alpha: 0,
                    duration: Phaser.Math.Between(1400, 2400),
                    ease: 'Quad.easeIn',
                    onComplete: () => conf.destroy()
                });
            }
        }
    }

    private notifyHUD() {
        const task = this.levelConfig.tasks[this.currentTaskIndex] || null;
        let tutorialTarget: 'byte' | 'chimpu' | undefined;
        const isInputReady = this.canAcceptInput && !this.isTransitioning && !this.isPaused;

        if (this.isTutorialActive && task && isInputReady) {
            tutorialTarget = task.correctLeader === 'byte' ? 'byte' : 'chimpu';
        }

        this.onHUDUpdate({
            levelNumber: this.levelConfig.levelNumber,
            levelTitle: this.levelConfig.title,
            gateIndex: this.currentTaskIndex + 1,
            totalGates: this.levelConfig.tasks.length,
            score: this.score,
            combo: this.combo,
            teamSpark: this.teamSpark,
            activeTask: task,
            isTeamGate: task?.gateType === 'team',
            teamStep: this.currentTeamStep,
            requiredSequence: task?.requiredSequence,
            isTutorial: this.isTutorialActive,
            tutorialTarget: tutorialTarget,
            isInputEnabled: this.canAcceptInput && !this.isTransitioning && !this.isPaused
        });

    }

    public update(_time: number, _delta: number) {
        if (this.isDestroyed || this.isPaused) return;

        // Looping neon track and parallel side stadium silhouettes scroll when active gate has been shattered / between gates
        if (this.isTrackScrolling) {
            if (this.trackTiles[0]) {
                this.trackTiles[0].tilePositionY -= 2.2;
            }
            if (this.leftAudienceLayer) {
                this.leftAudienceLayer.tilePositionY -= 1.4;
            }
            if (this.rightAudienceLayer) {
                this.rightAudienceLayer.tilePositionY -= 1.4;
            }
        }
    }


    public pause() {
        this.isPaused = true;
        if (this.gateApproachTween) this.gateApproachTween.pause();
        if (this.gateBobTween) this.gateBobTween.pause();
    }

    public resume() {
        this.isPaused = false;
        if (this.gateApproachTween) this.gateApproachTween.resume();
        if (this.gateBobTween) this.gateBobTween.resume();
    }

    public destroy() {
        this.isDestroyed = true;
        if (this.gateApproachTween) {
            this.gateApproachTween.stop();
            this.gateApproachTween = null;
        }
        if (this.gateBobTween) {
            this.gateBobTween.stop();
            this.gateBobTween = null;
        }
        if (this.byteBobTween) {
            this.byteBobTween.stop();
            this.byteBobTween = null;
        }
        if (this.chimpuBobTween) {
            this.chimpuBobTween.stop();
            this.chimpuBobTween = null;
        }
        if (this.byteSidewaysTween) {
            this.byteSidewaysTween.stop();
            this.byteSidewaysTween = null;
        }
        if (this.chimpuSidewaysTween) {
            this.chimpuSidewaysTween.stop();
            this.chimpuSidewaysTween = null;
        }
        if (this.linkingBeam) {
            this.linkingBeam.destroy();
            this.linkingBeam = null;
        }
        if (this.activeGateContainer) {
            this.activeGateContainer.destroy();
            this.activeGateContainer = null;
        }
        if (this.introContainer) {
            this.introContainer.destroy();
            this.introContainer = null;
        }
        this.leftAudienceLayer?.destroy();
        this.leftAudienceLayer = null;
        this.rightAudienceLayer?.destroy();
        this.rightAudienceLayer = null;
        this.trackTiles.forEach(t => t.destroy());
        this.trackTiles = [];
        this.sideDecorations.forEach(d => d.destroy());
        this.sideDecorations = [];
        this.chimpuContainer?.destroy();
        this.byteContainer?.destroy();
    }
}
