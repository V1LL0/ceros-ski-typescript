/**
 * The rhino chases after a target and eats the target when they come in contact with one another. Also has a few
 * different animations that it cycles between depending upon the rhino's state.
 */

import { ANIMATION_FRAME_SPEED_MS, IMAGE_NAMES } from "../Constants";
import { Entity } from "./Entity";
import { Animation } from "../Core/Animation";
import { Canvas } from "../Core/Canvas";
import { ImageManager } from "../Core/ImageManager";
import { intersectTwoRects, getDirectionVector } from "../Core/Utils";

/**
 * The rhino starts running at this speed. Saved in case speed needs to be reset at any point.
 */
const STARTING_SPEED: number = 10.5;

/**
 * The different states the rhino can be in.
 */
enum STATES {
    STATE_RUNNING = "running",
    STATE_EATING = "eating",
    STATE_CELEBRATING = "celebrating",
}

/**
 * Sequences of images that comprise the animations for the different states of the rhino.
 */
const IMAGES_RUNNING: IMAGE_NAMES[] = [IMAGE_NAMES.RHINO_RUN1, IMAGE_NAMES.RHINO_RUN2];
const IMAGES_EATING: IMAGE_NAMES[] = [
    IMAGE_NAMES.RHINO_EAT1,
    IMAGE_NAMES.RHINO_EAT2,
    IMAGE_NAMES.RHINO_EAT3,
    IMAGE_NAMES.RHINO_EAT4,
];
const IMAGES_CELEBRATING: IMAGE_NAMES[] = [IMAGE_NAMES.RHINO_CELEBRATE1, IMAGE_NAMES.RHINO_CELEBRATE2];

export class Rhino extends Entity {
    /**
     * The name of the current image being displayed for the rhino.
     */
    imageName: IMAGE_NAMES = IMAGE_NAMES.RHINO;

    /**
     * What state the rhino is currently in.
     */
    state: STATES = STATES.STATE_RUNNING;

    /**
     * How fast the rhino is currently moving in the game world.
     */
    speed: number = STARTING_SPEED;

    /**
     * Stores all of the animations available for the different states of the rhino.
     */
    animations: { [key: string]: Animation } = {};

    /**
     * The animation that the rhino is currently using. Typically matches the state the rhino is in.
     */
    curAnimation: Animation | null = null;

    /**
     * The current frame of the current animation the rhino is on.
     */
    curAnimationFrame: number = 0;

    /**
     * The time in ms of the last frame change. Used to provide a consistent framerate.
     */
    curAnimationFrameTime: number = Date.now();

    /**
     * Initialize the rhino, get the animations setup and set the starting animation which will be based upon the
     * starting state.
     */
    constructor(x: number, y: number, imageManager: ImageManager, canvas: Canvas) {
        super(x, y, imageManager, canvas);
        this.setupAnimations();
        this.setAnimation();
    }

    /**
     * Create and store the animations.
     */
    setupAnimations() {
        this.animations[STATES.STATE_RUNNING] = new Animation(IMAGES_RUNNING, true);

        this.animations[STATES.STATE_EATING] = new Animation(IMAGES_EATING, false, this.celebrate.bind(this));

        this.animations[STATES.STATE_CELEBRATING] = new Animation(IMAGES_CELEBRATING, true);
    }

    /**
     * Set the state and then set a new current animation based upon that state.
     */
    setState(newState: STATES) {
        this.state = newState;
        this.setAnimation();
    }

    /**
     * Is the rhino currently in the running state.
     */
    isRunning(): boolean {
        return this.state === STATES.STATE_RUNNING;
    }

    /**
     * Update the rhino by moving it, seeing if it caught its target and then update the animation if needed. Currently
     * it only moves if it's running.
     */
    update(gameTime: number, target: Entity) {
        if (this.isRunning()) {
            this.move(target);
            this.checkIfCaughtTarget(target);
        }

        this.animate(gameTime);
    }

    /**
     * Move the rhino if it's in the running state. The rhino moves by going directly towards its target, disregarding
     * any obstacles.
     */
    move(target: Entity) {
        if (!this.isRunning()) {
            return;
        }

        const targetPosition = target.getPosition();
        const moveDirection = getDirectionVector(this.position.x, this.position.y, targetPosition.x, targetPosition.y);

        this.position.x += moveDirection.x * this.speed;
        this.position.y += moveDirection.y * this.speed;
    }

    /**
     * Advance to the next frame in the current animation if enough time has elapsed since the previous frame.
     */
    animate(gameTime: number) {
        if (!this.curAnimation) {
            return;
        }

        if (gameTime - this.curAnimationFrameTime > ANIMATION_FRAME_SPEED_MS) {
            this.nextAnimationFrame(gameTime);
        }
    }

    /**
     * Increase the current animation frame and update the image based upon the sequence of images for the animation.
     * If the animation isn't looping, then finish the animation instead.
     */
    nextAnimationFrame(gameTime: number) {
        if (!this.curAnimation) {
            return;
        }

        const animationImages = this.curAnimation.getImages();

        this.curAnimationFrameTime = gameTime;
        this.curAnimationFrame++;
        if (this.curAnimationFrame >= animationImages.length) {
            if (!this.curAnimation.getLooping()) {
                this.finishAnimation();
                return;
            }

            this.curAnimationFrame = 0;
        }

        this.imageName = animationImages[this.curAnimationFrame];
    }

    /**
     * The current animation wasn't looping, so finish it by clearing out the current animation and firing the callback.
     */
    finishAnimation() {
        if (!this.curAnimation) {
            return;
        }

        const animationCallback = this.curAnimation.getCallback();
        this.curAnimation = null;

        if (animationCallback) {
            animationCallback.apply(null);
        }
    }

    /**
     * Does the rhino collide with its target. If so, trigger the target as caught.
     */
    checkIfCaughtTarget(target: Entity) {
        const rhinoBounds = this.getBounds();
        const targetBounds = target.getBounds();
        if (!rhinoBounds || !targetBounds) {
            return;
        }

        if (intersectTwoRects(rhinoBounds, targetBounds)) {
            this.caughtTarget(target);
        }
    }

    /**
     * The target was caught, so trigger its death and set the rhino to the eating state.
     */
    caughtTarget(target: Entity) {
        target.die();

        this.setState(STATES.STATE_EATING);
    }

    /**
     * The rhino has won, trigger the celebration state.
     */
    celebrate() {
        this.setState(STATES.STATE_CELEBRATING);
    }

    /**
     * Set the current animation, reset to the beginning of the animation and set the proper image to display.
     */
    setAnimation() {
        this.curAnimation = this.animations[this.state];
        if (!this.curAnimation) {
            return;
        }

        this.curAnimationFrame = 0;

        const animateImages = this.curAnimation.getImages();
        this.imageName = animateImages[this.curAnimationFrame];
    }

    /**
     * Nothing can kill the rhino...yet!
     */
    die() {}
}
