import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardFormDialogComponent } from './board-form-dialog.component';

describe('BoardFormDialogComponent', () => {
  let component: BoardFormDialogComponent;
  let fixture: ComponentFixture<BoardFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
