import { Injectable } from '@angular/core';
import { Appartement, Config, Building, Carousel, TurnAround, Subscription } from "./model";
import { Observable, Observer } from "rxjs";
import { Http } from "@angular/http";

const ASSETS: string = "assets/"
@Injectable()
export class ConfigService {

  private _config: Config
  private _turnAround: TurnAround

  constructor(private http: Http) { }

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
    return this.http.get(ASSETS + "config.json").map(request => {
      this._config = request.json()
      return this._config
    })
  }

  getCarousel(): Observable<Carousel> {
    return this.getConfig().map(config => config.carousel)
  }

  getTurnAround(): Observable<TurnAround> {
    if (this._turnAround)
      return Observable.of<TurnAround>(this._turnAround)
    return Observable.create((observer: Observer<TurnAround>) => {
      let sub: Subscription
      let getTa = (config: Config) => {
        return this.http.get(ASSETS + config.turnAround.path + "/frames.json").map(request => {
          this._turnAround = request.json()
          return this._turnAround
        }).subscribe(turnAround => {
          observer.next(turnAround)
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

  findBuildingByPath(path:string): Building {
    if(! this.hasConfig)
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
