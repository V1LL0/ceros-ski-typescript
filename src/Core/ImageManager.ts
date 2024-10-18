/**
 * Handles loading of any images needed for the game.
 */

import { IMAGE_NAMES } from "../Constants";
import { iImage } from "../Interfaces/iImage";

/**
 * Scale all images loaded by this amount
 * @type {number}
 * */
const SCALE: number = 0.5;

export class ImageManager {
    loadedImages: { [key in IMAGE_NAMES]?: HTMLImageElement } = {};

    /**
     * Load each of the passed in images and return a promise that resolves when all images are finished loading
     */
    async loadImages(images: iImage[]): Promise<void> {
        const imagePromises: Promise<void>[] = [];

        for (const image of images) {
            const imagePromise: Promise<void> = this.loadSingleImage(image);
            imagePromises.push(imagePromise);
        }

        await Promise.all(imagePromises);
    }

    /**
     * Load a single image and return a promise that resolves when the image is finished loading.
     */
    loadSingleImage(image: iImage): Promise<void> {
        return new Promise((resolve) => {
            const loadedImage = new Image();
            loadedImage.onload = () => {
                loadedImage.width *= SCALE;
                loadedImage.height *= SCALE;

                this.loadedImages[image.name] = loadedImage;
                resolve();
            };
            loadedImage.src = image.url;
        });
    }

    /**
     * Get a single Image by name
     */
    getImage(name: IMAGE_NAMES): HTMLImageElement | undefined {
        return this.loadedImages[name];
    }
}
