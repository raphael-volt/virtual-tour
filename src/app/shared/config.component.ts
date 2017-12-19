import { Component, OnInit } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { DeactivableComponent } from "./deactivable.component";
import { IAppartement, Config, Building, Carousel, TurnAround, Subscription } from "./model";
import { ConfigService } from "./config.service";
import { AppService } from "../app.service";

@Component({
    selector: 'app-config',
    template: '<span><span>',
    styleUrls: []
})
export class ConfigComponent extends DeactivableComponent implements OnInit {

    constructor(
        protected configService: ConfigService,
        appService: AppService) {
        super(appService)
    }

    protected config: Config
    protected setConfig(config: Config) { }
    
    ngOnInit() {
        if (this.configService.hasConfig) {
            this.config = this.configService.config
            this.setConfig(this.config)
        }
        else {
            let sub: Subscription = this.configService.getConfig()
                .subscribe(config => {
                    this.config = config
                    sub.unsubscribe()
                    this.setConfig(config)
                })
        }

    }
}
