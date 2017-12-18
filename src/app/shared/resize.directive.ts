import { SizeBaseDirective } from "./size-base.directive";
import { Directive } from '@angular/core';
import { ResizeService } from "./resize.service";
import { Rect } from "./math/rect";
import { px } from "./util/css.util";
@Directive({
  selector: '[appResize]'
})
export class ResizeDirective extends SizeBaseDirective {

  protected resizeHandler(service: ResizeService, layout: Rect, winRect: Rect) {
    this.updateSize(layout.width, layout.height)
  }

  private updateSize(w: number, h: number) {
    let e = this._host
    e.style.width = px(w)
    e.style.height = px(h)
  }
}
