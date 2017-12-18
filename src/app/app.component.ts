import { Component, AfterViewInit } from '@angular/core';
import { AppService } from "./app.service";
import { ResizeService } from "./shared/resize.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Les Ballons';
  constructor(
    private appService: AppService,
    private resizeService: ResizeService) {
      resizeService.padding = 10
  }
  homeClick() {
    console.log("homeClick")
    this.appService.router.navigate(["/"])
  }

  hasHome: boolean = false
  hasNavBar: boolean = true

  private _initializedFlag: boolean
  ngAfterViewInit() {
    this._initializedFlag = true
    this.hasHome = this.appService.hasHome
    this.hasNavBar = this.appService.hasNavBar
    this.appService.hasHomeChange.subscribe(home => this.hasHome = home)
    this.appService.hasNavBarChange.subscribe(navBar => this.hasNavBar = navBar)
    this.resizeService.invalidateSize()
  }
}
