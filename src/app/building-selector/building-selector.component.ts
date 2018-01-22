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
  private bgUrl: string


  @ViewChild("svg")
  svgRef: ElementRef | undefined
  private svg: SVGElement


  @Input()
  active: boolean = false

  constructor(
    private urlService: MediaUrlService,
    configService: ConfigService,
    appService: AppService,
    private loader: LoaderService,
    private resizeService: ResizeService,
    private svgService: MainSvgService) {
    super(configService, appService)
    urlService.definitionChange.subscribe(def => {
      this.updateBgUrl()
    })
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  setConfig(config: Config) {
    this.buildings = config.buildings
    this.resizeService.configLayoutChange.subscribe(this.updateBgUrl)
    this.updateBgUrl()
  }


  private loading: boolean = false
  private updateBgUrl = () => {
    if (!this.config || !this.bg || !this.urlService.definition) return
    const url: string = this.urlService.getAsset(this.config.image)
    if (this.bgUrl != url) {
      this.bgUrl = url
      removeClass(this.bg, "loaded")
      this.loader.loadImg(this.bg, url)
        .subscribe(event => {
          this.appService.loadingProgress = event.loaded / event.total
        },
        err => { 
          console.log('updateBgUrl/error', err)
        },
        () => {
          this.appService.loading = false
          addClass(this.bg, "loaded")
          this.appService.mainBackgroundLoaded = true
          this.loaded.emit(true)
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

  ngAfterViewInit() {
    this.bg = this.bgRef.nativeElement
    this.svg = this.svgRef.nativeElement

    this.svgService.selectedChange.subscribe(id => {
      for (const b of this.config.buildings) {
        if (b.path == id) {
          this.change.emit(b)
          break
        }
      }
    })
    this.svgService.parseSvg(this.svg)
    this.updateBgUrl()
  }
}
