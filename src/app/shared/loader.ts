import { Injectable, EventEmitter } from '@angular/core';
import { AppService } from "../app.service";
import {
    HttpClient, HttpRequest, HttpHeaders, HttpEvent, HttpEventType,
    HttpProgressEvent
} from "@angular/common/http";

import { Observer, Observable } from "rxjs";
import { Subscription, TurnAroundFrame } from "./model";
export class LoaderEvent {
    constructor(
        public type?: "start" | "progress" | "end" | "dataUrl",
        public progress?: number,
        public blob?: Blob,
        public urlData?: string,
        public prevented: boolean = false
    ) { }
}

const isString = (x: any): x is string => {
    return typeof x === "string";
}
const isTurnAroundFrame = (o: Object): o is TurnAroundFrame => {
    return (o && o.hasOwnProperty("src") && o.hasOwnProperty("size"))
}

const isTurnAroundFrameArray = (x: any[]): x is TurnAroundFrame[] => {
    let _is = true
    for (let o of x) {
        if (!isTurnAroundFrame(o)) {
            _is = false
            break
        }
    }
    return _is;
}
const isStringArray = (x: any[]): x is string[] => {
    let _is = true
    for (let s of x) {
        if (!isString(s)) {
            _is = false
            break
        }
    }
    return _is;
}


@Injectable()
export class Loader {

    constructor(
        private httpClient: HttpClient,
        private appService: AppService) { }

    private listMap: {
        [id: string]: HTMLImageElement[]
    } = {}
    loadList(urls: string[] | TurnAroundFrame[], id?: string): Observable<HTMLImageElement[]> {
        return Observable.create((observer: Observer<HTMLImageElement[]>) => {
            if (id && this.listMap[id]) {
                observer.next(this.listMap[id])
                return observer.complete()
            }
            let frames: TurnAroundFrame[]
            if (isStringArray(urls)) {
                frames = urls.map(s => {
                    return {
                        src: s,
                        size: NaN
                    }
                })
            }
            else {
                if (isTurnAroundFrameArray(urls)) {
                    frames = urls
                }
            }
            if (!frames)
                return observer.error("Invalide urls")
            this.initLoadList(observer, frames, id)
        })
    }

    private cancelChange: EventEmitter<void> = new EventEmitter<void>()
    private cancelObserver: Observer<void>
    cancel(): Observable<void> {
        return Observable.create((o: Observer<void>) => {
            this.cancelObserver = o
            this.cancelChange.emit()
        })

    }
    private initLoadList(observer: Observer<HTMLImageElement[]>, frames: TurnAroundFrame[], id: string) {
        const appService = this.appService
        let result: HTMLImageElement[] = []
        let sub: Subscription
        let canceled: boolean = false
        let cancelSub: Subscription = this.cancelChange.subscribe(() => {
            canceled = true
        })
        const resolve = (err?) => {
            cancelSub.unsubscribe()
            appService.loading = false
            if (err) {
                this.appService.loading = false
                if (sub && !sub.closed)
                    sub.unsubscribe()

                return observer.error(err)
            }
            if (result && id)
                this.listMap[id] = result
            observer.next(result)
            observer.complete()
        }
        let numFrames: number = frames.length
        let total: number = 0
        let f: TurnAroundFrame
        let checkProgress: boolean = true
        for (f of frames) {
            if (isNaN(f.size)) {
                for (f of frames)
                    f.size = 1
                checkProgress = false
                total = NaN
                break
            }
            total += f.size
        }
        let progress: number = 0
        if (isNaN(total)) {
            total = numFrames
        }
        let index: number = 0
        let img: HTMLImageElement
        const loadHandler = (e: Event) => {
            img.removeEventListener("loaded", loadHandler)
            result.push(img)
            progress += frames[index].size
            index++
            next()
        }
        appService.loading = true
        const next = () => {    
            if (canceled) {
                this.cancelObserver.next(null)
                this.cancelObserver.complete()
                this.cancelObserver = null
                result = null
                return resolve()
            }
            if (index < numFrames) {
                sub = this.load(frames[index].src, checkProgress)
                    .subscribe(event => {
                        event.prevented = true
                        if (event.type == "progress") {
                            const p: number = progress + f.size * event.progress
                            appService.loadingProgress = p / total
                        }
                        else {
                            if (event.type == "dataUrl") {
                                sub.unsubscribe()
                                img = new Image()
                                img.addEventListener("load", loadHandler)
                                img.src = event.urlData
                            }
                        }
                    },
                    resolve,
                    () => {

                    })
            }
            else {
                resolve()
            }
        }
        next()
    }
    load(url, checkProgress: boolean = true): Observable<LoaderEvent> {
        return Observable.create((observer: Observer<LoaderEvent>) => {
            const appService = this.appService
            let event: LoaderEvent
            // appService.loading = true
            let sub: Subscription = this.getBlob(url, checkProgress)
                .subscribe(
                e => {
                    observer.next(e)
                    if (!e.prevented)
                        appService.loadingProgress = e.progress
                    if (e.type == "end")
                        event = e
                },
                error => {
                    this.appService.loading = false
                    observer.error(error)
                    sub.unsubscribe()
                },
                () => {
                    sub.unsubscribe()
                    sub = this.getUrlData(event).subscribe(
                        (e) => { },
                        observer.error,
                        () => {
                            observer.next(event)
                            if (!event.prevented)
                                this.appService.loading = false
                            observer.complete()
                            sub.unsubscribe()
                        })
                })
        })
    }
    private getBlob(url: string, checkProgress: boolean): Observable<LoaderEvent> {
        return Observable.create((obs: Observer<LoaderEvent>) => {
            let req: HttpRequest<any> = new HttpRequest(
                "GET",
                url,
                {
                    headers: new HttpHeaders({ 'Content-Type': 'video/mp4' }),
                    reportProgress: checkProgress,
                    responseType: "blob",
                }
            )
            this.httpClient.request(req).subscribe((event: HttpEvent<any>) => {
                const loaderEvent: LoaderEvent = new LoaderEvent()
                switch (event.type) {
                    case HttpEventType.DownloadProgress:
                        loaderEvent.type = "progress"
                        loaderEvent.progress = event.loaded / event.total
                        break;
                    case HttpEventType.Response:
                        loaderEvent.type = "end"
                        loaderEvent.blob = event.body
                        loaderEvent.progress = 1
                        break;
                    case HttpEventType.Sent:
                        loaderEvent.progress = 0
                        loaderEvent.type = "start"
                        break;
                    default:
                        return;
                }
                obs.next(loaderEvent)
                if (loaderEvent.type == "end")
                    obs.complete()
            })
        })
    }

    private getUrlData(event: LoaderEvent): Observable<LoaderEvent> {
        return Observable.create((observer: Observer<LoaderEvent>) => {
            let reader = new FileReader()

            reader.addEventListener("load", () => {
                event.type = "dataUrl"
                event.urlData = reader.result
                event.blob = null
                observer.next(event)
                observer.complete()
            })
            reader.addEventListener("error", (error: ErrorEvent) => observer.error(error))
            reader.readAsDataURL(event.blob)
        })
    }
}