/**
 * Configuration for a single animation. Animations contain an array of images to play through. They can loop back
 * to the start when the full animation sequence has been played or they can not loop and just finish on the last image.
 * They can also have a callback set to fire when the animation sequence is complete.
 */
import { IMAGE_NAMES } from "../Constants";

export class Animation {
    /**
     * The sequence of images the animation cycles through
     */
    private readonly images: IMAGE_NAMES[];

    /**
     * Does the animation loop back to the beginning when complete?
     */
    private readonly looping: boolean;

    /**
     * Function to call when the animation is complete
     */
    private readonly callback?: Function;

    constructor(images: IMAGE_NAMES[], looping: boolean, callback?: Function) {
        this.images = images;
        this.looping = looping;
        this.callback = callback;
    }

    getImages(): IMAGE_NAMES[] {
        return this.images;
    }

    getLooping(): boolean {
        return this.looping;
    }

    getCallback(): Function | undefined {
        return this.callback;
    }
}
