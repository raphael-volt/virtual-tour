import { Directive, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, HostListener } from '@angular/core';
import { AppService } from "../../app.service";
@Directive({
  selector: '[imgOnLoad]'
})
export class ImgOnLoadDirective implements OnChanges {

  private _loadFlag: boolean = false
  @Output()
  loadChanged: EventEmitter<HTMLImageElement> = new EventEmitter<HTMLImageElement>()

  @HostListener('load')
  imgLoadHandler() {
    if(this._loadFlag) {
      this.appService.loading = false
      this._loadFlag = false
      this.loadChanged.emit(this.img)
    }
  }
  @HostListener('progress', ["$event"])
  imgProgressHandler(event: ProgressEvent) {
    this.appService.loadingProgress = event.loaded / event.total
  }
  @Input()
  imgOnLoad: string

  private img: HTMLImageElement
  constructor(ref: ElementRef, private appService: AppService) {
    this.img = ref.nativeElement
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.imgOnLoad) {
      const url: string = changes.imgOnLoad.currentValue
      if(typeof url == "string") {
        this._loadFlag = true
        const img = this.img
        const tick = () => {
          if(img.complete && this._loadFlag) {
            return this.imgLoadHandler()
          }
          window.requestAnimationFrame(tick)
        }
        this.img.setAttribute("src", url)
        window.requestAnimationFrame(tick)
      }
    }
  }
}
