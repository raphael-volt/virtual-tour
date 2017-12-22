import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ConfigService } from "./shared/config.service";
import { Layout, Subscription } from "./shared/model";
@Directive({
  selector: '[aptIcon]'
})
export class AppartIconDirective implements OnChanges {
  constructor(private ref: ElementRef, configService: ConfigService) { 
    if(configService.hasConfig)
      this.layout = configService.config.layout
    else {
      let sub: Subscription = configService.getConfig()
      .subscribe(config=>{
        this.layout = config.layout
      })
    }
  }
  private layout: Layout
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
      style.left = Math.round(s * this.aptIcon.position[0] * this.layout.width - b.width / 2) + "px"
      style.top = Math.round(s * this.aptIcon.position[1] * this.layout.height - b.height / 2) + "px"
    }
  }
}
