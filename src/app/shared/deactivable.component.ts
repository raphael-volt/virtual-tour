import { Component } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { AppService } from "../app.service";
@Component({
  selector: 'app-deactivable',
  template: '<span><span>',
  styleUrls: []
})
export class DeactivableComponent {

  constructor(protected appService: AppService) {

  }

  setDeactivable(value: boolean) {
    this.appService.hasHome = value
  }

  deactivate(): Observable<boolean> {
    this.setDeactivable(false)
    return Observable.of(true)
  }

}
