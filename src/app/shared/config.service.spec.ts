import { TestBed, inject, async } from '@angular/core/testing';
import { Config, Carousel, TurnAround, Building, Subscription } from "./model";
import { ConfigService } from './config.service';
import {
  HttpModule, Http,
  BaseRequestOptions, XHRBackend, BrowserXhr
} from "@angular/http";
describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BaseRequestOptions,
        XHRBackend,
        {
          provide: Http,
          deps: [XHRBackend, BaseRequestOptions],
          useFactory:
            (backend: XHRBackend, defaultOptions: BaseRequestOptions) => {
              return new Http(backend, defaultOptions)
            }
        },
        {
          provide: ConfigService,
          deps: [Http],
          useFactory:
            (http: Http) => {
              return new ConfigService(http)
            }
        }
      ],
      imports: [
        HttpModule
      ]
    });
  });

  it('should be created', inject([ConfigService], (service: ConfigService) => {
    expect(service).toBeTruthy()
  }))

  it('should get config', async(
    inject([ConfigService], (service: ConfigService) => {
      let sub: Subscription = service.getConfig().subscribe(config => {
        expect(sub).not.toBeUndefined
        expect(sub.closed).toBeFalsy
        expect(config).not.toBeUndefined
        expect(config.buildings).not.toBeUndefined
        sub.unsubscribe()
        expect(sub.closed).toBeTruthy
      })
    }))
  )

  it('should get TurnAround', async(
    inject([ConfigService], (service: ConfigService) => {
      let sub: Subscription = service.getTurnAroundFrames().subscribe(turnAround => {
        expect(sub).not.toBeUndefined
        expect(sub.closed).toBeFalsy
        expect(turnAround).not.toBeUndefined
        expect(turnAround.frames).not.toBeUndefined
        sub.unsubscribe()
        expect(sub.closed).toBeTruthy
      })
    }))
  )


  it('testing subscription states using get Carousel, Buildings, TurnAround', async(
    inject([ConfigService], (service: ConfigService) => {
      let sub: Subscription = service.getCarousel().subscribe(turnAround => {
        expect(sub).not.toBeUndefined
        expect(sub.closed).toBeFalsy
        sub.unsubscribe()
        expect(sub.closed).toBeTruthy
        sub = undefined
        sub = service.getBuildings().subscribe(buildings => {
          expect(sub).toBeUndefined
          sub = service.getBuildingByPath(buildings[0].path)
            .subscribe(building => {
              expect(sub).toBeUndefined
              expect(building).toEqual(buildings[0])
            })
          expect(sub).not.toBeUndefined
          expect(sub.closed).toBeFalsy
          sub.unsubscribe()
          expect(sub.closed).toBeTruthy
        })
        expect(sub).not.toBeUndefined
        expect(sub.closed).toBeFalsy
        sub.unsubscribe()
        expect(sub.closed).toBeTruthy
        sub = undefined
        sub = service.getTurnAroundFrames().subscribe(ta=>{
          expect(sub).not.toBeUndefined
          expect(sub.closed).toBeFalsy
          sub.unsubscribe()
          expect(sub.closed).toBeTruthy
        })
        expect(sub).not.toBeUndefined
        expect(sub.closed).toBeFalsy
      })
    }))
  )




});