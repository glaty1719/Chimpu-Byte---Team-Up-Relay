import { APIConfig } from '../utils/Constants';

export class GameDataManager {
    private static instance: GameDataManager;
    private unlockedLevels: number = 1;

    private constructor() {
        if (APIConfig.IS_IN_DEVELOPMENT) {
            this.loadData();
        }
    }

    public static getInstance(): GameDataManager {
        if (!GameDataManager.instance) {
            GameDataManager.instance = new GameDataManager();
        }
        return GameDataManager.instance;
    }

    private loadData() {
        const data = localStorage.getItem('highestLevel');
        if (data) {
            this.unlockedLevels = parseInt(data);
        }
    }

    public syncFromAPI(level: number) {
        // Only if we're not in development, we take the level from API
        // If we ARE in development, we prefer localStorage but can still update if API provides higher (optional)
        if (!APIConfig.IS_IN_DEVELOPMENT) {
            this.unlockedLevels = level;
        } else if (level > this.unlockedLevels) {
            this.unlockedLevels = level;
            localStorage.setItem('highestLevel', this.unlockedLevels.toString());
        }
    }

    public unlockLevel(level: number) {
        if (level > this.unlockedLevels) {
            this.unlockedLevels = level;
            if (APIConfig.IS_IN_DEVELOPMENT) {
                localStorage.setItem('highestLevel', this.unlockedLevels.toString());
            }
        }
    }

    public completeLevel(level: number, _stars: number = 3, _score: number = 0) {
        this.unlockLevel(level + 1);
    }

    public getUnlockedLevels(): number {
        return this.unlockedLevels;
    }

    public isLevelUnlocked(level: number): boolean {
        return level <= this.unlockedLevels;
    }

    public resetProgress() {
        this.unlockedLevels = 1;
        if (APIConfig.IS_IN_DEVELOPMENT) {
            localStorage.setItem('highestLevel', '1');
        }
    }
}
