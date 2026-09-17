/**
 * UI Standard Layout Positions & Slot Helpers
 * Dynamic slot calculator for top-left/top-right toolbars, HUD elements, and modals.
 * Base canvas resolution: 1920 x 1080
 */

export class UIPositions {
    // ===== TOOLBAR CONFIGURATION =====
    static readonly TOP_LEFT_START_X = 100;
    static readonly TOP_LEFT_START_Y = 80;
    static readonly BUTTON_SPACING_X = 120; // 100 -> 220 -> 340 ...

    /**
     * Calculates dynamic (x, y) coordinates for top-left toolbar buttons based on index (0-indexed).
     * - Index 0 (1st button): (100, 100)
     * - Index 1 (2nd button): (220, 100)
     * - Index 2 (3rd button): (340, 100)
     * 
     * @param slotIndex 0-indexed position of the button in the row
     */
    static getTopLeftButtonPos(slotIndex: number = 0): { x: number; y: number } {
        return {
            x: this.TOP_LEFT_START_X + (slotIndex * this.BUTTON_SPACING_X),
            y: this.TOP_LEFT_START_Y
        };
    }

    // ===== FIXED SCREEN ANCHORS (1920x1080) =====
    static readonly SCREEN_CENTER = {
        x: 960,
        y: 540
    };

    static readonly TOP_HUD_CENTER = {
        x: 960,
        y: 100
    };

    static readonly BOTTOM_ACTION_CENTER = {
        x: 960,
        y: 950
    };
}
