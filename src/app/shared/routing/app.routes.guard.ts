import { Component, Injectable } from "@angular/core";
import {
    CanDeactivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from "@angular/router";
import { Observable, Observer } from "rxjs";
import { DeactivableComponent } from "../deactivable.component";

@Injectable()
export class AppRoutesGuard implements CanDeactivate<DeactivableComponent>  {

    constructor() { }
    
    canDeactivate(
        component: DeactivableComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean> {
        return component.deactivate()
    }

}