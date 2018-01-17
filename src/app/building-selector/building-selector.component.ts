import {
  Component, ViewChild, Output, Input,
  EventEmitter, ElementRef, AfterViewInit,
  OnChanges, SimpleChanges
} from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, Building, ConfigLayout } from "../shared/model";
import { ConfigService, join } from "../shared/config.service";
import { ResizeService } from "../shared/resize.service";
import { AppService } from "../app.service";
import { MainSvgService } from "./main-svg.service";
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

  @ViewChild("container")
  ctnRef: ElementRef | undefined
  private ctn: HTMLElement

  @ViewChild("background")
  bgRef: ElementRef | undefined
  private bg: HTMLImageElement
  bgUrl: string

  @Input()
  active: boolean = false
  enabled = false
  disabled = true

  constructor(
    configService: ConfigService,
    appService: AppService,
    private resizeService: ResizeService,
    private svgService: MainSvgService) {
    super(configService, appService)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.active || changes.enabled) {
      if (this.active === true && this.enabled === true) {
        this.disabled = false
      }
      else this.disabled = true
    }
  }

  backgroundLoad(event: Event) {
    this.bgState = "loaded"
    this.bg.classList.add("loaded")
    this.enabled = true
    this.ngOnChanges({
      enabled: { currentValue: true, firstChange: true, previousValue: false, isFirstChange: () => true }
    })
    this.loaded.emit(true)
  }

  setConfig(config: Config) {
    this.buildings = config.buildings
    this.resizeService.configLayoutChange.subscribe(this.updateBgUrl)
    this.updateBgUrl()
  }


  private updateBgUrl = (l?: ConfigLayout) => {
    if (!l)
      l = this.resizeService.configLayout
    if (l) {
      const url: string = join(l.name, this.config.image)
      if (this.bgUrl != url) {
        this.bgState = "loading"
        this.bg.classList.remove("loaded")
        let enabled = this.enabled
        if (enabled) {
          this.enabled = false
          this.ngOnChanges({
            enabled: { currentValue: false, firstChange: false, previousValue: true, isFirstChange: () => false }
          })
          this.loaded.emit(false)
        }
        this.bgUrl = url
      }
    }
  }

  private buildings: Building[]
  private zones: SVGElement[] = []
  private zoneTargets: SVGElement[] = []

  roll: any[] = []
  shapes: any[] = []
  overedId: string
  selectedId: string = null

  ngAfterViewInit() {
    this.bg = this.bgRef.nativeElement
    this.ctn = this.ctnRef.nativeElement
    this.svgService.load()
      .subscribe(map => {
        this.roll = map.roll
        this.shapes = map.shapes
      })
    this.svgService.overedChange.subscribe(id => {
      this.selectedId = id
    })
    this.svgService.selectedChange.subscribe(id => {
      for (const b of this.config.buildings) {
        if (b.path == id) {
          this.change.emit(b)
          break
        }
      }
    })

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

}
