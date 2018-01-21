import { TestBed, inject, async } from '@angular/core/testing';

import { LoaderService, LoaderEvent } from './loader.service';
import { HttpModule, Http, BaseRequestOptions, XHRBackend } from "@angular/http";
import { ConfigService } from "./shared/config.service";
import { Config, Building } from "./shared/model";
import { join } from "path";
let config: Config
let building: Building
let vid: HTMLVideoElement
let img: HTMLImageElement

describe('LoaderService', () => {
  var originalTimeout;
  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });
  afterAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        XHRBackend,
        {
          provide: Http,
          deps: [XHRBackend, BaseRequestOptions],
          useFactory: (backend: XHRBackend, options: BaseRequestOptions) => {
            return new Http(backend, options)
          }
        },

        {
          provide: ConfigService,
          deps: [Http],
          useFactory: (http: Http) => {
            return new ConfigService(http)
          }
        },

        LoaderService
      ],
      imports: [
        HttpModule
      ]
    });
  });

  it('should be created', inject([LoaderService], (service: LoaderService) => {
    expect(service).toBeTruthy();
  }));

  it('should get config', async(inject([ConfigService], (service: ConfigService) => {
    service.getConfig().subscribe(conf => {
      config = conf
      expect(config).toBeTruthy()
      building = config.buildings[0]
    })
  })));

  it('should create elements', () => {
    vid = document.createElement('video')
    vid.setAttribute("preload", "auto")
    vid.removeAttribute("autoplay")

    img = document.createElement('img')
    let div = document.createElement('div')
    div.appendChild(vid)
    div.appendChild(img)
    document.body.appendChild(div)
  })
  it('should handle image progress', async(inject([LoaderService], (service: LoaderService) => {
    let loaded = 0
    let total = 0
    service.change.subscribe(e => {
      console.log("service progress ->", e.loaded, e.total)
    }, error => {
      throw error
    },
      () => {
        console.log("service done")
        expect(true).toBeTruthy()
      })
    service.loadImg(img, join("assets", config.layouts[0].name, building.path, building.image))
      .subscribe(e => {
        loaded = e.loaded
        total = e.total
        console.log("img progress ->", loaded, total)
      },
      error => {
        throw error
      },
      () => {
        console.log("img done ->", loaded, total)
        expect(loaded).toEqual(total)
      })

  })))


  /*
  it('should start loaders', async(inject([LoaderService], (service: LoaderService) => {
    const states: boolean[] = [false, false, false]
    service.change.subscribe((event: LoaderEvent) => {
      expect(event.target).toEqual(service)
      console.log("service.change", event.loaded , event.total)
      if (!states[0]) {
        expect(states[1]).toBeFalsy()
        expect(states[2]).toBeFalsy()
        states[0] = true
        expect(event.loaded).toBeGreaterThan(0)
      }

      if (!states[1]) {
        expect(states[0]).toBeTruthy()
        expect(states[2]).toBeFalsy()
        states[1] = true
        return
      }
      if (status[1] && event.loaded == event.total) {
        states[2] = true
        expect(states[0]).toBeTruthy()
        expect(states[1]).toBeTruthy()
      }
    })

    let checkLoaded = () => {
      if(loaded[0] && loaded[1]) {
        setTimeout(() => {
          expect(status[0]).toBeTruthy()
          expect(status[1]).toBeTruthy()
          expect(status[2]).toBeTruthy()
        }, 10);
      }
    }

    let loaded: boolean[] = [false, false]

    service.loadImg(img, join("assets", config.layouts[0].name, building.path, building.image))
      .subscribe(e => {

      },
      error => {
        throw error
      }, checkLoaded)
    service.loadVideo(vid, join("assets", config.layouts[0].name, building.path, 'in.' + config.layouts[0].video.formats[0]))
      .subscribe(e => {

      },
      error => {
        throw error
      }, checkLoaded)
    for (let f of config.layouts[0].video.formats) {
      let t: string = f
      switch (f) {
        case "ogv":
          t = "ogg"
          break;
      }
      let src = vid.appendChild(document.createElement('source'))
      src.setAttribute('src', join("assets", config.layouts[0].name, building.path, 'in.' + f))
      src.setAttribute("type", join("video", t))
    }
  })))
  */
})
