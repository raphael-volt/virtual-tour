import { getComputedBounds } from "./css.util";
import { Rect } from "../math/rect";

const getContext = (canvas: HTMLCanvasElement, alpha: boolean = false, readFrequently: boolean = false): CanvasRenderingContext2D => {
    const conf: Canvas2DContextAttributes = {
        alpha: alpha,
        willReadFrequently: readFrequently
    }
    const ctx = canvas.getContext("2d", conf)
    return ctx
}
/**
 * No aspect ratio validation
 * @param canvas 
 * @param src 
 * @param ctx 
 * @param scaleValue 
 */

const drawToCanvas = (canvas: HTMLCanvasElement, src: HTMLImageElement | HTMLVideoElement, ctx?: CanvasRenderingContext2D) => {
    if (!ctx)
        ctx = getContext(canvas)
    clearCanvas(ctx, canvas)
    if (!src)
        return
    const bounds = getComputedBounds(canvas)
    if (isNaN(bounds[0]) || isNaN(bounds[1]))
        throw new Error("Cant get canvas dimensions.")
    canvas.width = bounds[0]
    canvas.height = bounds[1]
    let size = [0, 0]
    if (src instanceof HTMLImageElement) {
        size[0] = src.naturalWidth
        size[1] = src.naturalHeight
    }
    if (src instanceof HTMLVideoElement) {
        size[0] = src.videoWidth
        size[1] = src.videoHeight
    }
    ctx.drawImage(src,
        0, 0, size[0], size[1],
        0, 0, bounds[0], bounds[1])
}

const draw = (
    ctx: CanvasRenderingContext2D, src: HTMLImageElement | HTMLVideoElement, 
    srcRect: Rect, dstRec: Rect) => {
    
        ctx.drawImage(
        src,
        srcRect.x, srcRect.y, srcRect.width, srcRect.height,
        dstRec.x, dstRec.y, dstRec.width, dstRec.height
    )
}
/**
 * Clear canvas using attributes width and height 
 * @param ctx 
 * @param canvas 
 */
const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    return ctx
}

export { clearCanvas, draw, drawToCanvas, getContext }