import { Component, OnInit } from '@angular/core';
import { DeactivableComponent } from "../shared/deactivable.component";
@Component({
  selector: 'app-buildings',
  templateUrl: './buildings.component.html',
  styleUrls: ['./buildings.component.css']
})
export class BuildingsComponent extends DeactivableComponent implements OnInit {

  constructor() { 
    super()
  }

  ngOnInit() {
  }

}
