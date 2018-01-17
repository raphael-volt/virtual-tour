import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ConfigService, join } from "../shared/config.service";
import { ConfigComponent } from "../shared/config.component";
import { Config, Building, Subscription, ConfigLayout } from "../shared/model";
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
    if(! this.resizeService.configLayout)
      return
    this.scaleFactor = layout.width / this.resizeService.configLayout.layout.width
  }

  private scaleFactor: number = 1

  deactivate(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.inFinish = false
      this.deactivator = observer
      this.setDeactivable(false)
      this.createSources("out")
    })
  }

  private createSources(prefix: "in" | "out") {
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

  private layoutChanged = (layout: ConfigLayout) => {
    if (!this.inFinish) {
      this.createSources("in")
    }
    else {
      if (this.deactivator)
        this.createSources("out")
      else
        this.bgImg.setAttribute("src", this.bgURL)
    }
  }
  protected setConfig(config: Config) {
    super.setConfig(config)
    let sub: Subscription = this.route.params.subscribe(params => {
      this.building = this.configService.findBuildingByPath(params.id)
      this.resizeService.configLayoutChange.subscribe(this.layoutChanged)
      if(this.resizeService.configLayout)
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
      this.bgImg.setAttribute("src", this.bgURL)
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
    /*
    this.bgImg.addEventListener("load", () => {
      this.bgLoaded = true
      this.checkBackgroundVisibility()
    })
    */
  }

  ngOnDestroy() {
    if (this.resizeSub)
      this.resizeSub.unsubscribe()
  }
}
