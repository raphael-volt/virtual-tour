import { Component, OnInit } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, IAppartement } from "../shared/model";
@Component({
  selector: 'test-appartement',
  templateUrl: './test-appartement.component.html',
  styleUrls: ['./test-appartement.component.css']
})
export class TestAppartementComponent extends ConfigComponent{

  private items: IAppartement[]
  asBtn = true
  selectedAppartement
  private count: number = 0

  protected setConfig(config: Config) {
    super.setConfig(config)
    let items: IAppartement[] = []
    let urls: string[] = []
    for (const b of config.buildings) {
      for (let a of b.items) {
        if (urls.indexOf(a.image) < 0) {
          urls.push(a.image)
          items.push(a)
        }
      }
    }
    this.items = items
    this.select()
  }
  select() {
    this.selectedAppartement = this.items[this.count++]
    if (this.count >= this.items.length)
      this.count = 0
    this.asBtn = false
  }

  closed() {
    this.asBtn = true
  }
}
