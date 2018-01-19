import { Directive, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { VideoEvent, VideoEventType } from "../shared/events/video-event";
import { AppService } from "../app.service";
@Directive({
  selector: '[videoLoader]'
})
export class VideoLoaderDirective implements OnChanges, OnDestroy {

  @Input()
  videoLoader
  @Output()
  change: EventEmitter<VideoEvent> = new EventEmitter<VideoEvent>()
  private video: HTMLVideoElement
  constructor(
    ref: ElementRef,
    private appService: AppService) {
    const video: HTMLVideoElement = ref.nativeElement
    video.setAttribute('width', '100%')
    video.setAttribute('height', '100%')
    video.setAttribute("preload", "auto")
    video.removeAttribute("autoplay")
    this.video = video
    this.handle(true)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.videoLoader) {
      this.checkUrl()
    }
  }

  ngOnDestroy() {
    this.handle(false)
  }

  private checkUrl() {
    let str: string = this.videoLoader
    if (str && str.length)
      this.src = this.videoLoader
  }

  unhandle() {
    this.handle(false)
  }

  private handle(active) {
    const video = this.video
    const f: Function = active ? video.addEventListener : video.removeEventListener
    f.apply(video, ["canplaythrough", this.canplaythroughHandler, false])
    f.apply(video, ["progress", this.progressHandler, false])
    f.apply(video, ["playing", this.playingHandler, false])
    f.apply(video, ["ended", this.enededHandler, false])
  }

  private _src: string;
  private get src(): string {
    return this._src;
  }

  private progressTimer
  private playing

  private set src(v: string) {
    this._src = v;
    this.playing = false
    this.canplaythroughFlag = false
    this.appService.loading = true
    this.notify("start")
    this.video.load()
    this.appService.loadingProgress = 0
  }

  private enededHandler = () => {
    this.notify("finish")
  }

  private playingHandler = (event: Event) => {
    // this.appService.loadingProgress = 0
    this.notify("begin")
  }
  
  private canplaythroughFlag: boolean = false
  private canplaythroughHandler = (event?: MediaStreamEvent) => {
    this.appService.loading = false
    this.playing = true
    this.canplaythroughFlag = true
    this.video.play()
    return false
  }

  private get loaded(): number {
    if(this.playing)
      return 1
    const video = this.video
    const t: number = this.duration
    if (!video.buffered || !video.buffered.length || isNaN(t)) {
      return 0
    }
    let l: number = 0
    const n: number = video.buffered.length
    for (let i = 0; i < n; i++) {
      l += (video.buffered.end(i) - video.buffered.start(i))
    }
    return l
  }

  private get duration(): number {
    const d: number = this.video.duration
    if (d == undefined || isNaN(d))
      return 0
    return d
  }

  private progressHandler = (event?: Event) => {
    if (this.canplaythroughFlag || this.playing)
      return false
    let e = this.notify("progress", this.loaded, this.duration)
    this.appService.loadingProgress = e.ratio
    if (e.ratio == 1)
      this.canplaythroughHandler()
    return false
  }

  private notify(type: VideoEventType, loaded?: number, total?: number): VideoEvent {
    let event = new VideoEvent(type, loaded, total)
    this.change.emit(event)
    return event
  }
}
