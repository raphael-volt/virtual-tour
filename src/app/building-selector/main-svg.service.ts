import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { ConfigService } from "../shared/config.service";
import { element } from 'protractor';
import { isNode, mapCollection,
  getId, findById, 
  classList, hasClass, addClass, removeClass, 
  SPACE, CLASS 
} from '../shared/util/dom.utils'

export type IzoneEvent = string | { id?: string, d: string, targetId?: string }

type SvgMapItem = { shape: SVGElement, target: SVGElement }
type SvgMap = { [ids: string]: SvgMapItem }
const ON: string = "on"


export interface SvgDataMap {
  shapes: IzoneEvent[]
  roll: IzoneEvent[]
}

@Injectable()
export class MainSvgService {

  selectedChange: EventEmitter<string> = new EventEmitter<string>()
  private svgDataMap: SvgDataMap

  constructor(private configService: ConfigService) { }

  get touchEnable(): boolean {
    return this.configService.touchEnable
  }

  parseSvg(svg: SVGElement): SvgMap {
    this.createIdMap(svg)
    const m = this.svgElementsMap
    const te = this.touchEnable
    for (let id in m) {
      this.handleShape(m[id].shape, te)
      addClass(m[id].shape, "svge", "shape")
      addClass(m[id].target, "svge", "roll")
    }
    return this.svgElementsMap
  }

  private handleShape(svg: SVGElement, touch: boolean) {
    const t: string = touch ? "touchend" : "click"
    svg.addEventListener(t, this.clickHandler)
    if (!touch) {
      svg.addEventListener("mouseover", this.overHandler)
      svg.addEventListener("mouseout", this.outHandler)
    }
  }

  private animateZoneTouch(svg: SVGElement) {

    if (!hasClass(svg, "zoneOn")) {
      svg.style.fillOpacity = ".1"
      svg.style.stroke = "dodgerblue"
      svg.style.strokeWidth = "3"
      addClass(svg, "zoneOn")
      svg.addEventListener(this.animationEvent, (event) => {
        removeClass(svg, "zoneOn")
        this.selectedChange.emit(getId(svg))
      })
    }
  }

  private clickHandler = (event: Event) => {
    this.animateZoneTouch(event.currentTarget as SVGElement)
  }

  private overHandler = (event: Event) => {
    let svg = event.currentTarget as SVGElement
    const id: string = getId(svg)
    addClass(svg, "on")
    this.setOvered(true, id)
    let target = this.svgElementsMap[id].target
    addClass(target, 'on')
  }

  private outHandler = (event: Event) => {
    let svg = event.currentTarget as SVGElement
    const id: string = getId(svg)
    removeClass(svg, "on")
    this.setOvered(false, id)
    let target = this.svgElementsMap[id].target
    removeClass(target, 'on')
  }

  load(): Observable<SvgDataMap> {
    if (this.svgDataMap)
      return Observable.of(this.svgDataMap)
    return Observable.create((observer: Observer<SvgDataMap>) => {
      const append = () => {
        observer.next(this.svgDataMap)
        observer.complete()
      }
      if (this.svgDataMap)
        return append()

      let xhr = new XMLHttpRequest()
      xhr.responseType = "document"

      const onLoad = (event?: Event) => {
        xhr.removeEventListener("load", onLoad)
        this.createIdMap(xhr.responseXML.documentElement)
        append()
      }

      xhr.addEventListener("load", onLoad)
      xhr.open("GET", "assets/main.svg")
      xhr.send()
    })
  }

  private svgElementsMap: SvgMap
  createIdMap(element: Element) {
    let map = findById(element, ["roll", "shapes"])
    const sd: SvgDataMap = {
      roll: [],
      shapes: []
    }
    let id: string
    if (map.roll && map.shapes) {

      let svg: SVGElement
      let shapes: SVGElement[] = mapCollection(map.shapes)
      let rolls: SVGElement[] = mapCollection(map.roll)
      let i = 0
      const nS = shapes.length
      const nR = rolls.length
      let m: SvgMap = {}
      for (i = 0; i < nS; i++) {
        const c = shapes[i]
        const mi = {
          shape: c,
          target: (i < nR ? rolls[i] : null)
        }
        m[c.getAttribute('id')] = mi
        addClass(c, 'shape')
        sd.shapes.push({ id: c.getAttribute('id'), d: c.getAttribute('d') })
        if (!mi.target) {
          continue
        }
        sd.roll.push({
          d: mi.target.getAttribute('d'),
          targetId: c.id
        })
      }
      this.svgElementsMap = m
    }
    this.svgDataMap = sd
    return sd
  }

  overedChange: EventEmitter<string> = new EventEmitter<string>()

  setOvered(over, id: string) {
    this.overedChange.emit(over ? id : null)
  }

  private _animationEvent: string
  private _transitionEvent: string


  get animationEvent(): string {
    if (this._animationEvent)
      return this._animationEvent
    this._animationEvent = getEventType({
      'WebkitAnimation': 'webkitAnimationEnd',
      'MozAnimation': 'animationend',
      'OAnimation': 'animationend',//'oAnimationEnd oanimationend',
      'msAnimation': 'animationend',
      'animation': 'animationend'
    })//animationend 
    return this._animationEvent
  }

  get transitionEvent() {
    if (this._transitionEvent)
      return this._transitionEvent
    this._transitionEvent = getEventType({
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    })
    return this._transitionEvent
  }
}
type IEventMap = { [name: string]: string }
const getEventType = <T extends IEventMap, K extends keyof T>(data: T): T[K] => {
  const el = document.createElement('fakeelement')
  let k: string
  for (k in data) {
    if (el.style[k] !== undefined) {
      return data[k]
    }
  }

  return null
}
