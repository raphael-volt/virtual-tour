import {
  Component, ViewChild, Output, Input,
  EventEmitter, ElementRef, AfterViewInit,
  OnChanges, SimpleChanges
} from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, Building } from "../shared/model";
@Component({
  selector: 'building-selector',
  templateUrl: './building-selector.component.html',
  styleUrls: ['./building-selector.component.scss']
})
export class BuildingSelectorComponent extends ConfigComponent implements AfterViewInit, OnChanges {

  @Output()
  change: EventEmitter<Building> = new EventEmitter<Building>()
  @Output()
  loaded: EventEmitter<boolean> = new EventEmitter<boolean>()

  @ViewChild("svg")
  svgref: ElementRef | undefined
  private svg: SVGElement

  @ViewChild("z1")
  z1ref: ElementRef | undefined
  private z1: SVGElement
  @ViewChild("z1o")
  z1OverRef: ElementRef | undefined
  private z1Over: SVGElement

  @ViewChild("z2")
  z2ref: ElementRef | undefined
  private z2: SVGElement
  @ViewChild("z2o")
  z2OverRef: ElementRef | undefined
  private z2Over: SVGElement

  @ViewChild("z3")
  z3ref: ElementRef | undefined
  private z3: SVGElement
  @ViewChild("z3o")
  z3OverRef: ElementRef | undefined
  private z3Over: SVGElement

  @ViewChild("z4")
  z4ref: ElementRef | undefined
  private z4: SVGElement
  @ViewChild("z4o")
  z4OverRef: ElementRef | undefined
  private z4Over: SVGElement

  @ViewChild("z5")
  z5ref: ElementRef | undefined
  private z5: SVGElement
  @ViewChild("z5o")
  z5OverRef: ElementRef | undefined
  private z5Over: SVGElement


  @ViewChild("container")
  ctnRef: ElementRef | undefined
  private ctn: HTMLElement

  @ViewChild("background")
  bgRef: ElementRef | undefined
  private bg: HTMLImageElement

  setConfig(config: Config) {
    this.buildings = config.buildings
  }

  private buildings: Building[]
  private zones: SVGElement[] = []
  private zoneTargets: SVGElement[] = []

  ngAfterViewInit() {
    this.z5 = this.z5ref.nativeElement
    this.z4 = this.z4ref.nativeElement
    this.z3 = this.z3ref.nativeElement
    this.z2 = this.z2ref.nativeElement
    this.z1 = this.z1ref.nativeElement
    this.z5Over = this.z5OverRef.nativeElement
    this.z4Over = this.z4OverRef.nativeElement
    this.z3Over = this.z3OverRef.nativeElement
    this.z2Over = this.z2OverRef.nativeElement
    this.z1Over = this.z1OverRef.nativeElement
    this.bg = this.bgRef.nativeElement
    this.ctn = this.ctnRef.nativeElement
    this.svg = this.svgref.nativeElement
    let l = [
      [this.z1, this.z1Over],
      [this.z2, this.z2Over],
      [this.z3, this.z3Over],
      [this.z4, this.z4Over]
      // [this.z5, this.z5Over]
    ]
    for (let row of l) {
      this.zones.push(row[0])
      this.zoneTargets.push(row[1])
      if (!this.configService.touchEnable) {
        row[0].addEventListener("mouseover", this.zoneOver)
      }
      row[0].addEventListener("click", this.zoneClick)
    }
  }

  private zoneOver = (event: Event) => {
    let target = this.setZonTargetVisible(event, true)
    target.addEventListener("mouseout", this.zoneOut)
  }

  private zoneOut = (event: Event) => {
    let target = this.setZonTargetVisible(event, false)
    target.removeEventListener("mouseout", this.zoneOut)
  }

  private setZonTargetVisible(event: Event, visible: boolean): SVGElement {
    const i: number = this.zones.indexOf(event.currentTarget as SVGElement)
    if (!this.configService.touchEnable) {
      const f: Function = visible ?
        this.zoneTargets[i].classList.add :
        this.zoneTargets[i].classList.remove
      f.apply(this.zoneTargets[i].classList, ["over"])
    }
    return this.zones[i]
  }

  private zoneClick = (event: Event) => {
    const target: SVGElement = this.setZonTargetVisible(event, false) as SVGElement
    if (this.configService.touchEnable) {
      this.animateZoneTouch(target)
    }
    let i = this.zones.indexOf(target)
    if (i != -1)
      this.change.emit(this.buildings[i])
  }

  private _animationEvent: string
  private get animationEvent(): string {
    if (this._animationEvent)
      return this._animationEvent
    let animations = {
      'WebkitAnimation': 'webkitAnimationEnd',
      'MozAnimation': 'animationend',
      'OAnimation': 'oAnimationEnd oanimationend',
      'msAnimation': 'MSAnimationEnd',
      'animation': 'animationend'
    }
    let t: string;
    const el = document.createElement('fakeelement')
    for (t in animations) {
      if (el.style[t] !== undefined) {
        break
      }
    }
    this._animationEvent = animations[t]
    return animations[t]
  }
  private _transitionEvent: string
  private get transitionEvent() {
    if (this._transitionEvent)
      return this._transitionEvent
    let t: string;
    const el = document.createElement('fakeelement')
    const transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    }

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        break
      }
    }
    this._transitionEvent = transitions[t]
    return transitions[t]
  }

  private animateZoneTouch(svg: SVGElement) {
    if (!svg.classList.contains("zoneOn")) {
      svg.style.fillOpacity = ".1"
      svg.style.stroke = "dodgerblue"
      svg.style.strokeWidth = "3"
      svg.classList.add("zoneOn")
      svg.addEventListener(this.animationEvent, (event) => {
        svg.classList.remove("zoneOn")
      })
    }
  }

  backgroundLoadingProgress: number = 0
  bgState: "none" | "loading" | "loaded" = "none"
  backgroundProgress = (event: ProgressEvent): boolean => {
    if (this.bgState != "loading") {
      this.bgState = "loading"
    }
    this.backgroundLoadingProgress = Math.round(event.loaded / event.total * 100)
    return true
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.active || changes.enabled) {
      if (this.active === true && this.enabled === true) {
        this.disabled = false
      }
      else this.disabled = true
    }
  }
  @Input()
  active: boolean = false
  enabled = false
  disabled = true
  backgroundLoad(event: Event) {
    this.bgState = "loaded"
    this.bg.classList.add("loaded")
    this.enabled = true
    this.ngOnChanges({
      enabled: { currentValue: true, firstChange: true, previousValue: false, isFirstChange: () => true }
    })
    this.loaded.emit(true)
  }
}
