import { Component, OnInit } from '@angular/core';
import { DeactivableComponent } from "../shared/deactivable.component";

@Component({
  selector: 'app-turn-around',
  templateUrl: './turn-around.component.html',
  styleUrls: ['./turn-around.component.css']
})
export class TurnAroundComponent extends DeactivableComponent implements OnInit {

  constructor() { 
    super()
  }

  ngOnInit() {
  }

}
