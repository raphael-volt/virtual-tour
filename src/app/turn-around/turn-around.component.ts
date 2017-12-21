import { Component, ViewChild, ElementRef } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, TurnAround, Subscription, TurnAroundFrame } from "../shared/model";
import { ImgLoaderService } from "./img-loader.service";
import { AppService } from "../app.service";
import { ConfigService } from "../shared/config.service";
import { Observable, Observer } from "rxjs";
import { TurnAroundDirective } from "./turn-around.directive";
@Component({
  selector: 'app-turn-around',
  templateUrl: './turn-around.component.html',
  styleUrls: ['./turn-around.component.css']
})
export class TurnAroundComponent extends ConfigComponent {

  private turnAroundFrames: TurnAroundFrame[]
  constructor(
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
  protected setConfig(config: Config) {
    super.setConfig(config)
    this.animFps = config.turnAround.animFramerate
    let sub: Subscription = this.configService.getTurnAroundFrames()
      .subscribe(frames => {
        this.setDeactivable(true)
        this.turnAroundFrames = frames
        
        if (sub) {
          sub.unsubscribe()
          sub = null
        }
        this.loaderSub = this.loader.load(frames)
          .subscribe(imgs => {
            if (sub)
              sub.unsubscribe()
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
      })
  }
}
