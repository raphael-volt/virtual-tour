import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[widthRatio]'
})
export class WidthRatioDirective implements OnChanges{

  @Input()
  widthRatio: number = 0

  private target: HTMLElement
  constructor(ref: ElementRef) {
    this.target = ref.nativeElement
   }

   ngOnChanges(changes: SimpleChanges) {
    if(changes.widthRatio) {
      let n: number = Number(this.widthRatio)
      if(isNaN(n))
        return
      if(n < 0)
        n = 0
      if(n > 1)
        n = 1
      this.target.style.width = Math.round(n * 100) + "%"
    }
   }

}
