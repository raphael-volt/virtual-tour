import { Injectable, EventEmitter } from '@angular/core';
import { ConfigService } from "./config.service";
import { Config, Layout } from "./model";
import { Rect } from "./math/rect";
import { Bounds } from "./util/css.util";

@Injectable()
export class ResizeService {


  private _padding: number;
  public get padding(): number {
    return this._padding;
  }
  public set padding(v: number) {
    this._padding = v;
    this.invalidateSize()
  }

  private _titleElement: HTMLElement;
  public get titleElement(): HTMLElement {
    return this._titleElement;
  }
  public set titleElement(v: HTMLElement) {
    this._titleElement = v;
    this.invalidateSize()
  }
  private invalidateSizeFlag: any = false
  invalidateSize = (event?) => {
    if(! this._configRect) {
      if(this.invalidateSizeFlag === false)
        this.invalidateSizeFlag = true
      return
    }
    if(this.invalidateSizeFlag === false)
      this.invalidateSizeFlag = window.requestAnimationFrame(() => {
        this.validateSize(window.innerWidth, window.innerHeight)
        this.invalidateSizeFlag = false
      })
  }

  get layoutRect(): Rect {
    if (!this._layoutRect)
      return null
    return this._layoutRect.clone
  }
  
  get windowRect(): Rect {
    if (!this._windowRect)
      return null
    return this._windowRect.clone
  }

  get configRect(): Rect {
    if (!this._configRect)
      return null
    return this._configRect.clone
  }


  private _layoutRect: Rect
  private _configRect: Rect
  private _windowRect: Rect
  layoutChange: EventEmitter<Rect> = new EventEmitter<Rect>()
  constructor(configService: ConfigService) {
    
    this._windowRect = new Rect(0, 0, window.innerWidth, window.innerHeight)
    let handle = () => {
      window.addEventListener("resize", this.resizeHandler)
      if(this.invalidateSizeFlag) {
        this.resizeHandler()
        this.invalidateSizeFlag = false
      }
      /*
      let checkBody = () => {
        if(document && document.body) {
          window.addEventListener("resize", this.resizeHandler)
          window.addEventListener("load", this.resizeHandler)
          window.addEventListener("change", this.resizeHandler)
        }
        else {
          window.requestAnimationFrame(checkBody)
        }
      }
      checkBody()
      */
    }
    
    
    let initRect = (layout: Layout) => {
      this._configRect = new Rect(0, 0, layout.width, layout.height)
      this._layoutRect = this._configRect.clone
    }
    
    if (configService.hasConfig) {
      initRect(configService.config.layout)
      handle()
    }
    
    else {
      let sub = configService.getConfig().subscribe(config => {
        initRect(config.layout)
        sub.unsubscribe()
        handle()
      })
    }
  }

  private resizeHandler = (event?: Event) => {
    this.validateSize(window.innerWidth, window.innerHeight)
  }
  
  private validateSize(ww: number, wh: number) {
    const wr = this._windowRect
    const p: number = this._padding || 0
    wr.setSize(ww - p * 2, wh - p * 2)
    wr.setPosition(p, p)
    let lr: Rect = wr.letterBox(this._configRect.clone)
    let bounds = this.titleElement ? new Bounds(this.titleElement) : null
    if (bounds) {
      if(bounds.totalHeight + lr.height > wr.height) {
        const s: number = (wr.height - bounds.totalHeight) / lr.height
        lr.scale(s, s)
        lr.y = bounds.totalHeight
        lr.x = (wr.width - lr.width) / 2
      }
    }
    else
      lr = wr.letterBox(this._configRect, 1)
    this._layoutRect = lr

    this.layoutChange.emit(this._layoutRect.clone)
  }
}