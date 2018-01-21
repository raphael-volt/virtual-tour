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
import { MediaUrlService } from "../media-url.service";
import { addClass, removeClass, hasClass } from "../shared/util/dom.utils";
import { LoaderEvent, LoaderService } from "../loader.service";
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
  private bgUrl: string = ""


  @ViewChild("svg")
  svgRef: ElementRef | undefined
  private svg: SVGElement


  @Input()
  active: boolean = false
  enabled = false
  disabled = true


  constructor(
    private urlService: MediaUrlService,
    configService: ConfigService,
    appService: AppService,
    private loader: LoaderService,
    private resizeService: ResizeService,
    private svgService: MainSvgService) {
    super(configService, appService)
    urlService.definitionChange.subscribe(def => {
      if (!this._initFlag)
        return this.init()
      this.updateBgUrl()
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.active || changes.enabled) {
      if (this.active === true && this.enabled === true) {
        this.disabled = false
      }
      else this.disabled = true
    }
  }

  setConfig(config: Config) {
    this.buildings = config.buildings
    this.resizeService.configLayoutChange.subscribe(this.updateBgUrl)
    this.init()
  }


  private updateBgUrl = () => {
    if (!this.config || !this.bg || !this.urlService.definition) return
    const url: string = this.urlService.getAsset(this.config.image)
    if (this.bgUrl != url) {
      this.bgUrl = url
      removeClass(this.bg, "loaded")
      let enabled = this.enabled
      if (enabled) {
        this.enabled = false
        this.ngOnChanges({
          enabled: { currentValue: false, firstChange: false, previousValue: true, isFirstChange: () => false }
        })
        this.loaded.emit(false)
      }
      this.loader.loadImg(this.bg, url)
        .subscribe(event => {
          this.appService.loadingProgress = event.loaded / event.total
        },
        err => { },
        () => {
          this.appService.loading = false
          addClass(this.bg, "loaded")
          this.enabled = true
          this.ngOnChanges({
            enabled: { currentValue: true, firstChange: true, previousValue: false, isFirstChange: () => true }
          })
          this.loaded.emit(true)
          this.appService.mainBackgroundLoaded = true
        })
    }
  }

  private buildings: Building[]
  private zones: SVGElement[] = []
  private zoneTargets: SVGElement[] = []

  roll: any[] = []
  shapes: any[] = []
  overedId: string
  selectedId: string = null

  private _initFlag: boolean = false
  private init() {
    if (!this.config || !this.bg || this._initFlag || !this.urlService.definition)
      return
    this._initFlag = true
    this.updateBgUrl()
  }
  ngAfterViewInit() {
    this.bg = this.bgRef.nativeElement
    this.svg = this.svgRef.nativeElement
    this.init()

    let map = this.svgService.parseSvg(this.svg)
    this.svgService.selectedChange.subscribe(id => {
      for (const b of this.config.buildings) {
        if (b.path == id) {
          this.change.emit(b)
          break
        }
      }
    })
  }
}
