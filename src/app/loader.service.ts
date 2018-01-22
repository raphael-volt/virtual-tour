import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Observer } from 'rxjs'

export type LoaderEvent = { target: any, loaded: number, total: number, url: string }
type LoaderEventMapItem = { event: LoaderEvent, observer: Observer<LoaderEvent> }
type LoaderEventMap = { [url: string]: LoaderEventMapItem }
type ImgLoaderData = [XMLHttpRequest, LoaderEventMapItem, boolean]

const nextAndComplet = <T>(observer: Observer<T>, value: T): void => {
  observer.next(value)
  observer.complete()
}
@Injectable()
export class LoaderService {

  private cache: string[] = []
  private queue: LoaderEvent[] = []
  private map: LoaderEventMap = {}
  private imgLoaders: [ImgLoaderData, ImgLoaderData] = [null, null]
  private imgLoadersItems: [LoaderEventMapItem, LoaderEventMapItem] = [null, null]

  public readonly change: EventEmitter<LoaderEvent> = new EventEmitter<LoaderEvent>()

  constructor() { }


  loadVideo(video: HTMLVideoElement, url: string): Observable<LoaderEvent> {
    return this.loadMedia(video, url, NaN)
  }

  loadImg(img: HTMLImageElement, url: string, total: number = NaN): Observable<LoaderEvent> {
    return this.loadMedia(img, url, total)
  }

  private loadMedia(target: HTMLImageElement | HTMLVideoElement, url: string, total: number): Observable<LoaderEvent> {
    const isVideo: boolean = (target instanceof HTMLVideoElement)
    const e: LoaderEvent = this.createEvent(target, url, total)
    if (this.getIsCached(url)) {
      if (!isVideo)
        return this.loadCachedImg(e)
    }
    return Observable.create((observer: Observer<LoaderEvent>) => {
      this.addEvent(this.createEvent(target, url, total), observer)
      if (!this.loading)
        this.nextLoad()
    })
  }

  private getIsCached(url: string) {
    return this.cache.indexOf(url) > -1
  }

  private loadCachedImg(event: LoaderEvent) {
    return Observable.create((observer: Observer<LoaderEvent>) => {
      const img: HTMLImageElement = event.target as HTMLImageElement
      const handler = (e: ProgressEvent) => {
        event.loaded = e.loaded
        event.total = e.total
        img.removeEventListener("load", handler)
        nextAndComplet(observer, event)
      }
      img.addEventListener("load", handler)
      img.src = event.url
    })
  }

  private loadCachedVideo(event: LoaderEvent) {
    return Observable.create((observer: Observer<LoaderEvent>) => {
      const video: HTMLVideoElement = event.target as HTMLVideoElement
      const handler = (e: MediaStreamEvent) => {
        event.loaded = this.getVideoDuration(video)
        event.total = event.loaded
        video.removeEventListener("canplaythrough", handler)
        nextAndComplet(observer, event)
      }
      video.addEventListener("canplaythrough", handler)
      video.load()
      video.play()
    })
  }

  private updateImageProgress(event: ProgressEvent) {
    const i = this.getMapItemFromEvent(event)
    if (!i) // ?
      return
    const img: HTMLImageElement = i.event.target
    if (isNaN(i.event.total))
      i.event.total = event.total
    i.event.loaded = event.total
    i.observer.next(i.event)
  }

  private updateVideoProgress(mapItem: LoaderEventMapItem) {
    const video: HTMLVideoElement = mapItem.event.target
    if (isNaN(mapItem.event.total) || !mapItem.event.total)
      mapItem.event.total = this.getVideoDuration(video)

    const t: number = mapItem.event.total
    mapItem.event.loaded = this.getVideoLoaded(video, t)
    mapItem.observer.next(mapItem.event)
    if (mapItem.event.total && mapItem.event.total == mapItem.event.loaded) {
      this.cache.push(mapItem.event.url)
      mapItem.event.loaded = mapItem.event.total
      mapItem.event.target.play()
      this.loadingVideo = false
      this.nextLoad()
      nextAndComplet(mapItem.observer, mapItem.event)
    }
  }

  private getVideoLoaded(video: HTMLVideoElement, t: number): number {
    if (!video.buffered || !video.buffered.length || t == 0) {
      return 0
    }
    const n: number = video.buffered.length
    let l: number = 0
    for (let i = 0; i < n; i++) {
      l += (video.buffered.end(i) - video.buffered.start(i))
    }
    return l
  }

  private getVideoDuration(video: HTMLVideoElement): number {
    const d: number = video.duration
    if (d == undefined || isNaN(d))
      return 0
    return d
  }

  private createEvent(target: any, url: string, total: number = NaN, loaded: number = 0): LoaderEvent {
    return { loaded: loaded, total: total, target: target, url: url }
  }

  private addEvent(event: LoaderEvent, observer: Observer<LoaderEvent>) {
    this.map[event.url] = { event: event, observer: observer }
    this.queue.push(event)
    this.queue.sort(this._sortQueue)
  }

  private _sortQueue = (a: LoaderEvent, b: LoaderEvent): number => {
    const aI: boolean = (a.target instanceof HTMLImageElement)
    const bI: boolean = (b.target instanceof HTMLImageElement)
    if ((aI && bI) || (!aI && !bI))
      return 0
    if (!aI)
      return -1
    return 1
  }

  private total: number
  private loaded: number
  private loading: boolean = false

  private nextLoad() {
    if (this.loadingVideo)
      return
    let i: any
    let d: ImgLoaderData
    const loaders = this.imgLoaders
    if (!this.queue.length) {
      for (i in loaders) {
        d = loaders[i]
        loaders[i] = null
      }
      this.map = {}
      this.loaded = this.total
      this.notifyOwnChange()
      this.loaded = this.total = NaN
      this.loading = false
      return
    }
    if (!this.loading) {
      this.loading = true
    }
    let canLoad: boolean = false
    for (let j = 0; j < this.queue.length; j++) {
      let event = this.queue[j]
      if (event.target instanceof HTMLVideoElement) {
        this.queue.splice(j, 1)
        this.preloadVideo(event)
        return
      }
      if (event.target instanceof HTMLImageElement) {
        for (i in loaders) {
          if (loaders[i] == null)
            loaders[i] = this.createImgLoaderData()
          d = loaders[i]
          if (!d[2]) {
            d[2] = true
            d[1] = this.map[event.url]
            this.queue.splice(j, 1)
            d[1].observer.next(event)
            const loader: XHRImage = new XHRImage(d[0])
            const sub = loader.loadEvent(event)
              .subscribe(
              e => {
                d[1].observer.next(e)
              },
              err => {
                sub.unsubscribe()
                delete (this.map[event.url])
                d[1].observer.error(event)
                this.calculateProgress()
              },
              () => {
                sub.unsubscribe()
                this.cache.push(event.url)
                d[2] = false
                this.nextLoad()
                nextAndComplet(d[1].observer, event)
              })
            break
          }
        }
        for (i in loaders) {
          if (!loaders[i] || loaders[i][2]) {
            canLoad = true
            break
          }
        }
      }
      if (!canLoad)
        break
    }

  }

  private notifyOwnChange() {
    this.change.emit({ target: this, loaded: this.loaded, total: this.total, url: null })
  }

  private loadingVideo: boolean = false
  private videoMapItem: LoaderEventMapItem
  private preloadVideo(event: LoaderEvent) {
    this.loadingVideo = true
    this.videoMapItem = this.map[event.url]
    const video: HTMLVideoElement = event.target
    // video.addEventListener('progress', this.videoProgress)
    window.requestAnimationFrame(this.videoProgressLoop)
    video.load()

  }

  private videoProgressLoop = () => {
    const i = this.videoMapItem
    if (i) {
      this.updateVideoProgress(i)
      this.calculateProgress()
    }
    if (this.loadingVideo)
      window.requestAnimationFrame(this.videoProgressLoop)
  }

  private createImgLoaderData(): ImgLoaderData {
    const xhr: XMLHttpRequest = new XMLHttpRequest()
    return [xhr, null, false]
  }

  private videoProgress = (event: MediaStreamEvent) => {
    const i = this.getMapItemFromEvent(event)
    if (i) {
      this.updateVideoProgress(i)
      this.calculateProgress()
    }
  }

  private get mapLength(): number {
    let i: number = 0
    for (const url in this.map)
      i++
    return i
  }

  private calculateTotal(): boolean {
    let canMeasure: boolean = false
    let total: number = 0
    for (const url in this.map) {
      const d = this.map[url]
      if (isNaN(d.event.total)) {
        canMeasure = false
        total = this.mapLength
        break
      }
      total += d.event.total
    }
    this.total = total
    return canMeasure
  }

  private calculateProgress() {
    const canMeasure = this.calculateTotal()
    let loaded: number = 0
    let d: LoaderEventMapItem
    const map = this.map
    let url: any
    if (canMeasure) {
      for (url in map) {
        d = map[url]
        loaded += d.event.loaded
      }
    }
    else {
      for (url in map) {
        d = map[url]
        loaded += d.event.loaded / d.event.total
      }
    }
    this.loaded = loaded
    this.notifyOwnChange()
  }

  private getLoaderDataFromEvent(event: Event): ImgLoaderData {
    for (const d of this.imgLoaders)
      if (d[0] == event.currentTarget)
        return d
    return null
  }

  private getImgMapItemFromEvent(event: Event): LoaderEventMapItem {
    const d = this.getLoaderDataFromEvent(event)
    if (d)
      return d[1]
    return null
  }

  private getMapItemFromEvent(event: Event): LoaderEventMapItem {
    const map = this.map
    for (let url in map) {
      if (map[url].event.target == event.target) {
        return map[url]
      }
    }
    return null
  }
}

export class XHRImage {

  constructor(public xhr?: XMLHttpRequest) {

  }
  loadEvent(loaderEvent: LoaderEvent): Observable<LoaderEvent> {
    return Observable.create((o: Observer<LoaderEvent>) => {
      const img: HTMLImageElement = loaderEvent.target
      let xhr: XMLHttpRequest = this.xhr
      if (!xhr) {
        xhr = new XMLHttpRequest()
      }
      const error = err => {
        console.log('XHRImage/loadevent/error')
        console.error(err)
        unhandle()
        o.error(err)
      }

      const progress = (e: ProgressEvent) => {
        if (isNaN(loaderEvent.total))
          loaderEvent.total = e.total
        loaderEvent.loaded = e.loaded
        o.next(loaderEvent)
      }

      const loadend = e => {
        unhandle()
        const fr: FileReader = new FileReader()
        const imgDone = () => {
          img.removeEventListener('load', imgDone)
          loaderEvent.loaded = loaderEvent.total
          o.complete()
        }
        const dataDone = () => {
          fr.removeEventListener('load', dataDone)
          img.addEventListener('load', imgDone)
          img.src = fr.result
        }
        fr.addEventListener('load', dataDone)
        
        fr.readAsDataURL(xhr.response)
      }

      const unhandle = () => {
        xhr.removeEventListener("progress", progress)
        xhr.removeEventListener("loadend", loadend)
        xhr.removeEventListener("error", error)
      }
      xhr.addEventListener("progress", progress)
      xhr.addEventListener("loadend", loadend)
      xhr.addEventListener("error", error)
      xhr.open('get', loaderEvent.url)
      xhr.responseType = "blob"
      xhr.send(null)
    })
  }
  load(img: HTMLImageElement, url: string): Observable<LoaderEvent> {
    return this.loadEvent({
      loaded: 0,
      total: NaN,
      target: img,
      url: url
    })
  }
}