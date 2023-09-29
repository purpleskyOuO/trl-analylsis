import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrlAnalysisComponent } from './trl-analysis.component';

describe('TrlAnalysisComponent', () => {
  let component: TrlAnalysisComponent;
  let fixture: ComponentFixture<TrlAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrlAnalysisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrlAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
