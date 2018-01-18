import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { ConfigService } from "../shared/config.service";

export type IzoneEvent = string | { id?: string, d: string, targetId?: string }

type SvgMapItem = { shape: SVGElement, target: SVGElement }
type SvgMap = { [ids: string]: SvgMapItem }
const ON: string = "on"

const getId = (svg: Element): string => {
  return svg.getAttribute('id')
}
const mapCollection = (collection: HTMLCollection) => {
  const l = []
  const n: number = collection.length
  for (let i = 0; i < n; i++) {
    l.push(collection.item(i))
  }
  return l
}
const findById = (node: Element, ids: string[]): { [id: string]: HTMLElement } => {
  const map = {}
  ids = ids.splice(0)
  let done: boolean = false
  const _findRecurse = (e: Element) => {
    if (done)
      return
    const id: string = getId(e)
    const i: number = ids.indexOf(id)
    if (i > -1) {
      ids.splice(i, 1)
      map[id] = e
      if (!ids.length) {
        done = true
        return
      }
    }
    const n = e.children.length
    for (let i = 0; i < n; i++) {
      _findRecurse(e.children.item(i))
    }
  }

  _findRecurse(node)

  return map
}

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
    for(let id in m) {
      this.handleShape(m[id].shape, te)
      m[id].shape.classList.add("svge", "shape")
      m[id].target.classList.add("svge", "roll")
      //svge shape
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
    if (!svg.classList.contains("zoneOn")) {
      svg.style.fillOpacity = ".1"
      svg.style.stroke = "dodgerblue"
      svg.style.strokeWidth = "3"
      svg.classList.add("zoneOn")
      svg.addEventListener(this.animationEvent, (event) => {
        svg.classList.remove("zoneOn")
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
    svg.classList.add("on")
    this.setOvered(true, id)
    let target = this.svgElementsMap[id].target
    target.classList.add('on')
  }

  private outHandler = (event: Event) => {
    let svg = event.currentTarget as SVGElement
    const id: string = getId(svg)
    svg.classList.remove("on")
    this.setOvered(false, id)
    let target = this.svgElementsMap[id].target
    target.classList.remove('on')
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
      let shapes: SVGElement[] = mapCollection(map.shapes.children)
      let rolls: SVGElement[] = mapCollection(map.roll.children)
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
        c.classList.add('shape')
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
      'msAnimation': 'MSAnimationEnd',
      'animation': 'animationend'
    })//animationend 
    console.log("animationend", this._animationEvent)
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
