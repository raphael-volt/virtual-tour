import { Injectable, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";

@Injectable()
export class AppService {

  hasHomeChange: EventEmitter<boolean> = new EventEmitter<boolean>()
  hasHome: boolean = false
  hasNavBarChange: EventEmitter<boolean> = new EventEmitter<boolean>()
  hasNavBar: boolean = true

  constructor(public router: Router) {
    this.router.events.subscribe(this.routeChangeHandler)

  }

  private routeChangeHandler = (event: any | NavigationEnd) => {
    if (event instanceof NavigationEnd) {
      this.hasHome = event.url.replace("/", '') != ''
      this.hasNavBar = !this.hasHome
      this.hasHomeChange.emit(this.hasHome)
      this.hasNavBarChange.emit(this.hasNavBar)
    }
  }

}
