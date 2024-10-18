/**
 * The Canvas class is responsible for managing the HTML Canvas element and anything drawn to it. It incorporates a
 * drawing offset that all drawn entities to be positioned relative to giving the illusion of moving around in the
 * game world.
 */

import { Position } from "./Utils";

export class Canvas {
    canvasId: string;

    width: number;

    height: number;

    canvas: HTMLCanvasElement;

    /**
     * Reference to the canvas context
     */
    ctx: CanvasRenderingContext2D;

    drawOffset: Position = new Position(0, 0);

    /**
     * Create a canvas of a specific size
     */
    constructor(canvasId: string, width: number, height: number) {
        this.canvasId = canvasId;
        this.width = width;
        this.height = height;
        this.canvas = this.findCanvas();
        this.ctx = this.getCanvasContext();

        this.setupCanvas();
    }

    /**
     * Get the canvas DOM element for the instances canvasId
     */
    findCanvas(): HTMLCanvasElement {
        const canvas = document.getElementById(this.canvasId);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(`Canvas element ${this.canvasId} not found!`);
        }

        return canvas;
    }

    getCanvasContext(): CanvasRenderingContext2D {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error(`Could not retrieve context for canvas ${this.canvasId}`);
        }

        return ctx;
    }

    /**
     * Get the canvas DOM element and make it the proper size. Also ensure it compensates for device pixel scaling.
     */
    setupCanvas() {
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.canvas.style.width = this.width + "px";
        this.canvas.style.height = this.height + "px";

        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * Erase the entire canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Set an offset so that everything drawn to the canvas is drawn relative to the coordinates passed in.
     */
    setDrawOffset(x: number, y: number) {
        this.drawOffset.x = x;
        this.drawOffset.y = y;
    }

    /**
     * Draw an Image at the desired coordinates relative to the drawOffset position at the desired size.
     */
    drawImage(image: HTMLImageElement, x: number, y: number, width: number, height: number) {
        x -= this.drawOffset.x;
        y -= this.drawOffset.y;

        this.ctx.drawImage(image, x, y, width, height);
    }
}
