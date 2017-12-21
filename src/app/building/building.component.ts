import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ConfigService, join } from "../shared/config.service";
import { ConfigComponent } from "../shared/config.component";
import { Config, Building, Subscription } from "../shared/model";
import { DeactivableComponent } from "../shared/deactivable.component";
import { VideoEvent } from "./video-loader.directive";
import { Observable, Observer } from 'rxjs';
import { AppService } from "../app.service"
import { ResizeService } from "../shared/resize.service";
import { Rect } from "../shared/math/rect";
import { Loader, LoaderEvent } from "../shared/loader";
@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent extends ConfigComponent implements OnDestroy, AfterViewInit {

  @ViewChild("bgImg")
  bgImgRef: ElementRef | undefined
  private bgImg: HTMLImageElement

  videoUrl: string = ""

  private deactivator: Observer<boolean>
  private building: Building
  private resizeSub: Subscription

  constructor(
    private route: ActivatedRoute,
    appService: AppService,
    configService: ConfigService,
    private resizeService: ResizeService,
    private loader: Loader) {
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
      this.videoUrl = join(this.building.path, "out." + this.config.video.extension)
    })
  }

  protected setConfig(config: Config) {
    super.setConfig(config)
    let sub: Subscription = this.route.params.subscribe(params => {
      this.building = this.configService.findBuildingByPath(params.id)
      this.videoUrl = join(this.building.path, "in." + config.video.extension)
      if (sub)
        sub.unsubscribe()
    })
    if (sub.closed)
      sub.unsubscribe()
  }

  private bgLoaded: boolean = false
  private inFinish: boolean = false
  hasBackgroung: boolean = false

  private checkBackgroundVisibility = () => {
    this.hasBackgroung = (this.bgLoaded && this.inFinish)
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
      let sub: Subscription = this.loader.loadDataUrl(join(this.building.path, this.building.image), false)
        .subscribe(
        event => {
          if(! this.inFinish)
            event.prevented = true
          if (event.type == "dataUrl") {
            this.bgImg.src = event.urlData
          }
        })
      return
    }

    if (event.type == "begin" && this.deactivator) {
      this.inFinish = false
      window.requestAnimationFrame(()=>{
        this.checkBackgroundVisibility()
      })
      
      return
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
