import { Injectable, EventEmitter } from '@angular/core';
import { ResizeService } from "./resize.service";
import { ConfigService, join } from "./config.service";
import { Http } from "@angular/http";
import { Config, ConfigLayout, TurnAroundFrame, Subscription } from "./model";
import { Observable, Observer } from "rxjs";
@Injectable()
export class TurnaroundFramesService {

  constructor(
    private http: Http,
    private resizeService: ResizeService,
    private configService: ConfigService
  ) {
    resizeService.configLayoutChange.subscribe(this.changeHandler)
    if (resizeService.configLayout)
      this.changeHandler(resizeService.configLayout)
  }

  private changeHandler = (layout: ConfigLayout) => {
    let s: Subscription = this.configService.getConfig().subscribe(config => {

      let done = (err?) => {
        s.unsubscribe()
        s2.unsubscribe()
      }

      let s2: Subscription = this.http.get(join(layout.name, config.turnAround.path, "frames.json"))
        .map(request => {
          let frames: TurnAroundFrame[] = request.json().frames
          return frames.map(f => {
            f.src = join(layout.name, config.turnAround.path, f.src)
            return f
          })
        })
        .subscribe(frames => {
          this._frames = frames
          this.framesChange.next(frames)
        }, done, done)
    })
  }

  framesChange: EventEmitter<TurnAroundFrame[]> = new EventEmitter<TurnAroundFrame[]>()


  private _frames: TurnAroundFrame[];
  public get frames(): TurnAroundFrame[] {
    return this._frames;
  }
}

