/**
 * Manages all of the obstacles that exist in the game world. It sets the initial world up with a random placement of
 * obstacles, places new obstacles as the skier moves throughout the world and displays them all to the screen.
 */

import { GAME_WIDTH, GAME_HEIGHT } from "../../Constants";
import { Canvas } from "../../Core/Canvas";
import { ImageManager } from "../../Core/ImageManager";
import { Position, randomInt, Rect } from "../../Core/Utils";
import { Obstacle } from "./Obstacle";

/**
 * Ensures that obstacles aren't too close together
 */
const DISTANCE_BETWEEN_OBSTACLES: number = 50;

/**
 * Distance away from the starting position to place obstacles so the player has some initial room to move
 */
const STARTING_OBSTACLE_GAP: number = 100;

/**
 * The number of starting obstacles is based upon game size, so that difficulty stays the same regardless of screen size.
 * This works to configure the starting number of obstacles.
 */
const STARTING_OBSTACLE_REDUCER: number = 300;

/**
 * The chance that a new obstacle will be placed as the skier is moving. A lower number increases the chances.
 */
const NEW_OBSTACLE_CHANCE: number = 8;

export class ObstacleManager {
    /**
     * All obstacles that exist in the game
     */
    obstacles: Obstacle[] = [];

    /**
     * Stored reference to the ImageManager
     */
    imageManager: ImageManager;

    /**
     * Stored reference to the Canvas obstacles are drawn to
     */
    canvas: Canvas;

    /**
     * Init the Obstacle Manager.
     */
    constructor(imageManager: ImageManager, canvas: Canvas) {
        this.imageManager = imageManager;
        this.canvas = canvas;
    }

    getObstacles(): Obstacle[] {
        return this.obstacles;
    }

    /**
     * Loop through and draw all obstacles
     */
    drawObstacles() {
        this.obstacles.forEach((obstacle: Obstacle) => {
            obstacle.draw();
        });
    }

    /**
     * Place initial obstacles. Mimics the original SkiFree game in that obstacles are only initially placed below the
     * skier.
     */
    placeInitialObstacles() {
        const numberObstacles = Math.ceil(
            (GAME_WIDTH / STARTING_OBSTACLE_REDUCER) * (GAME_HEIGHT / STARTING_OBSTACLE_REDUCER)
        );

        const placementArea = new Rect(-GAME_WIDTH / 2, STARTING_OBSTACLE_GAP, GAME_WIDTH / 2, GAME_HEIGHT / 2);

        for (let i = 0; i < numberObstacles; i++) {
            this.placeRandomObstacle(placementArea);
        }

        this.obstacles.sort((obstacle1: Obstacle, obstacle2: Obstacle) => {
            return obstacle1.getPosition().y - obstacle2.getPosition().y;
        });
    }

    /**
     * Place a new obstacle while the game is running. If the game window has moved, we want to figure out which direction(s)
     * it has moved in and try to place a new obstacle offscreen (so player doesn't see it pop in) in that direction(s).
     */
    placeNewObstacle(gameWindow: Rect, previousGameWindow: Rect) {
        const shouldPlaceObstacle = randomInt(1, NEW_OBSTACLE_CHANCE);
        if (shouldPlaceObstacle !== NEW_OBSTACLE_CHANCE) {
            return;
        }

        if (gameWindow.left < previousGameWindow.left) {
            this.placeObstacleLeft(gameWindow);
        } else if (gameWindow.left > previousGameWindow.left) {
            this.placeObstacleRight(gameWindow);
        }

        if (gameWindow.top < previousGameWindow.top) {
            this.placeObstacleTop(gameWindow);
        } else if (gameWindow.top > previousGameWindow.top) {
            this.placeObstacleBottom(gameWindow);
        }
    }

    /**
     * Place an obstacle to the left of the game window
     */
    placeObstacleLeft(gameWindow: Rect) {
        const placementArea = new Rect(gameWindow.left, gameWindow.top, gameWindow.left, gameWindow.bottom);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place an obstacle to the right of the game window
     */
    placeObstacleRight(gameWindow: Rect) {
        const placementArea = new Rect(gameWindow.right, gameWindow.top, gameWindow.right, gameWindow.bottom);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place an obstacle above the game window
     */
    placeObstacleTop(gameWindow: Rect) {
        const placementArea = new Rect(gameWindow.left, gameWindow.top, gameWindow.right, gameWindow.top);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place an obstacle below the game window
     */
    placeObstacleBottom(gameWindow: Rect) {
        const placementArea = new Rect(gameWindow.left, gameWindow.bottom, gameWindow.right, gameWindow.bottom);
        this.placeRandomObstacle(placementArea);
    }

    /**
     * Place a random obstacle somewhere within the placement area. Obstacles are distanced from each other rather than
     * right on top of one another, so an open space must be calculated.
     */
    placeRandomObstacle(placementArea: Rect) {
        let position: Position | null;
        do {
            position = this.calculateOpenPosition(placementArea);
        } while (!position);

        const newObstacle = new Obstacle(position.x, position.y, this.imageManager, this.canvas);

        this.obstacles.push(newObstacle);
    }

    /**
     * Find a position within the passed in area to place an obstacle, ensuring that the obstacle is
     * DISTANCE_BETWEEN_OBSTACLES distance away from any other obstacle. If the calculated position doesn't meet that
     * criteria, return null.
     */
    calculateOpenPosition(placementArea: Rect): Position | null {
        const placementX = randomInt(placementArea.left, placementArea.right);
        const placementY = randomInt(placementArea.top, placementArea.bottom);

        const foundCollision = this.obstacles.find((obstacle: Obstacle) => {
            const obstacleX = obstacle.getPosition().x;
            const obstacleY = obstacle.getPosition().y;

            return (
                placementX > obstacleX - DISTANCE_BETWEEN_OBSTACLES &&
                placementX < obstacleX + DISTANCE_BETWEEN_OBSTACLES &&
                placementY > obstacleY - DISTANCE_BETWEEN_OBSTACLES &&
                placementY < obstacleY + DISTANCE_BETWEEN_OBSTACLES
            );
        });

        if (foundCollision) {
            return null;
        } else {
            return new Position(placementX, placementY);
        }
    }
}
