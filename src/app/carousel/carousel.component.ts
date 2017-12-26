import {
  Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter,
  AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Observable, Observer } from 'rxjs';
import { Tween, TweenEvent, Quadratic, Ease, Linear, interpolate } from "../shared/tween/ease";
import { Rect } from "../shared/math/rect";
import { getContext, draw, clearCanvas } from "../shared/util/canvas.util";
import { getComputedBounds, px } from '../shared/util/css.util';
import { Point } from "../shared/math/point";
import { ResizeService } from "../shared/resize.service";
import { AppService } from "../app.service";
import { ConfigService, join } from "../shared/config.service";
import { Subscription, Config } from "../shared/model";

const DEFAULT_NUMFRAME = 20

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent extends ConfigComponent implements OnInit, OnDestroy {

  constructor(
    appService: AppService,
    configService: ConfigService,
    private sizeService: ResizeService
  ) {
    super(configService, appService)
  }

  private init = (layout?: Rect) => {
    let urls: string[] = []
    let images: HTMLImageElement[] = []
    for (let i of this.config.carousel.images) {
      images.push(null)
      urls.push(join(this.config.carousel.path, i))
    }
    this.currentIndex = 0
    this.urls = urls
    this.checkLoad(NaN, 0)
    this.active = true
  }
  private beforeDraw() {
    this.windoSizes = this.sizeService.windowRect
    clearCanvas(this._ctx, this._canvas)
    this.updateCanvasSize( )
    this.draw(false)
  }
  private resizeHandler = (layout: Rect) => {
    if (this.tweenPlaying)
      return
    this.beforeDraw()
  }
  private resizeSub: Subscription
  setConfig(config: Config) {
    super.setConfig(config)
    this.init()
    let sub: Subscription = this.sizeService.layoutChange.subscribe(layout => {
      sub.unsubscribe()
      this.beforeDraw()
      this.resizeSub = this.sizeService.layoutChange.subscribe(this.resizeHandler)
    })
    this.sizeService.invalidateSize()
  }
  ngOnDestroy() {
    this.resizeSub.unsubscribe()
  }
  active: boolean = false

  private closeObserver: Observer<boolean>
  private _numFrames: number = DEFAULT_NUMFRAME;
  @Input()
  public get numFrames(): number {
    return this._numFrames;
  }

  public set numFrames(v: number) {
    if (isNaN(v) || !isFinite(v) || v < 0)
      v = DEFAULT_NUMFRAME
    this._numFrames = v;
    if (this._tween)
      this._tween.ease.duration = v
  }

  private _tween: Tween

  urls: string[] = []
  images: HTMLImageElement[] = []

  currentIndex: number = 0

  next() {
    this.dir = -1
    const prev = this.currentIndex
    if (this.currentIndex == this.urls.length - 1)
      this.currentIndex = 0
    else
      this.currentIndex++
    this.checkLoad(prev, this.currentIndex)
  }

  prev() {
    this.dir = 1
    const prev = this.currentIndex
    if (this.currentIndex == 0)
      this.currentIndex = this.urls.length - 1
    else
      this.currentIndex--
    this.checkLoad(prev, this.currentIndex)
  }

  ngOnInit() {
    super.ngOnInit()
    this._tween = new Tween(new Ease(0, 1, this._numFrames, Quadratic.out))
    this.setDeactivable(true)
  }

  deactivate(): Observable<boolean> {
    return Observable.create((o: Observer<boolean>) =>{
      this.setDeactivable(false)
      this.active = false
      setTimeout(()=>{
        o.next(true)
        o.complete()
      }, 300)
    })
  }

  @ViewChild("canvas")
  private _canvasRef: ElementRef | undefined
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D

  @ViewChild("prevBox")
  private prevBoxRef: ElementRef | undefined
  private prevBox: HTMLDivElement

  @ViewChild("nextBox")
  private nextBoxRef: ElementRef | undefined
  private nextBox: HTMLDivElement


  private updateCanvasSize() {
    // arrow 35x60 left: 10
    // canvas padding 10
    // window-close 36 + 10 + 10

    // Aligned with layout

    const layout: Rect = this.sizeService.layoutRect
    
    this._canvas.width = layout.width
    this._canvas.height = layout.height
    
    /*
    const BW: number = 60
    const wr: Rect = this.sizeService.windowRect
    let absVal: number = 0
    if (wr.width - layout.width >= BW * 2) {
      absVal = -BW
    }
    this.prevBox.style.left = px(absVal)
    this.nextBox.style.right = px(absVal)

    let ws = this.windoSizes
    let layout: Rect = new Rect()
    layout.x = 55
    layout.y = layout.x
    layout.width = ws[0] - layout.x * 2
    layout.height = ws[1] - layout.y * 2


    this._canvas.style.left = layout.x + PX
    this._canvas.style.top = layout.y + PX

    // Aligned with main-controller

    let ws = this.windoSizes
    let bounds = this.flexRow.getRowBounds(1)
    let layout: Rect = new Rect()
    layout.x = 55
    layout.y = bounds.top
    layout.width = ws[0] - layout.x * 2
    layout.height = bounds.height//ws[1] - layout.y

    this._canvas.width = layout.width
    this._canvas.height = layout.height
    
    this._canvas.style.left = layout.x + PX
    this._canvas.style.top = layout.y + PX
    */
  }
  ngAfterViewInit() {
    this.windoSizes = this.sizeService.windowRect
    this.nextBox = this.nextBoxRef.nativeElement
    this.prevBox = this.prevBoxRef.nativeElement
    this._canvas = this._canvasRef.nativeElement
    this._ctx = getContext(this._canvas, true, true)
  }

  private windoSizes: Rect

  private get tweenPlaying(): boolean {
    return (this._checkLoading || this._transitionSub != null)
  }

  private _transitionSub: any
  private _lastSizes: [number, number]
  private startAnimate(prev: number, current: number) {
    let _data = this.getSlideData()

    let tw: Tween = this._tween

    if (this._transitionSub) {
      this._transitionSub.unsubscribe()
      tw.reset()
    }
    const ctx = this._ctx
    let dest, src, currentRect, intersect: Rect
    let s: number
    let lastSizes = [this._canvas.width, this._canvas.height]
    const _layout: Rect = new Rect(0, 0, this._canvas.width, this._canvas.height)
    this._transitionSub = tw.change.subscribe((e: TweenEvent) => {
      switch (e.type) {
        case "change":
          if (lastSizes[0] != this._canvas.width || lastSizes[1] != this._canvas.height) {
            ctx.clearRect(0, 0, lastSizes[0], lastSizes[1])
            lastSizes = [this._canvas.width, this._canvas.height]
            _layout.height = this._canvas.height
            _layout.width = this._canvas.width
            _data = this.getSlideData()
          }
          ctx.clearRect(0, 0, _layout.width, _layout.height)
          for (let sd of [_data.current, _data.previous]) {
            if (!sd.src)
              continue
            currentRect = sd.box.clone
            s = sd.src.naturalWidth / currentRect.width
            currentRect.x = interpolate(e.currentValue, sd.xFrom, sd.xTo)
            intersect = _layout.intersection(currentRect.clone)
            if (!intersect)
              continue
            dest = intersect.clone
            src = intersect.clone
            src.x = intersect.x - currentRect.x
            src.y = intersect.y - currentRect.y
            src.scale(s, s)
            draw(ctx, sd.src, src, dest)
          }
          break;

        case "end":
          this._transitionSub.unsubscribe()
          this._transitionSub = null
          tw.reset()
          break;

        default:
          break;
      }
    })
    tw.start()
  }

  /**
   * [src, dst]
   */
  getDrawData(): [Rect, Rect] {
    const cw: number = this._canvas.width
    const ch: number = this._canvas.height
    const curImg = this._current
    const img = new Point(curImg.naturalWidth, curImg.naturalHeight)
    const scaled = img.clone
    let s: number = cw / scaled.x
    const sy: number = ch / scaled.y
    if (sy < s)
      s = sy
    if (s < 1)
      scaled.scale(s, s)
    const dest: Rect = new Rect(0, 0, scaled.x, scaled.y)
    dest.x = (cw - dest.width) / 2
    dest.y = (ch - dest.height) / 2

    return [new Rect(0, 0, img.x, img.y), dest]
  }

  private getSlideData() {
    const dir: number = this.dir
    const cw: number = this._canvas.width
    const ch: number = this._canvas.height
    const curImg = this._current
    const prevImg = this._previous
    // x: naturalWidth
    // y: naturalHeight
    let imgs: Point[] = [
      null,
      new Point(curImg.naturalWidth, curImg.naturalHeight)
    ]
    if (prevImg)
      imgs[0] = new Point(prevImg.naturalWidth, prevImg.naturalHeight)

    let scaledImgs: Point[] = imgs.map(r => r ? r.clone : null)

    let s: number
    let sy: number
    let i: Point
    for (i of scaledImgs) {
      if (!i)
        continue
      s = cw / i.x
      sy = ch / i.y
      if (sy < s)
        s = sy
      if (s < 1) {
        i.scale(s, s)
      }
    }
    // cur is image to show at index 1
    let cur: Rect = new Rect(0, 0, scaledImgs[1].x, scaledImgs[1].y)
    // prev is current image to hide  at index 0
    let prev: Rect = prevImg ?
      new Rect(0, 0, scaledImgs[0].x, scaledImgs[0].y)
      : null
    // align scaled into layout
    cur.x = (cw - cur.width) / 2
    cur.y = (ch - cur.height) / 2
    if (prev) {
      prev.x = (cw - prev.width) / 2
      prev.y = (ch - prev.height) / 2
    }

    // calculate start and end values
    // cur come from right to left
    type fromTo = [number, number]
    let curTo: fromTo = [-cw * dir + cur.x, cur.x]
    // cur come from right to left
    let prevTo: fromTo = prev ? [prev.x, cw * dir + prev.x] : [NaN, NaN]
    return {
      dir: 1,
      current: {
        src: curImg,
        box: cur,
        xFrom: curTo[0],
        xTo: curTo[1]
      },
      previous: {
        src: prevImg,
        box: prev,
        xFrom: prevTo[0],
        xTo: prevTo[1]
      }
    }
  }

  private dir: 1 | -1 = 1

  private _current: HTMLImageElement
  private _previous: HTMLImageElement
  private _checkLoading: boolean

  private checkLoad(prev: number, current: number) {
    this._checkLoading = true
    let skiPprev: boolean = false
    let resolve = () => {
      if ((this._previous || skiPprev) && this._current) {
        this._checkLoading = false
        this.startAnimate(prev, current)
      }
    }
    this._current = null
    this._previous = null
    if (!isNaN(prev)) {
      if (this.images[prev]) {
        this._previous = this.images[prev]
      }
      else {
        this.getImage(prev).subscribe(img => {
          this._previous = img
          resolve()
        })
      }
    }
    else
      skiPprev = true
    if (!this.images[current]) {
      this.getImage(current).subscribe(img => {
        this.images[current] = img
        this._current = img
        resolve()
      })
    }
    else {
      this._current = this.images[current]
    }
    resolve()
  }

  getImage(index: number): Observable<HTMLImageElement> {
    return Observable.create((o: Observer<HTMLImageElement>) => {
      this.images[index] = new Image()
      let loaded = (e: Event) => {
        this.images[index].removeEventListener("load", loaded)
        this.images[index].removeEventListener("progress", progress)
        o.next(this.images[index])
        o.complete()
      }
      let progress = (event: ProgressEvent) => {
        this.appService.loadingProgress = event.loaded / event.total
      }
      this.images[index].addEventListener("load", loaded)
      this.images[index].addEventListener("progress", progress)
      this.images[index].src = this.urls[index]
    })
  }


  private draw(clear: boolean = true) {
    if (this.tweenPlaying)
      return
    if (!this._current)
      return
    if (clear)
      clearCanvas(this._ctx, this._canvas)
    const data = this.getDrawData()
    draw(this._ctx, this._current, data[0], data[1])
  }

}


interface SlideData {
  dir: number,
  current: {
    src: Point
    box: Rect
    xFrom: number
    xTo: number
  }
  previous: {
    src: Point
    box: Rect
    xFrom: number
    xTo: number
  }
}
