import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from "./app.service";
import { Building } from "./shared/model";
import { ResizeService } from "./shared/resize.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Les Ballons';
  constructor(
    private router: Router,
    private appService: AppService,
    private resizeService: ResizeService) {
      resizeService.padding = 10
  }

  private loadingChange = (loading: boolean)=> {

  }

  homeClick() {
    this.appService.router.navigate(["/"])
  }
  navigate(path) {
    this.appService.router.navigate([path])
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
  buildingChange(building: Building) {
    this.navigate(`/batiments/` + building.path)
  }
}
