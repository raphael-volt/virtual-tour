import { Component, OnInit } from '@angular/core';
import { Observable, Observer } from "rxjs";
import { DeactivableComponent } from "./deactivable.component";
import { Appartement, Config, Building, Carousel, TurnAround, Subscription } from "./model";
import { ConfigService } from "./config.service";
@Component({
    selector: 'app-config',
    template: '<span><span>',
    styleUrls: []
})
export class ConfigComponent extends DeactivableComponent implements OnInit {

    constructor(protected configService: ConfigService) {
        super()
    }

    protected setConfig(config: Config) {

    }
    
    ngOnInit() {
        if (this.configService.hasConfig)
            this.setConfig(this.configService.config)
        else {
            let sub: Subscription = this.configService.getConfig()
                .subscribe(config => {
                    sub.unsubscribe()
                    this.setConfig(config)
                })
        }

    }
}
