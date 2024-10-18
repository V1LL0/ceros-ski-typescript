/**
 * A basic game entity with a position and image to be displayed in the game.
 */

import { Canvas } from "../Core/Canvas";
import { ImageManager } from "../Core/ImageManager";
import { Position, Rect } from "../Core/Utils";
import { IMAGE_NAMES } from "../Constants";

export abstract class Entity {
    /**
     * Represents the position of the center of the entity.
     */
    position: Position;

    /**
     * Stored reference to the ImageManager
     */
    imageManager: ImageManager;

    /**
     * Stored reference to the Canvas entity is drawn to
     */
    canvas: Canvas;

    /**
     * The name of the current image being displayed for the entity.
     */
    abstract imageName: IMAGE_NAMES;

    /**
     * Initialize the entities position.
     */
    constructor(x: number, y: number, imageManager: ImageManager, canvas: Canvas) {
        this.position = new Position(x, y);
        this.imageManager = imageManager;
        this.canvas = canvas;
    }

    /**
     * Return the skier's position
     */
    getPosition(): Position {
        return this.position;
    }

    /**
     * Draw the entity to the canvas centered on the X,Y position.
     */
    draw() {
        const image = this.imageManager.getImage(this.imageName);
        if (!image) {
            return;
        }

        const drawX = this.position.x - image.width / 2;
        const drawY = this.position.y - image.height / 2;

        this.canvas.drawImage(image, drawX, drawY, image.width, image.height);
    }

    /**
     * Return a bounding box in world space coordinates for the entity based upon the current image displayed.
     */
    getBounds(): Rect | null {
        const image = this.imageManager.getImage(this.imageName);
        if (!image) {
            return null;
        }

        return new Rect(
            this.position.x - image.width / 2,
            this.position.y - image.height / 2,
            this.position.x + image.width / 2,
            this.position.y
        );
    }

    /**
     * All entities need to define if they die and what happens when they do
     */
    abstract die(): void;
}
