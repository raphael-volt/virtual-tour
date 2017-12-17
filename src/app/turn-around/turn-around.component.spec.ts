import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnAroundComponent } from './turn-around.component';

describe('TurnAroundComponent', () => {
  let component: TurnAroundComponent;
  let fixture: ComponentFixture<TurnAroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnAroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnAroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
