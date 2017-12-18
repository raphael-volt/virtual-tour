import { Component } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, Building, TurnAround, Subscription } from "../shared/model";
import { DeactivableComponent } from "../shared/deactivable.component";
@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.css']
})
export class BuildingComponent extends ConfigComponent {

    private turnAround: TurnAround
    protected setConfig(config: Config) {
      if(this.configService.hasTurnAround)
        this.setTurnAround(this.configService.turnAround)
      else {
        let sub: Subscription = this.configService.getTurnAround()
        .subscribe(turnaround=>{
          sub.unsubscribe()
          this.setTurnAround(turnaround)
        })
      } 
    }

    private setTurnAround(value: TurnAround) {
      this.turnAround = value
      // start loading
    }

}
