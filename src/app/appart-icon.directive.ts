import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[aptIcon]'
})
export class AppartIconDirective implements OnChanges {
  constructor(private ref: ElementRef) { }
  @Input()
  aptIcon: {
    name: string
    position: [number, number]
  }

  @Input()
  scaleFactor: number

  ngOnChanges(changes: SimpleChanges) {
    let update: boolean = false
    if (
      (changes.aptIcon && changes.aptIcon.currentValue)
      || changes.scaleFactor) {
      update = true
    }
    if (update) {
      const s: number = Number.isFinite(this.scaleFactor) ? this.scaleFactor : 1
      const e = <HTMLElement>this.ref.nativeElement
      const b = e.getBoundingClientRect()
      const style = e.style
      style.left = Math.round(s * this.aptIcon.position[0] - b.width / 2) + "px"
      style.top = Math.round(s * this.aptIcon.position[1] - b.height / 2) + "px"
    }
  }
}
