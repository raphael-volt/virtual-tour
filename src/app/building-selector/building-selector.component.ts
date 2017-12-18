import { Component } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, Building } from "../shared/model";
@Component({
  selector: 'app-building-selector',
  templateUrl: './building-selector.component.html',
  styleUrls: ['./building-selector.component.css']
})
export class BuildingSelectorComponent extends ConfigComponent {

  setConfig(config: Config) {
    this.buildings = config.buildings
  }

  private buildings: Building[]

}
