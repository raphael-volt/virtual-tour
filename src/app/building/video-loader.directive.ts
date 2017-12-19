import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Loader, LoaderEvent } from "../shared/loader";
export class VideoEvent {
  constructor(
    public type?: "start" | "progress" | "complete" | "begin" | "finish",
    public loaded?: number) {
  }
}

@Directive({
  selector: '[videoLoader]'
})
export class VideoLoaderDirective implements OnChanges {

  @Input()
  videoLoader
  @Output()
  change: EventEmitter<VideoEvent> = new EventEmitter<VideoEvent>()
  private video: HTMLVideoElement
  constructor(ref: ElementRef, private loader: Loader) {
    this.video = ref.nativeElement
    this.video.setAttribute('preload', 'none')
    this.video.setAttribute('width', '100%')
    this.video.setAttribute('height', '100%')
    this.video.removeAttribute('autoplay')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.videoLoader) {
      this.checkUrl()
    }
  }
  private checkUrl() {
    let str: string = this.videoLoader
    if (str && str.length)
      this.initLoad()
  }

  private initLoad() {
    // this.video.src = this.videoLoader
    let sub = this.loader.load(this.videoLoader)
      .subscribe(event => {
        let e: VideoEvent = new VideoEvent()
        switch (event.type) {
          case "start":
          case "progress":
            e.type = event.type
            e.loaded = event.progress
            break
          case "dataUrl":
            this.video.src = event.urlData
            event.urlData = null
            this.video.load()
            return
          default:
            return
        }
        this.change.emit(e)
      },
      error => {
        console.log('Error', error)
        sub.unsubscribe()
      },
      () => {
        sub.unsubscribe()
      })
  }

  @HostListener('canplaythrough')
  canplayHandler(event: Event) {
    const ve: VideoEvent = new VideoEvent("begin", 1)
    this.change.emit(ve)
    this.video.play()
    this.video.addEventListener("loadedmetadata", ()=>{

    })
  }

  @HostListener('ended', ["$event"])
  endedHandler(event: Event) {
    if (this.checkUrl)
      this.change.emit(new VideoEvent("finish", 1))
  }

}
