import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, TurnAround, Subscription, TurnAroundFrame } from "../shared/model";
import { ImgLoaderService } from "./img-loader.service";
import { AppService } from "../app.service";
import { ConfigService } from "../shared/config.service";
import { Observable, Observer } from "rxjs";
import { TurnAroundDirective } from "./turn-around.directive";
import { TurnaroundFramesService } from "../shared/turnaround-frames.service";
@Component({
  selector: 'app-turn-around',
  templateUrl: './turn-around.component.html',
  styleUrls: ['./turn-around.component.css']
})
export class TurnAroundComponent extends ConfigComponent implements OnDestroy {

  private turnAroundFrames: TurnAroundFrame[]
  constructor(
    private tafService: TurnaroundFramesService,
    private loader: ImgLoaderService,
    configService: ConfigService,
    appService: AppService) {
    super(configService, appService)
  }
  imageList: HTMLImageElement[]

  @ViewChild(TurnAroundDirective) turnAroundDirective: TurnAroundDirective

  showAnim: boolean = true
  turnAroundRef: ElementRef
  canTurn: boolean = false
  animFps: number = 24

  deactivate(): Observable<boolean> {
    return Observable.create((o: Observer<boolean>) => {
      if (this.loaderSub) {
        this.loaderSub.unsubscribe()
        let sub: Subscription = this.loader.cancel().subscribe(val => {
          if (sub)
            sub.unsubscribe()
          this.setDeactivable(false)
          o.next(true)
          o.complete()
        })
        if (sub.closed)
          sub.unsubscribe()
      }
      else {
        this.setDeactivable(false)
        this.turnAroundDirective.close().subscribe(closed => {
          // turn back
          o.next(true)
          o.complete()
        })
      }
    })
  }
  activeChangeHandler(active) {
    this.setDeactivable(true)
    this.canTurn = active
  }
  private loaderSub: Subscription
  private configLayoutSub: Subscription

  private framesChangeHandler = (frames: TurnAroundFrame[]) => {
    this.setDeactivable(true)
    this.turnAroundFrames = frames
    this.loaderSub = this.loader.load(frames)
      .subscribe(imgs => {
        if (this.loaderSub) {
          this.loaderSub.unsubscribe()
          this.loaderSub = null
        }
        this.setDeactivable(false)
        this.imageList = imgs
      })
    if (this.loaderSub.closed) {
      this.loaderSub.unsubscribe()
      this.loaderSub = null
    }
  }

  protected setConfig(config: Config) {
    super.setConfig(config)
    this.animFps = config.turnAround.animFramerate
    this.configLayoutSub = this.tafService.framesChange
      .subscribe(this.framesChangeHandler)
    if(this.tafService.frames)
      this.framesChangeHandler(this.tafService.frames)
  }

  ngOnDestroy() {
    this.configLayoutSub.unsubscribe()
  }

}
