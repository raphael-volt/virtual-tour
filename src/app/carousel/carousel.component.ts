import { Component, OnInit } from '@angular/core';
import { DeactivableComponent } from "../shared/deactivable.component";
@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent extends DeactivableComponent implements OnInit {

  constructor() { 
    super()
  }

  ngOnInit() {
  }

}
