import { Injectable } from '@angular/core';
import { AppService } from "./app.service";
type LoaderData = [Element, number, number]

@Injectable()
export class GlobalLoaderService {

  constructor(private service: AppService) { }

  private loaders: LoaderData[] = []
  add(target: Element) {
    if(! this.loaders.length) {
      this.service.loadingProgress = 0
      this.service.loading = true
    }
    this.loaders.push(this.handle(target))
    this.calculateTotal()
    this.calculateTotal()
  }

  private unhandle(data: LoaderData, splice: boolean=false) {
    data[0].removeEventListener("load", this.completeHandler)
    data[0].removeEventListener("progress", this.progressHandler)
    data[0].removeEventListener("error", this.errorHandler)
    if(splice) 
      this.remove(data)
  }

  private remove(data: LoaderData) {
    this.loaders.splice(this.loaders.indexOf(data), 1)
  }

  private handle(target: Element): LoaderData {
    target.addEventListener("load", this.completeHandler)
    target.addEventListener("progress", this.progressHandler)
    target.addEventListener("error", this.errorHandler)
    return [target, NaN, 0]
  }

  private total: number = 0
  private loaded: number = 0
  private calculateProgress() {
    let t: number = 0
    let complete: boolean = true
    for(const d of this.loaders) {
      if(isNaN(d[1])) {
        complete = false
        continue
      }
      t += d[2] / d[1]
      if(complete  && d[2] != d[1])
        complete = false
    }
    this.loaded = t
    this.service.loadingProgress = t / this.total
    if(complete) {
      this.service.loading = false
      this.total = 0
      this.loaded = 0
      this.loaders = []
    }
  }
  private calculateTotal() {
    this.total = this.loaders.length
  }
  
  private errorHandler = (event: Event) => {
    this.unhandle(this.getData(event.currentTarget as Element), true)
    this.calculateTotal()
    this.calculateProgress()
  }

  private progressHandler = (event: ProgressEvent) => {
    const d: LoaderData = this.getData(event.currentTarget as Element)
    if (isNaN(d[1])) 
      d[1] = event.total
    
    d[2] = event.loaded
    this.calculateProgress()
  }

  private completeHandler = (event: Event) => {
    const d: LoaderData = this.getData(event.currentTarget as Element)
    d[2] = d[1]
    this.unhandle(d)
    this.calculateProgress()
  }

  private getData(target: Element): LoaderData {
    for (const d of this.loaders)
      if (d[0] == target)
        return d
    return null
  }

}
