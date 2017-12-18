import { Component } from '@angular/core';
import { Observable, Observer } from "rxjs";
@Component({
  selector: 'app-deactivable',
  template: '<span><span>',
  styleUrls: []
})
export class DeactivableComponent {

  deactivate(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      console.log(this.constructor.name + " will deactivate in 1000ms")
      setTimeout(() => {
        console.log(this.constructor.name + " deactivated")
        observer.next(true)
        observer.complete()
      }, 1000);
    })
  }

}
