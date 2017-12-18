import { Directive, ElementRef } from '@angular/core';
import { ConfigService } from "./shared/config.service";
import { Router, NavigationStart } from "@angular/router";
import { Config, Subscription } from "./shared/model";
import { ResizeService } from "./shared/resize.service";
@Directive({
  selector: '[appTitle]'
})
export class AppTitleDirective {

  private projectName: string = null
  private buildingName: string = null
  private host: HTMLElement
  private currentUrl: string = null
  constructor(
    hostRef: ElementRef,
    private router: Router,
    private service: ConfigService,
    resizeService: ResizeService) {

    this.host = hostRef.nativeElement
    resizeService.titleElement = this.host
    const handleRouter = () => {
      this.currentUrl = router.url
      this.projectName = service.config.name
      router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.currentUrl = event.url
          this.validateTitle()
        }
      })
      this.validateTitle()
    }
    if (!service.hasConfig) {
      let sub = service.getConfig().subscribe(config => {
        sub.unsubscribe()
        handleRouter()
      })
    }
    else {
      handleRouter()
    }
  }

  findBuildingPathInUrl(): string {
    const url: string = this.currentUrl
    const re: RegExp = /batiments\/([\w|-]+)/
    if (re.test(url))
      return re.exec(url)[1]
    return null
  }

  private validateTitle() {
    const path: string = this.findBuildingPathInUrl()
    if (path) {
      let b = this.service.findBuildingByPath(path)
      this.buildingName = b ? b.name : null
    }
    else
      this.buildingName = null
    let title: string[] = [this.projectName]
    if (this.buildingName)
      title.push(this.buildingName)

    this.host.innerHTML = title.join(" / ")
  }

}
