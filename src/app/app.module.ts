import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
