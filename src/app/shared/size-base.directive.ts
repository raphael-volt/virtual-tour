import {
  Directive, ElementRef,
  AfterViewChecked, OnDestroy, AfterViewInit, AfterContentInit,
  OnChanges, SimpleChanges
} from '@angular/core';
import { ResizeService } from "./resize.service";
import { Rect } from "./math/rect";
import { Bounds } from "./util/css.util";
import { Subscription } from "./model";
@Directive({
  selector: '[appSizeBase]'
})
export class SizeBaseDirective implements AfterViewChecked, OnDestroy {

  private resizeSub: Subscription
  protected _host: HTMLElement
  constructor(
    ref: ElementRef,
    protected service: ResizeService
  ) {
    this._host = ref.nativeElement
    this.resizeSub = this.service.layoutChange.subscribe(layout => {
      this.resizeHandler(service, layout, service.windowRect)
    })
  }

  protected resizeHandler(service: ResizeService, layout: Rect, winRect: Rect) {

  }

  private _prevBounds: Bounds
  ngAfterViewChecked() {
    if (!this._prevBounds) {
      this._prevBounds = new Bounds(this._host)
    } else {
      let currentBounds = new Bounds(this._host)
      if (!this._prevBounds.equals(currentBounds)) {
        this._prevBounds = currentBounds
      }
      else return
    }
    this.service.invalidateSize()
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe()
  }

}
