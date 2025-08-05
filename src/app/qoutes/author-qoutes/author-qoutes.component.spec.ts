import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorQoutesComponent } from './author-qoutes.component';

describe('AuthorQoutesComponent', () => {
  let component: AuthorQoutesComponent;
  let fixture: ComponentFixture<AuthorQoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthorQoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorQoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
