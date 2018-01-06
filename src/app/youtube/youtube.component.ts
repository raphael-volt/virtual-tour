import { Component } from '@angular/core';
import { ConfigComponent } from "../shared/config.component";
import { Config } from "../shared/model";
@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.css']
})
export class YoutubeComponent extends ConfigComponent {

  youtubeUrl: string
  protected setConfig(config: Config) {
    super.setConfig(config)
    this.youtubeUrl = config.projectVideo
    this.setDeactivable(true)
  }
}
