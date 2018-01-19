import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { ConfigService } from "../shared/config.service";
import { element } from 'protractor';

export type IzoneEvent = string | { id?: string, d: string, targetId?: string }

type SvgMapItem = { shape: SVGElement, target: SVGElement }
type SvgMap = { [ids: string]: SvgMapItem }
const ON: string = "on"
const CLASS: string = "class"
const SPACE: string = " "

const classList = (svg: Element) => {
  let v = svg.getAttribute(CLASS)
  if (!v || !v.length)
    return []
  const re = /\s+/;
  v = v.replace(re, SPACE)
  v = v.trim()
  if (!v.length)
    return []
  return v.split(SPACE)
}

const setClass = (svg: Element, value: string | string[]) => {
  if (typeof value != "string") {
    value = value.join(SPACE)
  }
  svg.setAttribute(CLASS, value)
}

const hasClass = (svg: Element, cls: string, list?) => {
  if (!list)
    list = classList(svg)
  return list.indexOf(cls) > -1
}

const addClass = (svg: Element, ...args: string[]) => {
  let l = classList(svg)
  for (const cls of args) {
    if (!hasClass(svg, cls, l)) {
      l.push(cls)
    }
  }
  setClass(svg, l)
}

const removeClass = (svg: Element, cls: string) => {
  let l = classList(svg)
  if (hasClass(svg, cls, l)) {
    const i = l.indexOf(cls)
    l.splice(l.indexOf(cls), 1)
    setClass(svg, l)
  }
}

const getId = (svg: Element): string => {
  return svg.getAttribute('id')
}
const isNode = (elmt: Node) => {
  return elmt.nodeType == Node.ELEMENT_NODE
}
const mapCollection = (target: Node) => {
  const l = []
  if (isNode(target)) {
    const n = target.childNodes.length
    for (var i = 0; i < n; i++) {
      const c = target.childNodes.item(i)
      if (isNode(c))
        l.push(c)
    }
  }
  return l
}
const findById = (node: Node, ids: string[]): { [id: string]: HTMLElement } => {
  const map = {}
  ids = ids.splice(0)
  let done: boolean = false
  let sps = []
  const _findRecurse = (e: Node) => {
    if (done)
      return
    const id: string = getId(e as Element)
    const i: number = ids.indexOf(id)
    if (i > -1) {
      ids.splice(i, 1)
      map[id] = e
    }
    const l = mapCollection(e)
    for (const c of l)
      _findRecurse(c)
  }

  _findRecurse(node)
  console.log("DONE")
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
