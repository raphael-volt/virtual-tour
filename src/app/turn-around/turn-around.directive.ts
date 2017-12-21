import { Directive, ElementRef, Input, OnChanges, SimpleChange, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from "../shared/model";
import { Observable, Observer } from "rxjs";
import { Ease, Sine, TweenEventType, Tween, TweenEvent } from "../shared/tween/ease";
import { ResizeService } from "../shared/resize.service";
import { AppService } from "../app.service";
const fr = Math.round(1000 / 30)

@Directive({
  selector: '[turnAround]'
})
export class TurnAroundDirective implements OnChanges {

  @Output()
  activeChange: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    private resizeSrvice: ResizeService,
    private appService: AppService,
    canvasRef: ElementRef
  ) {
    if (canvasRef.nativeElement instanceof HTMLCanvasElement) {
      this._canvas = canvasRef.nativeElement
      this._ctx = getContext(this._canvas)
      resizeSrvice.layoutChange.subscribe(sizes => {
        if (this.currentImage) {
          this.calculateMouseIncrement()
          this.showImageAt(this.currentImageIndex)
        }
      })
    }
    else
      throw new Error("Native element must be a canvas")
  }
  calculateMouseIncrement() {
    this.mouseInc = (this.turnAround.length / 2) / this.resizeSrvice.layoutRect.width
  }
  private mouseInc: number = 1
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D

  @Input()
  turnAround: HTMLImageElement[]
  @Input()
  animFps: number = 24

  private closeAnim
  close(): Observable<boolean> {
    return Observable.create((obs: Observer<boolean>) => {
      if (!this.turnAround)
        return obs.error("no turnAround")
      if (this.closeAnim) {

        return obs.error("closing in progress")
      }
      if (this.animData) {
        this.animData.tween.reset()
        this.animData.target.remove()
        this.animData = null
      }
      this._canvas.removeEventListener("mousedown", this.canvasMouseDown)
      const maxI = this.turnAround.length - 1
      const direction =
        (this.currentImageIndex < maxI / 2) ?
          -1 : 1
      this.closeAnim = 1
      new RAFHelper(
        this.animFps,
        () => {
          const ci = this.currentImageIndex
          let i: number = ci + direction
          if (i < 0 || i > maxI) {
            this.loop = false
            this.render()
            this.closeAnim = null
            obs.next(true)
            obs.complete()
            return true
          }

          return false
        }, () => {
          this.updateView(direction)
        })
    })
  }

  private animData: {
    target: HTMLElement,
    tween: Tween
  }
  private startAnim() {
    let bounds = this._canvas.getBoundingClientRect()
    let ms = document.createElement("i")
    ms.classList.add("vti")
    ms.classList.add("vti-mouse")
    document.body.appendChild(ms)
    let mb = ms.getBoundingClientRect()
    let pos = [
      bounds.left - mb.width / 2 + bounds.width / 2,
      bounds.top - mb.height / 2 + bounds.height / 2
    ]
    ms.style.position = "absolute"
    ms.style.left = pos[0] + "px"
    ms.style.top = pos[1] + "px"
    ms.style.opacity = "0"
    ms.style.color = "dodgerblue"
    const incX: number = this.resizeSrvice.layoutRect.width / 4
    const delay: number = 200
    const transD: number = 30
    const fadeD: number = 20
    let tw: Ease = new Ease(0, 1, fadeD, Sine.in)
    let tween: Tween = new Tween(tw)
    this.animData = {
      tween: tween,
      target: ms
    }
    const n: number = this.turnAround.length
    const updateCanvas = (e: TweenEvent) => {
      const x: number = Math.round(e.currentValue - pos[0])
      let t: number = Math.round(x * this.mouseInc)
      t = this.validateIndex(t)
      try {
        this.showImageAt(t, true)
      } catch (error) {
        console.log("showImageError t:" + t + " / " + (n - 1))
      }
    }
    let anim1 = (e: TweenEvent) => {
      switch (e.type) {
        case "change":
          ms.style.opacity = String(e.currentValue)
          break;

        case "end":
          sub.unsubscribe()
          setTimeout(() => {
            ms.classList.remove("vti-mouse")
            ms.classList.add("vti-mouse-l")
            setTimeout(startAnim2, delay)
          }, delay)
          break;
        default:
          break;
      }
    }
    // center to right
    const startAnim2 = () => {
      tw.set(pos[0], pos[0] + incX, transD)
      tween.reset()
      sub = tween.change.subscribe(e => {
        switch (e.type) {
          case "change":
            ms.style.left = Math.round(e.currentValue) + "px"
            updateCanvas(e)
            break;

          case "end":
            sub.unsubscribe()
            setTimeout(startAnim3, delay)
            break;
          default:
            break;
        }
      })
      tween.start()
    }

    // right to left
    const startAnim3 = () => {
      tw.set(pos[0] + incX, pos[0] - incX, transD * 2, Sine.inOut)
      tween.reset()
      sub = tween.change.subscribe(e => {
        switch (e.type) {
          case "change":
            ms.style.left = Math.round(e.currentValue) + "px"
            updateCanvas(e)
            break;

          case "end":
            sub.unsubscribe()
            setTimeout(startAnim4, delay)
            break;
          default:
            break;
        }
      })
      tween.start()
    }
    // right to center
    const startAnim4 = () => {
      tw.set(pos[0] - incX, pos[0], transD, Sine.in)
      tween.reset()
      sub = tween.change.subscribe(e => {
        switch (e.type) {
          case "change":
            ms.style.left = Math.round(e.currentValue) + "px"
            updateCanvas(e)
            break;

          case "end":
            sub.unsubscribe()
            startAnim5()
            break;
          default:
            break;
        }
      })
      tween.start()
    }

    // fade out
    const startAnim5 = () => {
      tw.set(1, 0, fadeD)
      tween.reset()
      sub = tween.change.subscribe(e => {
        switch (e.type) {
          case "change":
            ms.style.opacity = String(e.currentValue)
            break;

          case "end":
            sub.unsubscribe()
            // Done
            ms.parentElement.removeChild(ms)
            this.animData = null
            this._canvas.addEventListener("mousedown", this.canvasMouseDown)
            this.loop = true
            this.appService.showTurnAroundAnimation = false
            window.requestAnimationFrame(this.render)
            this.activeChange.emit(true)
            break;
          default:
            break;
        }
      })
      tween.start()
    }


    let sub: Subscription = tween.change.subscribe(anim1)
    tween.start()
  }

  ngOnChanges(changes: SimpleChanges) {
    let change: SimpleChange = changes.turnAround
    if (change) {
      let val = change.currentValue
      if (val) {
        this.calculateMouseIncrement()
        const n: number = this.turnAround.length
        let rafH: RAFHelper = new RAFHelper(
          this.animFps,
          () => {
            if (this.currentImageIndex == n - 1) {
              this.showImageAt(0, true)
              if (this.appService.showTurnAroundAnimation)
                this.startAnim()
              else {
                this._canvas.addEventListener("mousedown", this.canvasMouseDown)
                this.loop = true
                window.requestAnimationFrame(this.render)
                this.activeChange.emit(true)
              }
              return true
            }
            return false
          },
          () => {
            this.showImageAt(this.currentImageIndex + 1, true)
          })
      }
    }
  }

  private downPos: [number, number] = [0, 0]
  private currentImage: HTMLImageElement
  private currentImageIndex: number = 0

  private canvasMouseDown = (event: MouseEvent) => {
    this.downPos = [event.clientX, this.currentImageIndex]
    this._canvas.addEventListener("mousemove", this.canvasMouseMove)
    this._canvas.addEventListener("mouseup", this.canvasMouseUp)
    this._canvas.addEventListener("mouseleave", this.canvasMouseLeave)
  }

  private canvasMouseMove = (event: MouseEvent) => {

    const delta = (this.downPos[0] - event.clientX) * this.mouseInc
    let i = this.validateIndex(delta + this.downPos[1])
    this.showImageAt(i)
  }

  private canvasMouseUp = (event: MouseEvent) => {
    this._canvas.removeEventListener("mousemove", this.canvasMouseMove)
    this._canvas.removeEventListener("mouseup", this.canvasMouseUp)
    this._canvas.removeEventListener("mouseleave", this.canvasMouseLeave)
  }

  private canvasMouseLeave = (event: MouseEvent) => {
    this.canvasMouseUp(event)
  }

  private imgSize: [number, number] = [0, 0]

  private clearCanvas(): CanvasRenderingContext2D {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)
    return this._ctx
  }

  validateIndex(i: number) {
    i = Math.round(i)
    const n: number = this.turnAround.length
    if (i < 0)
      i = n + i
    else if (i >= n)
      i = i - n
    return i
  }
  updateView(dir: number) {

    let i: number = this.validateIndex(this.currentImageIndex + dir)
    this.showImageAt(i)
  }


  private lastDrawed: number
  private showImageAt(index: number, forceRender: boolean = false) {

    if (isNaN(index)) {
      this.currentImageIndex = 0
      this.currentImage = null
      return
    }
    const img = this.turnAround[index]
    this.currentImage = img
    this.currentImageIndex = index
    this.renderFlag = true
    if (forceRender)
      this.render()
  }

  private _loop: boolean;
  public get loop(): boolean {
    return this._loop;
  }
  public set loop(v: boolean) {
    this._loop = v;
  }

  private renderFlag: boolean
  render = () => {
    if (this.renderFlag) {
      drawToCanvas(this._canvas, this.currentImage, this._ctx)

      this.renderFlag = false
    }
    if (this.loop)
      window.requestAnimationFrame(this.render)
  }
  activate() {
    this.loop = true
    this.render()
  }
}


const getBounds = (target): [number, number] => {
  const style = window.getComputedStyle(target)
  return [parseSize(style.width), parseSize(style.height)]
}
const RE = /^(\d+)(\w*)$/
const parseSize = (val: string): number => {
  if (RE.test(val)) {
    val = RE.exec(val)[1]
  }
  return Number(val)
}
const getContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const conf: Canvas2DContextAttributes = {
    alpha: true,
    willReadFrequently: false
  }

  const ctx = canvas.getContext("2d", conf)
  return ctx
}
const drawToCanvas = (canvas: HTMLCanvasElement, src: HTMLImageElement | HTMLVideoElement, ctx?: CanvasRenderingContext2D, scaleValue?: number) => {
  if (!ctx)
    ctx = getContext(canvas)
  clearCanvas(ctx, canvas)
  if (!src)
    return
  const bounds = getBounds(canvas)
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

const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  return ctx
}

export { drawToCanvas }

class RAFHelper {
  constructor(fps: number, private cancelFunc: () => boolean, private handler: () => void) {
    this.then = Date.now()
    this.interval = 1000 / fps
    window.requestAnimationFrame(this.rafCallback)
  }
  private now: number
  private then: number
  private interval: number

  private rafCallback = () => {
    if (!this.cancelFunc()) {
      window.requestAnimationFrame(this.rafCallback)
      this.now = Date.now()
      let delta = this.now - this.then
      if (delta > this.interval) {
        this.then = this.now - (delta % this.interval)
        this.handler()
      }
    }
  }
}