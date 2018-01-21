import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ConfigService, join } from "../shared/config.service";
import { ConfigComponent } from "../shared/config.component";
import { Config, Building, Subscription, ConfigLayout, IAppartement } from "../shared/model";
import { DeactivableComponent } from "../shared/deactivable.component";
import { VideoEvent } from "../shared/events/video-event";
import { Observable, Observer } from 'rxjs';
import { AppService } from "../app.service"
import { ResizeService } from "../shared/resize.service";
import { Rect } from "../shared/math/rect";
import { LoaderEvent, LoaderService } from "../loader.service";
@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent extends ConfigComponent implements OnDestroy, AfterViewInit {

  @ViewChild("bgImg")
  bgImgRef: ElementRef | undefined
  private bgImg: HTMLImageElement

  videoSources: { src: string, type: string }[] = []
  videoUrl: string = ""

  private deactivator: Observer<boolean>
  private building: Building
  private resizeSub: Subscription

  constructor(
    private route: ActivatedRoute,
    appService: AppService,
    configService: ConfigService,
    private ldrService: LoaderService,
    private resizeService: ResizeService) {
    super(configService, appService)
  }

  updateScaleFactor = (layout: Rect) => {
    if (!this.resizeService.configLayout)
      return
    this.scaleFactor = layout.width / this.resizeService.configLayout.layout.width
  }

  private scaleFactor: number = 1

  deactivate(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.selectedAppartement = null
      this.inFinish = false
      this.deactivator = observer
      this.hasAppartement = false
      this.setDeactivable(false)
      this.createSources("out")
    })
  }

  private videoLoading: boolean = true

  private createSources(prefix: "in" | "out") {
    this.videoLoading = true
    let done = (layout: ConfigLayout) => {
      let src: { src: string, type: string }[] = []
      for (let f of layout.video.formats) {
        let t: string = f
        switch (f) {
          case "ogv":
            t = "ogg"
            break;
        }
        src.push(
          {
            src: join(layout.name, this.building.path, prefix + "." + f),
            type: "video/" + t
          }
        )
      }
      this.videoUrl = src[0].src
      this.videoSources = src
    }
    if (this.resizeService.configLayout)
      done(this.resizeService.configLayout)

  }
  private _bgUrl: string
  private checkBackgroundUrl(layout?: ConfigLayout) {
    if (!layout)
      layout = this.resizeService.configLayout
    if (!this.bgImg || !layout || this.videoLoading)
      return
    const src = this.bgURL
    if (this._bgUrl == src)
      return
    this._bgUrl = src
    this.ldrService.loadImg(this.bgImg, src)
      .subscribe(
      event => { 
        if(this.inFinish) {
          this.appService.loadingProgress = event.loaded / event.total
        }
      },
      error => { },
      () => {
        this.bgLoaded = true
        this.checkBackgroundVisibility()
        this.appService.loading = false
      })
  }

  private layoutChanged = (layout: ConfigLayout) => {
    if (!this.inFinish) {
      this.createSources("in")
    }
    else {
      if (this.deactivator)
        this.createSources("out")
    }

    //this.checkBackgroundUrl(layout)
  }
  protected setConfig(config: Config) {
    super.setConfig(config)
    let sub: Subscription = this.route.params.subscribe(params => {
      this.building = this.configService.findBuildingByPath(params.id)
      this.resizeService.configLayoutChange.subscribe(this.layoutChanged)
      if (this.resizeService.configLayout)
        this.layoutChanged(this.resizeService.configLayout)
      if (sub)
        sub.unsubscribe()
    })
    if (sub.closed)
      sub.unsubscribe()
  }

  private get bgURL(): string | null {
    let layout = this.resizeService.configLayout
    if (!layout || !this.building)
      return null
    return join(layout.name, this.building.path, this.building.image)
  }

  private bgLoaded: boolean = false
  private inFinish: boolean = false
  hasBackgroung: boolean = false
  hasAppartement: boolean = false
  selectedAppartement: IAppartement = undefined
  private checkBackgroundVisibility = () => {
    this.hasBackgroung = (this.bgLoaded && this.inFinish)
    this.hasAppartement = (this.hasBackgroung && !this.deactivator)
  }

  videoChange(event: VideoEvent) {
    if (event.type == "finish" && this.deactivator) {
      this.deactivator.next(true)
      this.deactivator = null
      return
    }

    if (event.type == "finish" && !this.deactivator) {
      this.setDeactivable(true)
      this.inFinish = true
      this.checkBackgroundVisibility()
      this.createItems()
      return
    }

    if (event.type == "begin") {
      this.videoLoading = false
      if (!this.deactivator)
        this.checkBackgroundUrl()
      else {
        this.inFinish = false
        this.checkBackgroundVisibility()
      }
    }
  }

  appartements: IAppartement[]

  private createItems() {
    this.appartements = this.building.items
    this.resizeSub = this.resizeService.layoutChange
      .subscribe(this.updateScaleFactor)
    this.updateScaleFactor(this.resizeService.layoutRect)
  }
  selectAppartement(a: IAppartement) {
    this.selectedAppartement = a
    this.appService.hasHome = false
  }
  appartementClose() {
    this.appService.hasHome = true
    this.selectedAppartement = null
  }
  ngAfterViewInit() {
    this.bgImg = this.bgImgRef.nativeElement
    this.checkBackgroundUrl()
  }

  ngOnDestroy() {
    if (this.resizeSub)
      this.resizeSub.unsubscribe()
  }
}
