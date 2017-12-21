import { Injectable } from '@angular/core';
import { IAppartement, Config, Building, Carousel, TurnAround, TurnAroundFrame, Subscription } from "./model";
import { Observable, Observer } from "rxjs";
import { Http } from "@angular/http";

const ASSETS: string = "assets"
const join = (...args: string[]): string => {
  return [ASSETS].concat(args).join("/")
}
export { join }
@Injectable()
export class ConfigService {

  private _config: Config
  private _turnAround: TurnAround

  private _touchEnable: boolean
  get touchEnable(): boolean {
    return this._touchEnable
  }

  constructor(private http: Http) {
    this._touchEnable = Boolean('ontouchstart' in window || navigator.msMaxTouchPoints)
  }

  get turnAround(): TurnAround {
    return this._turnAround
  }

  get config(): Config {
    return this._config
  }

  get hasConfig(): boolean {
    return this._config != undefined
  }

  get hasTurnAround(): boolean {
    return this._turnAround != undefined
  }

  getConfig(): Observable<Config> {
    if (this._config)
      return Observable.of<Config>(this._config)
    return this.http.get(join("config.json")).map(request => {
      this._config = request.json()
      return this._config
    })
  }

  getCarousel(): Observable<Carousel> {
    return this.getConfig().map(config => config.carousel)
  }
  private _turnAroundFramesFlag: boolean = false
  getTurnAroundFrames(): Observable<TurnAroundFrame[]> {
    if (this._turnAroundFramesFlag)
      return Observable.of<TurnAroundFrame[]>(this._turnAround.frames)
    return Observable.create((observer: Observer<TurnAroundFrame[]>) => {
      let sub: Subscription
      let getTa = (config: Config) => {
        this._turnAround = config.turnAround
        return this.http.get(join(config.turnAround.path, "frames.json")).map(request => {
          this._turnAround.frames = request.json().frames
          this._turnAround.frames = this._turnAround.frames.map(f=>{
            f.src = join(config.turnAround.path, f.src)
            return f
          })
          return this._turnAround
        }).subscribe(turnAround => {
          this._turnAround = turnAround
          observer.next(turnAround.frames)
          observer.complete()
          sub.unsubscribe()
        })
      }
      if (this._config)
        sub = getTa(this._config)
      else
        sub = this.getConfig().subscribe(config => {
          sub.unsubscribe()
          sub = getTa(config)
        })
    })
  }

  getBuildings(): Observable<Building[]> {
    return this.getConfig().map(config => config.buildings)
  }

  getBuildingByIndex(index: number): Observable<Building> {
    return this.getBuildings().map(buildings => buildings[index])
  }

  getBuildingByPath(path: string): Observable<Building> {
    return this.getBuildings().map(buildings => {
      return this.findBuildingByPath(path)
    })
  }

  findBuildingByPath(path: string): Building {
    if (!this.hasConfig)
      throw new Error('Config is not defined.')
    let result: Building
    for (result of this.config.buildings) {
      if (result.path == path)
        break
      result = null
    }
    return result
  }


}
