import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ConfigService, join } from "../shared/config.service";
import { ConfigComponent } from "../shared/config.component";
import { Config, Building, Subscription } from "../shared/model";
import { DeactivableComponent } from "../shared/deactivable.component";
import { VideoEvent } from "../shared/events/video-event";
import { Observable, Observer } from 'rxjs';
import { AppService } from "../app.service"
import { ResizeService } from "../shared/resize.service";
import { Rect } from "../shared/math/rect";
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
    private resizeService: ResizeService) {
    super(configService, appService)
  }

  updateScaleFactor = (layout: Rect) => {
    this.scaleFactor = layout.width / this.config.layout.width
  }

  private scaleFactor: number = 1

  deactivate(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.deactivator = observer
      this.setDeactivable(false)
      this.checkBackgroundVisibility()
      this.createSources("out")
    })
  }
  
  private createSources(prefix: "in" | "out") {
    let src: { src: string, type: string }[] = []
    for(let f of this.config.video.formats) {
      let e: string
      let t: string
      switch (f) {
        case "mp4":      
        case "webm":
        e = f
        t = f
        break;   
        case "ogv":
        e = f
        t = "ogg"
        break;
        default:
        break;
      }
      src.push(
        {
          src: join(this.building.path, prefix + "." + e),
          type: "video/" + t
        }
      )
    }
    this.videoUrl = src[0].src
    this.videoSources = src
  }
  
  protected setConfig(config: Config) {
    super.setConfig(config)
    let sub: Subscription = this.route.params.subscribe(params => {
      this.building = this.configService.findBuildingByPath(params.id)
      this.createSources("in")
      if (sub)
        sub.unsubscribe()
    })
    if (sub.closed)
      sub.unsubscribe()
  }

  private bgLoaded: boolean = false
  private inFinish: boolean = false
  hasBackgroung: boolean = false
  hasAppartement: boolean = false

  private checkBackgroundVisibility = () => {
    this.hasBackgroung = (this.bgLoaded && this.inFinish)
    this.hasAppartement = (this.hasBackgroung && !this.deactivator)
  }

  backgroundLoaded() {
    this.bgLoaded = true
    this.checkBackgroundVisibility()
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

    if (event.type == "begin" && !this.deactivator) {
      if (!this.bgLoaded) {
        const loaded = () => {
          this.bgLoaded = true
          this.bgImg.removeEventListener("load", loaded)
          this.bgImg.removeEventListener("progress", progress)
          this.appService.loading = false
        }

        const progress = (event: ProgressEvent) => {
          this.appService.loadingProgress = event.loaded / event.total
        }

        this.bgImg.addEventListener("load", loaded)
        this.bgImg.addEventListener("progress", progress)
        this.bgImg.src = join(this.building.path, this.building.image)
      }
    }

    if (event.type == "begin" && this.deactivator) {
      this.inFinish = false
      this.checkBackgroundVisibility()
    }
  }

  items: any[]

  private createItems() {
    this.items = this.building.items
    this.resizeSub = this.resizeService.layoutChange
      .subscribe(this.updateScaleFactor)
    this.updateScaleFactor(this.resizeService.layoutRect)
  }

  ngAfterViewInit() {
    this.bgImg = this.bgImgRef.nativeElement
  }

  ngOnDestroy() {
    if (this.resizeSub)
      this.resizeSub.unsubscribe()
  }
}
