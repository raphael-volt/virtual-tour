import { Injectable } from '@angular/core';
import {
  IAppartement, Config, Building,
  Carousel, TurnAround, TurnAroundFrame,
  ConfigLayout,
  Subscription
} from "./model";
import { Observable, Observer, Subject } from "rxjs";
import 'rxjs/add/operator/map'
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

  constructor(
    private http: Http
  ) {
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

  private loadingConfigObservers: Observer<Config>[]
  private loadingConfig: boolean = false
  getConfig(): Observable<Config> {
    if (this._config)
      return Observable.of<Config>(this._config)
    if(! this.loadingConfig){
      this.loadingConfig = true
      this.loadingConfigObservers = []
      return this.http.get(join("config.json")).map(request => {
        this._config = request.json()
        // this._config.layout = this._config.layouts[0].layout
        this.loadingConfig = false
        for(let o of this.loadingConfigObservers) {
          o.next(this._config)
          o.complete()
        }
        this.loadingConfigObservers = null
        return this._config
      })

    }
    else {
      return Observable.create(o=>{
        this.loadingConfigObservers.push(o)
      })
    }
  }

  getCarousel(): Observable<Carousel> {
    return this.getConfig().map(config => config.carousel)
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
