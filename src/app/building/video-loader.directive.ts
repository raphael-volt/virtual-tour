import { Directive, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { VideoEvent, VideoEventType } from "../shared/events/video-event";
import { AppService } from "../app.service";
import { LoaderService, LoaderEvent } from "../loader.service";
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
    private appService: AppService,
    private ldrService: LoaderService) {
    const video: HTMLVideoElement = ref.nativeElement
    video.setAttribute("preload", "auto")
    video.removeAttribute("autoplay")
    this.video = video
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.videoLoader) {
      this.checkUrl()
    }
  }

  ngOnDestroy() {

  }

  private checkUrl() {
    let str: string = this.videoLoader
    if (str && str.length)
      this.src = this.videoLoader
  }

  private _src: string;
  private get src(): string {
    return this._src;
  }

  private progressTimer
  private playing

  private set src(v: string) {
    this.playing = false
    this.notify("start")
    this.video.addEventListener('playing', this.playingHandler)
    this.video.addEventListener('ended', this.enededHandler)
    this._src = v;
    let sub = this.ldrService.loadVideo(this.video, v).subscribe(
      (e: LoaderEvent) => { 
        this.appService.loadingProgress = e.loaded / e.total
      },
      e => { },
      () => {
        this.appService.loading = false
        sub.unsubscribe()
      })
  }

  private enededHandler = () => {
    this.video.removeEventListener('playing', this.playingHandler)
    this.video.removeEventListener('ended', this.enededHandler)
    this.notify("finish")
  }

  private playingHandler = (event: Event) => {
    this.notify("begin")
  }

  private notify(type: VideoEventType, loaded?: number, total?: number): VideoEvent {
    let event = new VideoEvent(type, loaded, total)
    this.change.emit(event)
    return event
  }
}
