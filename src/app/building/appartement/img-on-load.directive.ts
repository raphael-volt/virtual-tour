import {
  Directive, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ElementRef
} from '@angular/core';
import { AppService } from "../../app.service";
import { LoaderEvent, LoaderService } from "../../loader.service";
@Directive({
  selector: '[imgOnLoad]'
})
export class ImgOnLoadDirective implements OnChanges {

  private _loadFlag: boolean = false
  @Output()
  loadChanged: EventEmitter<HTMLImageElement> = new EventEmitter<HTMLImageElement>()

  @Input()
  imgOnLoad: string

  private img: HTMLImageElement
  constructor(
    ref: ElementRef,
    private appService: AppService,
    private loader: LoaderService) {

    this.img = ref.nativeElement
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.imgOnLoad) {
      const url: string = changes.imgOnLoad.currentValue
      if (typeof url == "string") {
        this._loadFlag = true
        const img = this.img
        this.loader.loadImg(this.img, url)
          .subscribe(
          (event: LoaderEvent) => {
            this.appService.loadingProgress = event.loaded / event.total
          },
          err => { },
          () => {
            this.appService.loading = false
            this._loadFlag = false
            this.loadChanged.emit(img)
          })
      }
    }
  }
}
