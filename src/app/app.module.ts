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
import { Loader } from "./shared/loader";
import { ImgLoaderService } from "./turn-around/img-loader.service";
import { AppComponent } from './app.component';
import { TurnaroundFramesService } from "./shared/turnaround-frames.service";
// components & directives
import { SizeBaseDirective } from './shared/size-base.directive';
import { AppTitleDirective } from './app-title.directive';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ResizeDirective } from './shared/resize.directive';
import { VAlignDirective } from './shared/v-align.directive';
import { WidthRatioDirective } from './width-ratio.directive';
import { TurnAroundDirective } from './turn-around/turn-around.directive';
import { AppartIconDirective } from "./appart-icon.directive";
import { VideoLoaderDirective } from './building/video-loader.directive';

import { DeactivableComponent } from "./shared/deactivable.component";
import { ConfigComponent } from "./shared/config.component";
import { BuildingComponent } from './building/building.component';
import { BuildingSelectorComponent } from './building-selector/building-selector.component';
import { CarouselComponent } from './carousel/carousel.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { TurnAroundComponent } from './turn-around/turn-around.component';

import { SafePipe } from './youtube/safe.pipe';
import { FadeDirective } from './fade.directive';

@NgModule({
  declarations: [
    AppComponent,
    TurnAroundDirective,
    WidthRatioDirective,
    AppTitleDirective,
    ResizeDirective,
    SafePipe,
    VAlignDirective,
    SizeBaseDirective,
    VideoLoaderDirective,
    AppartIconDirective,
    DeactivableComponent,
    ConfigComponent,
    BuildingComponent,
    BuildingSelectorComponent,
    CarouselComponent,
    YoutubeComponent,
    TurnAroundComponent,
    ProgressBarComponent,
    FadeDirective
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
    ResizeService,
    Loader,
    ImgLoaderService,
    TurnaroundFramesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
