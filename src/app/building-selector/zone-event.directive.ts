import { Directive, ElementRef, Output, Input } from '@angular/core';
import { ConfigService } from "../shared/config.service";
import { MainSvgService, IzoneEvent } from "./main-svg.service";

@Directive({
  selector: '[zoneEvent]'
})
export class ZoneEventDirective {

  private id: string
  private targetId: string
  private _zoneEventOn: boolean
  private _zoneEvent: IzoneEvent
  private handle: boolean = false

  constructor(private ref: ElementRef, private service: MainSvgService) { }

  @Input()
  get zoneEventOn(): boolean {
    return this._zoneEventOn
  }

  set zoneEventOn(value: boolean) {
    if (typeof value != "boolean")
      value = false
    if (this._zoneEventOn == value)
      return
    this._zoneEventOn = value
    const e = this.ref.nativeElement
    if (value)
      e.classList.add("on")
    else
      e.classList.remove("on")
  }

  @Input()
  get zoneEvent(): IzoneEvent {
    return this._zoneEvent
  }

  set zoneEvent(value: IzoneEvent) {
    if (this._zoneEvent == value)
      return
    this._zoneEvent = value
    const svg: SVGElement = this.ref.nativeElement
    if (typeof value == "string") {
      value = { d: value, id: null }
      this.handle = false
    }
    if (value.id) {
      svg.setAttribute('id', value.id)
      this.handle = true
    }
    if (value.targetId)
      this.targetId = value.targetId
    svg.setAttribute('d', value.d)
    if (this.handle) {
      this.handleShape(svg, this.service.touchEnable)
    }
  }

  private handleShape(svg: SVGElement, touch: boolean) {
    const t: string = touch ? "touchend" : "click"
    this.id = svg.getAttribute('id')
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
      svg.addEventListener(this.service.animationEvent, (event) => {
        svg.classList.remove("zoneOn")
        this.service.selectedChange.emit(this.id)
      })
    }
  }

  private clickHandler = (event: Event) => {
    this.animateZoneTouch(this.ref.nativeElement)
  }

  private overHandler = (event: Event) => {
    let svg = this.ref.nativeElement
    svg.classList.add("on")
    this.service.setOvered(true, this.id)
  }

  private outHandler = (event: Event) => {
    let svg = this.ref.nativeElement
    svg.classList.remove("on")
    this.service.setOvered(false, this.id)
  }

}
