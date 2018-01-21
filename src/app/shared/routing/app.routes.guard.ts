import { Component, Injectable } from "@angular/core";
import {
    CanDeactivate,
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from "@angular/router";
import { Observable, Observer } from "rxjs";
import { DeactivableComponent } from "../deactivable.component";
import { AppService } from "../../app.service";
@Injectable()
export class AppRoutesGuard implements CanDeactivate<DeactivableComponent>, CanActivate {

    constructor(private appService: AppService) { }

    canDeactivate(
        component: DeactivableComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean> {
        return component.deactivate()
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.appService.mainBackgroundLoaded)
            return true
        return this.appService.mainBackgroundLoadedChange.asObservable()
    }
}