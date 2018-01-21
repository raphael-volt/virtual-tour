import { TestBed, inject, async } from '@angular/core/testing';

import { MainSvgService } from './main-svg.service';
import { ConfigService } from "../shared/config.service"
const ConfigMoke = {
  touchEnable: false
}

let divE: HTMLDivElement

describe('MainSvgService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MainSvgService,
          deps: [],
          useFactory:
            () => {
              return new MainSvgService(ConfigMoke as ConfigService)
            }
        }
      ]
    });
  });

  it('should be created', inject([MainSvgService], (service: MainSvgService) => {
    expect(service).toBeTruthy();
  }));
  it('should create svg parent', () => {
    let doc = document || window.document
    expect(doc).toBeTruthy()
    expect((doc instanceof Document)).toBeTruthy()
    divE = doc.createElement("div")
    divE = doc.body.appendChild(divE)
    expect(divE.parentNode).toBeTruthy()
  })
});
