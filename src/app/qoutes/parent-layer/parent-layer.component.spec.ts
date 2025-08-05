import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentLayerComponent } from './parent-layer.component';

describe('ParentLayerComponent', () => {
  let component: ParentLayerComponent;
  let fixture: ComponentFixture<ParentLayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentLayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
