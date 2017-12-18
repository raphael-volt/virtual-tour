import { Component, OnInit } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config, TurnAround } from "../shared/model";
@Component({
  selector: 'app-turn-around',
  templateUrl: './turn-around.component.html',
  styleUrls: ['./turn-around.component.css']
})
export class TurnAroundComponent extends ConfigComponent implements OnInit {

  protected setConfig(config:Config) {
    
  }
}
