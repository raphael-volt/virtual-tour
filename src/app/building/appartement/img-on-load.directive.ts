import { Directive, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, HostListener } from '@angular/core';

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
      this._loadFlag = false
      this.loadChanged.emit(this.img)
    }
  }
  @Input()
  imgOnLoad: string

  private img: HTMLImageElement
  constructor(ref: ElementRef) {
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
