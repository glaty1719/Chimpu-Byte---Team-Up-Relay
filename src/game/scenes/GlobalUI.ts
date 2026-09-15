import { Scene } from 'phaser';

export class GlobalUI extends Scene {
    private logo?: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'GlobalUI' });
    }

    create() {
        // Keep this scene above others
        this.scene.bringToTop();

        const placeLogo = () => {
            this.logo?.destroy();

            const margin = 16;

            this.logo = this.add.image(
                margin,
                this.scale.height - margin,
                'logo'
            )
                .setOrigin(0, 1)        // left-bottom anchor
                .setScrollFactor(0)     // stays on screen
                .setDepth(999999);

        };

        placeLogo();

        // Reposition on resize
        this.scale.on('resize', placeLogo);
    }
}
