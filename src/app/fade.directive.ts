import {
  Directive, Input, Output, EventEmitter, ElementRef,
  OnChanges, SimpleChanges
} from '@angular/core';
import { Tween, Ease, TweenEvent, Sine } from "./shared/tween/ease";
import { parseCSSSize } from "./shared/util/css.util";
const DEFAULT_DURATION: number = 10
@Directive({
  selector: '[appFade]'
})
export class FadeDirective implements OnChanges {

  @Input()
  fadeDuration: any = DEFAULT_DURATION
  private _fadeDuration: number = DEFAULT_DURATION

  @Input()
  visible: any = true
  private _visible: boolean = true
  
  private _displayProp: string

  private tween: Tween = new Tween(new Ease(0, 1, DEFAULT_DURATION, Sine.in))
  private host: HTMLElement
  constructor(ref: ElementRef) {
    this.host = ref.nativeElement
    let s = this.host.style
    this._displayProp = s.display
    this.tween.change.subscribe((event: TweenEvent)=>{
      if(event.type == "start") {
        s.display = this._displayProp
      }
      else {
        if(event.type == "change") {
          s.opacity = String(event.currentValue)
        }
        else {
          if(event.type == "end") {
            if(! this._visible)
              s.display = "none"
          }
        }
      }
    })
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.fadeDuration) {
      let d: number = this.fadeDuration
      if (isNaN(d)) {
        d = DEFAULT_DURATION
      }
      if (this._fadeDuration != d) {
        this._fadeDuration = d
        this.tween.ease.duration = d
      }
    }
    if (changes.visible) {
      let s = this.host.style
      let tw = this.tween
      let v: boolean = false
      if (changes.visible.currentValue === true || changes.visible.currentValue === false) {
        v = changes.visible.currentValue
      }
      this._visible = v
      if (changes.visible.firstChange) {
        s.opacity = "0"
        if (!v) {
          s.display = "none"
          return
        }
      }
      if (v) {
        if (tw.running) {
          if (tw.playStatus == "toEnd")
            return
          tw.toogle()
        }
        else
          tw.start()
      }
      else {
        if (tw.running) {
          if (tw.playStatus == "toStart")
            return
          tw.toogle()
        }
        else
          tw.rewind()
      }
    }
  }
}
