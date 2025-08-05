import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicQoutesComponent } from './topic-qoutes.component';

describe('TopicQoutesComponent', () => {
  let component: TopicQoutesComponent;
  let fixture: ComponentFixture<TopicQoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicQoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicQoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
