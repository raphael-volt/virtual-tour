import { Injectable } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { TurnAround, TurnAroundFrame, Subscription } from "../shared/model";
import { AppService } from "../app.service";
import { LoaderEvent, XHRImage } from "../loader.service";
@Injectable()
export class ImgLoaderService {

  constructor(private appService: AppService) { }

  private loading: boolean = false
  private imgList: HTMLImageElement[]
  private urlList: string[]
  private loaders: XHRImage[]
  private numLoaders: number = 2
  private numLoaded: number
  private numTotal: number
  private currentIndex: number
  private observer: Observer<HTMLImageElement[]>
  private sizeMap: number[]
  private sizeTotal: number
  private frames: TurnAroundFrame[]

  load(frames: TurnAroundFrame[]): Observable<HTMLImageElement[]> {
    return Observable.create((observer: Observer<HTMLImageElement[]>) => {
      this.loading = true
      this.urlList = []
      this.imgList = []
      this.sizeMap = []
      this.numTotal = 0
      this.frames = frames
      this.sizeTotal = 0
      for (let t of frames) {
        this.urlList.push(t.src)
        this.sizeMap.push(0)
        this.imgList.push(null)
        this.sizeTotal += t.size
      }

      this.observer = observer
      this.numTotal = this.urlList.length
      this.numLoaded = 0
      this.currentIndex = 0
      this.loaders = []
      for (let i = 0; i < this.numLoaders; i++) {
        this.loaders.push(null)
      }
      this.nextLoad()
    })
  }

  private cancelObserver: Observer<boolean>

  cancel(): Observable<boolean> {
    if (!this.loading)
      return Observable.of<boolean>(false)

    return Observable.create((observer: Observer<boolean>) => {
      this.cancelObserver = observer
    })
  }

  private notifyComplete() {
    this.observer.next(this.imgList)
    this.observer.complete()
    this.appService.loading = false
    this.loading = false
    this.frames = null
    this.sizeMap = null
    this.urlList = null
    this.observer = null
    this.imgList = null
  }
  private nextLoad() {
    let i: number
    if (this.cancelObserver) {
      let complete = true
      for (i = 0; i < this.numLoaders; i++) {
        if (this.loaders[i] !== null) {
          complete = false
          break
        }
      }
      if (complete) {
        this.imgList = null
        this.notifyComplete()
        this.cancelObserver.next(true)
        this.cancelObserver.complete()
        this.cancelObserver = null
      }
      return
    }
    for (i = 0; i < this.numLoaders; i++) {
      if (this.currentIndex < this.numTotal) {
        if (this.loaders[i] == null) {
          const img = new Image()
          const xhr = new XHRImage()
          this.imgList[this.currentIndex] = img
          this.loaders[i] = xhr
          const sub = this.loaders[i].load(
            img,
            this.urlList[this.currentIndex++]
          ).subscribe(event => {
            let i: number = this.imgList.indexOf(img)
            this.sizeMap[i] = event.loaded
            this.updateProgress()
          },
            err => {

            },
            () => {
              let i: number = this.imgList.indexOf(img)
              this.sizeMap[i] = this.frames[i].size
              i = this.loaders.indexOf(xhr)
              this.loaders[i] = null
              this.numLoaded++
              if (this.numLoaded < this.numTotal) {
                this.updateProgress()
                this.nextLoad()
              }
              else {
                this.notifyComplete()
              }
            }
          )
        }
      }
    }
  }

  private updateProgress() {
    let p: number = 0
    for (let n of this.sizeMap)
      p += n
    this.appService.loadingProgress = p / this.sizeTotal
  }
}
