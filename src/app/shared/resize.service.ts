import { Injectable, EventEmitter } from '@angular/core';
import { ConfigService } from "./config.service";
import { Config, Layout, ConfigLayout, DefinitionName } from "./model";
import { Rect } from "./math/rect";
import { Bounds } from "./util/css.util";

@Injectable()
export class ResizeService {

  definitionNameChange: EventEmitter<DefinitionName> = new EventEmitter<DefinitionName>()
  configLayoutChange: EventEmitter<ConfigLayout> = new EventEmitter<ConfigLayout>()

  private _configLayouts: ConfigLayout[]
  private _configLayout: ConfigLayout
  get configLayout(): ConfigLayout {
    return this._configLayout
  }
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
    if (!this._configRect) {
      if (this.invalidateSizeFlag === false)
        this.invalidateSizeFlag = true
      return
    }
    if (this.invalidateSizeFlag === false)
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
  private config: Config
  layoutChange: EventEmitter<Rect> = new EventEmitter<Rect>()
  constructor(private configService: ConfigService) {

    let handle = () => {
      this.config = configService.config
      this._configLayouts = configService.config.layouts
      this._windowRect = new Rect(0, 0, window.innerWidth, window.innerHeight)
      window.addEventListener("resize", this.resizeHandler)
      this.validateSize(this._windowRect.width, this._windowRect.height)
    }
    if (configService.hasConfig) {
      handle()
    }

    else {
      let sub = configService.getConfig().subscribe(config => {
        sub.unsubscribe()
        handle()
      })
    }
  }

  private resizeHandler = (event?: Event) => {
    this.validateSize(window.innerWidth, window.innerHeight)
  }
  private lastSizes: [number, number] = [0, 0]

  definitionChange : EventEmitter<any> = new EventEmitter<any>()

  private findBestLayout(w: number): boolean {
    if (!this._configLayouts || w < 10)
      return false

    let map = this._configLayouts.slice().reverse()
    let layoutConfig: ConfigLayout
    for (let i = 0; i < map.length; i++) {
      // ww 2000 : w:1920
      // ww 1200 : w:1920
      // ww 900 : w:960
      // ww 400 : w:480
      if (w < map[i].layout.width) {
        layoutConfig = map[i]
        break
      }
    }
    if (this._configLayout == layoutConfig)
      return true
    this._configLayout = layoutConfig
    this.definitionChange.emit(layoutConfig.name)
    this.configService.config.layout = layoutConfig.layout
    this._configRect = new Rect(0, 0, layoutConfig.layout.width, layoutConfig.layout.height)
    this.notifyConfigLayoutFlag = true

    return true
  }
  private notifyConfigLayoutFlag: boolean
  private validateSize(ww: number, wh: number) {
    if (!this.findBestLayout(ww))
      return
    this.invalidateSizeFlag = false
    this.lastSizes[0] = ww
    this.lastSizes[1] = wh
    const wr = this._windowRect
    const p: number = this._padding || 0
    wr.setSize(ww - p * 2, wh - p * 2)
    wr.setPosition(p, p)
    let lr: Rect = wr.letterBox(this._configRect.clone, 1)
    let bounds = this.titleElement ? new Bounds(this.titleElement) : null
    if (bounds) {
      if (bounds.totalHeight + lr.height > wr.height) {
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
    if (this.notifyConfigLayoutFlag)
      this.configLayoutChange.emit(this._configLayout)
    this.notifyConfigLayoutFlag = false
  }
}