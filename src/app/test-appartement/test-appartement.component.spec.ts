import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAppartementComponent } from './test-appartement.component';

describe('TestAppartementComponent', () => {
  let component: TestAppartementComponent;
  let fixture: ComponentFixture<TestAppartementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAppartementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAppartementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
