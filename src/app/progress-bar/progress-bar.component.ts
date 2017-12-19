import { Component, OnInit } from '@angular/core';
import { AppService } from "../app.service";
@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {

  constructor(public appService: AppService) { }

  hide: boolean = false
  loading: boolean = false
  progress: number = 0
  private timer: any
  ngOnInit() {
    this.appService.loadingChange.subscribe(loading=>{
      this.loading = loading
      /*
      if(this.timer && !loading) {
        clearTimeout(this.timer)
        this.timer = null
        return
      }
      if(loading) {
        this.timer = setTimeout(()=>{
          this.loading = loading
          clearTimeout(this.timer)
          this.timer = null
          
        }, 200)
      }
      else {
        this.hide = true
        setTimeout(()=>{
          this.loading = false
        }, 300)
      }
      */
    })
    this.appService.loadingProgressChange.subscribe(progress=>{
      this.progress = progress
    })
  }

}
