import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { <%= classify(name) %> Dialog } from './<%= dasherize(name) %>.component';

describe('<%= classify(name) %>Dialog', () => {
  let component: <%= classify(name) %> Dialog;
  let fixture: ComponentFixture<<%= classify(name) %> Dialog >;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [<%= classify(name) %> Dialog]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(<%= classify(name) %> Dialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
