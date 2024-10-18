/**
 * The main game class. This initializes the game as well as runs the game/render loop and initial handling of input.
 */

import { GAME_CANVAS, GAME_WIDTH, GAME_HEIGHT, IMAGES } from "../Constants";
import { Canvas } from "./Canvas";
import { ImageManager } from "./ImageManager";
import { Position, Rect } from "./Utils";
import { ObstacleManager } from "../Entities/Obstacles/ObstacleManager";
import { Rhino } from "../Entities/Rhino";
import { Skier, STATES as SKIER_STATES } from "../Entities/Skier";

enum GameState {
    RUNNING = "running",
    GAME_OVER = "gameOver",
}

export class Game {
    /**
     * The canvas the game will be displayed on
     */
    private canvas!: Canvas;

    /**
     * Coordinates denoting the active rectangular space in the game world
     * */
    private gameWindow!: Rect;

    /**
     * Current game time
     */
    private gameTime: number = Date.now();

    private imageManager!: ImageManager;

    private obstacleManager!: ObstacleManager;

    /**
     * The skier player
     */
    private skier!: Skier;

    /**
     * The enemy that chases the skier
     */
    private rhino!: Rhino;

    /**
     * The game state (running or gameOver)
     */
    private gameState: GameState = GameState.RUNNING;

    /**
     * The score, which increases over time as long as the skier is alive
     */
    private score: number = 0;

    private maxScore: number = 0;

    /**
     * Initialize the game and setup any input handling needed.
     */
    constructor() {
        this.init();
        this.setupInputHandling();
    }

    /**
     * Create all necessary game objects and initialize them as needed.
     */
    init() {
        this.canvas = new Canvas(GAME_CANVAS, GAME_WIDTH, GAME_HEIGHT);

        this.imageManager = this.imageManager || new ImageManager();
        this.obstacleManager = new ObstacleManager(this.imageManager, this.canvas);
        this.obstacleManager.placeInitialObstacles();

        this.skier = new Skier(0, 0, this.imageManager, this.obstacleManager, this.canvas);
        this.rhino = new Rhino(-500, -2000, this.imageManager, this.canvas);

        this.calculateGameWindow();

        this.gameState = GameState.RUNNING;
    }

    /**
     * Setup listeners for any input events we might need.
     */
    setupInputHandling() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    /**
     * Load any assets we need for the game to run. Return a promise so that we can wait on something until all assets
     * are loaded before running the game.
     */
    async load(): Promise<void> {
        await this.imageManager.loadImages(IMAGES);
    }

    /**
     * The main game loop. Clear the screen, update the game objects and then draw them.
     */
    run() {
        if (this.gameState === GameState.RUNNING) {
            this.canvas.clearCanvas();
            this.updateGameWindow();
            this.drawGameWindow();
        } else {
            this.drawGameOver();
        }

        requestAnimationFrame(this.run.bind(this));

    }

    /**
     * Do any updates needed to the game objects
     */
    updateGameWindow() {
        this.gameTime = Date.now();

        const previousGameWindow: Rect = this.gameWindow;
        this.calculateGameWindow();

        this.obstacleManager.placeNewObstacle(this.gameWindow, previousGameWindow);

        this.skier.update(this.gameTime);
        this.rhino.update(this.gameTime, this.skier);

        if (this.skier.state === SKIER_STATES.STATE_DEAD) {
            this.gameState = GameState.GAME_OVER;
            this.saveMaxScore();
            this.resetScore();
        } else {
            this.updateScore();
        }

    }

    saveMaxScore() {
        this.maxScore = Math.max(this.score, this.maxScore);
    }

    updateScore() {
        this.score += 0.5; // Increment score every game cycle (can be scaled if needed)
    }

    resetScore() {
        this.score = 0;
    }


    /**
     * Draw the current score at the top right of the canvas
     */
    drawScore() {
        const padding = 30;
        const maxScoreInteger = Math.floor(this.maxScore);
        const scoreInteger = Math.floor(this.score);

        this.canvas.drawText(`Max Score: ${maxScoreInteger}   Score: ${scoreInteger}`, GAME_WIDTH - padding - 270, padding, '20px Arial', 'black');
    }

    /**
     * Draw all entities to the screen, in the correct order. Also setup the canvas draw offset so that we see the
     * rectangular space denoted by the game window.
     */
    drawGameWindow() {
        this.canvas.setDrawOffset(this.gameWindow.left, this.gameWindow.top);

        this.skier.draw();
        this.rhino.draw();
        this.obstacleManager.drawObstacles();

        this.drawScore();
    }

    /**
     * Calculate the game window (the rectangular space drawn to the screen). It's centered around the player and must
     * be updated since the player moves position.
     */
    calculateGameWindow() {
        const skierPosition: Position = this.skier.getPosition();
        const left: number = skierPosition.x - GAME_WIDTH / 2;
        const top: number = skierPosition.y - GAME_HEIGHT / 2;

        this.gameWindow = new Rect(left, top, left + GAME_WIDTH, top + GAME_HEIGHT);
    }

    /**
     * Handle keypresses and delegate to any game objects that might have key handling of their own.
     * In case we are in "game over" then we wait for the user to press Enter in order to restart the game
     */
    handleKeyDown(event: KeyboardEvent) {
        if (this.gameState === GameState.GAME_OVER && event.key === "Enter") {
            this.restartGame();
            event.preventDefault();

            return;
        }

        let handled: boolean = this.skier.handleInput(event.key);

        if (handled) {
            event.preventDefault();
        }
    }

    restartGame() {
        this.init();
        this.gameState = GameState.RUNNING;
    }

    drawGameOver() {
        this.canvas.drawText("Game Over!", GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2, '30px Roboto', 'red');
        this.canvas.drawText("Press Enter to restart", GAME_WIDTH / 2 - 110, GAME_HEIGHT / 2 + 40, '20px Roboto', 'green');
    }
}
