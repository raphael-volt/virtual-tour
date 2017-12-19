import { Component, ViewChild, ElementRef } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, TurnAround, Subscription } from "../shared/model";
import { Loader } from "../shared/loader";
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

  private turnAround: TurnAround
  constructor(
    private loader: Loader,
    configService: ConfigService,
    appService: AppService) {
    super(configService, appService)
  }
  imageList: HTMLImageElement[]

  @ViewChild(TurnAroundDirective) turnAroundDirective: TurnAroundDirective
  
  showAnim: boolean = true
  turnAroundRef: ElementRef
  deactivate(): Observable<boolean> {
    return Observable.create((o: Observer<boolean>) =>{
      this.setDeactivable(false)
      if(this.loaderSub) {
        this.loaderSub.unsubscribe()
        let sub: Subscription = this.loader.cancel().subscribe(val=>{
          if(sub)
            sub.unsubscribe()
          o.next(true)
          o.complete()
        })
        if(sub.closed)
          sub.unsubscribe()
      }
      else {
        this.turnAroundDirective.close().subscribe(closed=>{
          // turn back
          o.next(true)
          o.complete()
        })
      }
    })

  }

  private loaderSub: Subscription
  protected setConfig(config: Config) {
    super.setConfig(config)
    let sub: Subscription = this.configService.getTurnAround()
      .subscribe(turnAroud => {
        this.turnAround = turnAroud
        if(sub) {
          sub.unsubscribe()
          sub = null
        }
        this.loaderSub = this.loader.loadList(turnAroud.frames, "turnAround")
        .subscribe(imgs => {
          if(sub)
            sub.unsubscribe()
          if(this.loaderSub){
            this.loaderSub.unsubscribe()
            this.loaderSub = null
          }
          this.imageList = imgs
        })
        if(this.loaderSub.closed) {
          this.loaderSub.unsubscribe()
          this.loaderSub = null
        }
      })
    
  }

  ngOnInit() {
    super.ngOnInit()
    this.setDeactivable(true)
  }
}
