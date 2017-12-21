import { Injectable, EventEmitter } from '@angular/core';
import { AppService } from "../app.service";
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
        private appService: AppService) { }

    loadDataUrl(url: string, checkProgress: boolean = true): Observable<LoaderEvent> {
        return Observable.create((observer: Observer<LoaderEvent>) => {
            let xhr: XMLHttpRequest = new XMLHttpRequest()
            xhr.open("GET", url, true)
            xhr.responseType = "blob"
            let removeListeners = () => {
                if (checkProgress)
                    xhr.removeEventListener("progress", progress)
                xhr.removeEventListener("load", loadEnd)
                xhr.removeEventListener("loadstart", loadStart)
                xhr.removeEventListener("error", error)
            }
            let error = (err) => {
                removeListeners()
                observer.error(err)
            }
            let loadEndFlag: boolean = false
            let loadEnd = () => {
                console.log("loadEnd", loadEndFlag)
                if (loadEndFlag)
                    return
                loadEndFlag = true
                removeListeners()
                this.readAsDataURL(xhr.response, (data, err) => {
                    if(err)
                        return observer.error(err)
                    this.appService.loading = false
                    observer.next(new LoaderEvent("dataUrl", 1,null, data))
                    observer.complete()
                    
                })
            }
            let progress = (e: ProgressEvent) => {
                if(e.total)
                this.appService.loadingProgress = e.loaded / e.total
                observer.next(new LoaderEvent("progress", this.appService.loadingProgress))
            }
            let loadStart = () => {
                observer.next(new LoaderEvent("start", 0))
            }
            xhr.addEventListener("loadstart", loadStart)
            if (checkProgress)
                xhr.addEventListener("progress", progress)
            xhr.addEventListener("load", loadEnd)
            xhr.addEventListener("error", error)
            xhr.send()
        })

    }

    private readAsDataURL(blob: Blob, callback: (data: string, err?) => void) {

        let reader = new FileReader()
        let removeListeners = () => {
            reader.removeEventListener("load", load)
            reader.removeEventListener("error", error)
        }
        let load = () => {
            removeListeners()
            callback(reader.result)
        }
        let error = (err) => {
            removeListeners()
            callback(null, err)
        }

        reader.addEventListener("load", load)
        reader.addEventListener("error", error)
        reader.readAsDataURL(blob)
    }
}