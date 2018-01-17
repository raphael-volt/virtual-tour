import { Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { IAppartement } from "../../shared/model";
import { ResizeService } from "../../shared/resize.service";
import { Rect } from "../../shared/math/rect";
import { Tween, TweenEvent, TweenEventType, Ease, Quartic, Quintic, interpolate } from "../../shared/tween/ease";

type LiteMatrix = [number, number, number]
type Number2 = [number, number]

@Component({
  selector: 'appartement',
  templateUrl: './appartement.component.html',
  styleUrls: ['./appartement.component.css']
})
export class AppartementComponent implements OnInit, OnChanges, AfterViewInit {

  url: string
  logoUrl: string
  enabled: boolean = false
  slideIn: boolean = false
  slideOut: boolean = false
  slideClass: string

  @ViewChild("main")
  mainRef: ElementRef | undefined
  private main: HTMLDivElement
  @ViewChild("bg")
  bgRef: ElementRef | undefined
  private bg: HTMLDivElement

  @Output()
  close: EventEmitter<string> = new EventEmitter<string>()

  @Input()
  selectedAppartement: IAppartement | undefined

  constructor(private service: ResizeService) {
  }

  ngOnInit() {
    this.upadteSlideClass()
  }
  ngAfterViewInit() {
    this.main = this.mainRef.nativeElement
    this.bg = this.bgRef.nativeElement
  }
  private selectedAppartementChanged: boolean
  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedAppartement) {
      const sc = changes.selectedAppartement
      let prev = sc.previousValue
      let next = sc.currentValue
      if (!prev && !next)
        return

      if (next)
        this.show()
      else
        this.hide()
    }
  }
  private tweenTarget: IAppartement
  private show() {
    const a: IAppartement = this.selectedAppartement
    if (!a || (typeof a.image != "string"))
      return
    this.tweenTarget = a
    this.slideIn = true
    this.upadteSlideClass()
    this.logoUrl = "assets/hd/appartements/logos.jpg"
    this.url = "assets/hd/appartements/" + a.image
  }
  /**
   * @returns [s, tx, ty]
   */
  private getTransform(): LiteMatrix {
    let layout = this.service.layoutRect
    if (!this.imgSize || !this.main || !layout)
      return [1, 0, 0]

    layout.x = 0
    layout.y = 0
    const imgRect: Rect = layout.letterBox(new Rect(0, 0, this.imgSize[0], this.imgSize[1]))
    return [imgRect.width / this.imgSize[0], imgRect.x, imgRect.y]
  }
  private transitionFlag: boolean
  private imgSize: Number2
  imgLoad(img: HTMLImageElement) {
    this.imgSize = [img.naturalWidth, img.naturalHeight]

    let layout = this.service.layoutRect
    const a = this.tweenTarget
    const lr = layout.height / layout.width
    let r = new Rect(
      a.position[0] * layout.width,
      a.position[1] * layout.height,
      0, 0)

    let s = r.width / layout.width
    const style = this.main.style
    const to: LiteMatrix = this.getTransform()
    const from: LiteMatrix = [0, r.x, r.y]
    let r2 = new Rect(0, 0, 1920, 1080)
    r2 = r2.letterBox(new Rect(0, 0, this.imgSize[0], this.imgSize[1]))
    this.bg.style.transform = `translateX(${-r2.x}px)`

    this.animate(from, to).then(() => {
      // this.slideIn = false
    })
    this.enabled = true
    this.slideIn = true
    this.upadteSlideClass()
  }

  private _tween: Tween
  animate(from: LiteMatrix, to: LiteMatrix, d: number = 18) {
    if(this.transitionFlag) {
      this._tween.reset()
    }
    return new Promise((resolve, reject) => {
      const aFrom: number = to[0] == 0 ? 1:0.4
      const aTo = aFrom == 1 ? .4:1
      this.transitionFlag = true
      let t = new Tween(new Ease(0, 1, d, Quintic.out))
      let sub = t.change.subscribe((event: TweenEvent) => {
        if(event.type == "change") {
          const i = event.currentValue
          const v = [
            interpolate(i, from[0], to[0]),
            interpolate(i, from[1], to[1]),
            interpolate(i, from[2], to[2])
          ]
  
          this.main.style.opacity = `${interpolate(i, aFrom, aTo)}`
          this.main.style.transform = `translate(${v[1]}px, ${v[2]}px) scale(${v[0]})`
          
        }
        if (event.type == "end") {
          sub.unsubscribe()
          this.transitionFlag = false
          resolve()
        }
      })
      t.start()
      this._tween = t
    })
  }

  closeHandler() {

    this.close.emit('close')
  }

  hide() {
    const a = this.tweenTarget
    let layout = this.service.layoutRect
    const lr = layout.height / layout.width
    let r = new Rect(
      a.position[0] * layout.width,
      a.position[1] * layout.height,
      0, 0)

    let s = r.width / layout.width
    const style = this.main.style
    const from = this.getTransform()
    const to: LiteMatrix = [0, r.x, r.y]

    this.animate(from, to)
      .then(this.slideEnd)
    this.slideIn = false
    this.slideOut = true
    this.upadteSlideClass()
  }

  private slideEnd = () => {
    this.slideOut = false
    this.enabled = false
    this.url = null
    this.upadteSlideClass()
  }

  private upadteSlideClass() {
    const l: string[] = ["slider"]
    if (this.slideIn)
      l.push("in")
    if (this.slideOut)
      l.push("out")
    if (this.enabled)
      l.push('on')
    const str: string = l.join(' ')
    if (str == this.slideClass)
      return
    this.slideClass = str
  }
}
