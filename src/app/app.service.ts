import { Injectable, EventEmitter } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from "@angular/router";

@Injectable()
export class AppService {
  
  hasNavBarChange: EventEmitter<boolean> = new EventEmitter<boolean>()
  hasHomeChange: EventEmitter<boolean> = new EventEmitter<boolean>()
  loadingProgressChange: EventEmitter<number> = new EventEmitter<number>()
  loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>()

  private _hasHome: boolean = false;
  public get hasHome(): boolean {
    return this._hasHome;
  }
  public set hasHome(v: boolean) {
    if (v == this._hasHome) return
    this._hasHome = v;
    this.hasHomeChange.emit(v)
  }


  private _hasNavBar: boolean = true;
  public get hasNavBar(): boolean {
    return this._hasNavBar;
  }
  public set hasNavBar(v: boolean) {
    if (v == this._hasNavBar) return
    this._hasNavBar = v;
    this.hasNavBarChange.emit(v)
  }

  constructor(public router: Router) {
    this.router.events.subscribe(this.routeChangeHandler)
  }

  private routeChangeHandler = (event: any | NavigationEnd) => {
    if (event instanceof NavigationEnd) {
      this.hasNavBar = event.url.replace("/", '') == ''
    }
  }

  

  private _loadingProgress : number=0;
  public get loadingProgress() : number {
    return this._loadingProgress;
  }
  public set loadingProgress(v : number) {
    if(! this._loading)
      this.loading = true
    this._loadingProgress = v;
    this.loadingProgressChange.emit(v)
  }


  private _loading : boolean=false;
  public get loading() : boolean {
    return this._loading;
  }
  public set loading(v : boolean) {
    if((v !== true && v !== false) || v == this._loading)
      return
    // console.log("LOADING", v)
    this._loading = v;
    this.loadingChange.emit(v)
  }

  showTurnAroundAnimation: boolean = true  
  
}
