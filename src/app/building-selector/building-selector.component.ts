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
  bgUrl: string=""

  
  @ViewChild("svg")
  svgRef: ElementRef | undefined
  private svg: SVGElement
  

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
    if (l && this.bg) {
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
        this.bg.setAttribute('src', url)
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
    this.svg = this.svgRef.nativeElement
    this.updateBgUrl()
    let map = this.svgService.parseSvg(this.svg)
    
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
    /*
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
    */
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
