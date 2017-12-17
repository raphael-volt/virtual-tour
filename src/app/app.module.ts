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
import { AppComponent } from './app.component';
import { BuildingsComponent } from './buildings/buildings.component';
import { BuildingSelectorComponent } from './building-selector/building-selector.component';
import { CarouselComponent } from './carousel/carousel.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { TurnAroundComponent } from './turn-around/turn-around.component';
@NgModule({
  declarations: [
    AppComponent,
    BuildingsComponent,
    BuildingSelectorComponent,
    CarouselComponent,
    YoutubeComponent,
    TurnAroundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
