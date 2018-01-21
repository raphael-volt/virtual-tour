import { Injectable, EventEmitter } from '@angular/core';
import { environment } from "../environments/environment";
const ASSETS: string = "assets"
import { ResizeService } from "./shared/resize.service";
import { DefinitionName, ConfigLayout } from "./shared/model";
@Injectable()
export class MediaUrlService {

  definitionChange: EventEmitter<DefinitionName> = new EventEmitter<DefinitionName>()
  private _definition: DefinitionName = undefined
  private urlBase: string

  constructor(service: ResizeService) {
    this.urlBase = "" // environment.production  ? "" : "http://localhost:4201/"
    service.definitionChange.subscribe((definition: DefinitionName) => {
      this._definition = definition
      this.definitionChange.emit(definition)
    })
    if (service.configLayout)
      this._definition = service.configLayout.name
  }

  get definition(): DefinitionName {
    return this._definition
  }

  getUrl(url: string) {
    return this.urlBase + url
  }

  getAsset(url: string) {
    if (this.definition == undefined)
      throw new Error("Definition is not defined")
    return this.getUrl(`${ASSETS}/${this._definition}/${url}`)
  }
}

export { ASSETS }