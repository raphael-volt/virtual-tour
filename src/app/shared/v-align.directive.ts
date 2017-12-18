import { SizeBaseDirective } from "./size-base.directive";
import { Directive } from '@angular/core';
import { ResizeService } from "./resize.service";
import { Rect } from "./math/rect"; import { px, Bounds } from "./util/css.util";

@Directive({
  selector: '[vAlign]'
})
export class VAlignDirective extends SizeBaseDirective {
  
  protected resizeHandler(service: ResizeService, layout: Rect, winRect: Rect) {
    this.updatePosition(winRect)
  }
  
  private updatePosition(winRect: Rect) {
    let e = this._host
    let bounds = new Rect(e.offsetLeft, e.offsetTop, e.offsetWidth, e.offsetHeight)
    let cssBounds = new Bounds(e)

    let r: Rect = new Rect(0, 0, bounds.width, bounds.height)
    r = winRect.letterBox(r, 1)
    e.style.left = px(r.x)
    e.style.top = px(r.y)
  }
}
