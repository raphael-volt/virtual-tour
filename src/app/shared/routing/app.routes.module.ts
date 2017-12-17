import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { BuildingsComponent } from "../../buildings/buildings.component";
import { CarouselComponent } from "../../carousel/carousel.component";
import { TurnAroundComponent } from "../../turn-around/turn-around.component";
import { YoutubeComponent } from "../../youtube/youtube.component";
import { AppRoutesGuard } from "./app.routes.guard";
const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "batiments/:id",
        component: BuildingsComponent,
        canDeactivate: [AppRoutesGuard]
      },
      
      {
        path: "video",
        component: YoutubeComponent
      },
      
      {
        path: "images",
        component: CarouselComponent,
        canDeactivate: [AppRoutesGuard]
      },

      {
        path: "360",
        component: TurnAroundComponent,
        canDeactivate: [AppRoutesGuard]
      }

    ]
  }
]

@NgModule({
    imports: [
      RouterModule.forRoot(routes)
    ],
    exports: [
      RouterModule
    ],
    providers: [
      AppRoutesGuard
    ]
  })
  export class AppRoutesModule { }