import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { BuildingComponent } from "../../building/building.component";
import { CarouselComponent } from "../../carousel/carousel.component";
import { TurnAroundComponent } from "../../turn-around/turn-around.component";
import { YoutubeComponent } from "../../youtube/youtube.component";
import { AppRoutesGuard } from "./app.routes.guard";
import { TestAppartementComponent } from '../../test-appartement/test-appartement.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "batiments/:id",
        component: BuildingComponent,
        canDeactivate: [AppRoutesGuard],
        canActivate: [AppRoutesGuard]
      },
      {
        path: "video",
        component: YoutubeComponent,
        canDeactivate: [AppRoutesGuard],
        canActivate: [AppRoutesGuard]
      },
      {
        path: "images",
        component: CarouselComponent,
        canDeactivate: [AppRoutesGuard],
        canActivate: [AppRoutesGuard]
      },
      {
        path: "360",
        component: TurnAroundComponent,
        canDeactivate: [AppRoutesGuard],
        canActivate: [AppRoutesGuard]
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