import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from "@angular/http";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import { AppRoutesModule } from "./shared/routing/app.routes.module";

// services
import { ConfigService } from "./shared/config.service";
import { AppService } from "./app.service";
import { ResizeService } from "./shared/resize.service";

// components & directives
import { AppComponent } from './app.component';
import { BuildingComponent } from './building/building.component';
import { BuildingSelectorComponent } from './building-selector/building-selector.component';
import { CarouselComponent } from './carousel/carousel.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { TurnAroundComponent } from './turn-around/turn-around.component';
import { AppTitleDirective } from './app-title.directive';
import { ResizeDirective } from './shared/resize.directive';
import { SafePipe } from './youtube/safe.pipe';
import { VAlignDirective } from './shared/v-align.directive';
import { SizeBaseDirective } from './shared/size-base.directive';

@NgModule({
  declarations: [
    AppComponent,
    BuildingComponent,
    BuildingSelectorComponent,
    CarouselComponent,
    YoutubeComponent,
    TurnAroundComponent,
    AppTitleDirective,
    ResizeDirective,
    SafePipe,
    VAlignDirective,
    SizeBaseDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutesModule
  ],
  providers: [
    ConfigService,
    AppService,
    ResizeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
