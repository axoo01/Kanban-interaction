import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './board-form-dialog.component.html',
  styleUrl: './board-form-dialog.component.scss' 
})
export class BoardFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogService = inject(DialogService);
  private boardService = inject(BoardService);
  private router = inject(Router);

  boardForm!: FormGroup;
  isSubmitted = false;
  state = this.dialogService.state;

  title = computed(() => this.state().mode === 'add' ? 'Add New Board' : 'Edit Board');
  btnText = computed(() => this.state().mode === 'add' ? 'Create New Board' : 'Save Changes');

  ngOnInit() {
    this.initForm();
    if (this.state().mode === 'edit' && this.state().data) {
      this.patchForm(this.state().data);
    }
  }

  initForm() {
    this.boardForm = this.fb.group({
      name: ['', Validators.required],
      columns: this.fb.array([
        this.fb.control('Todo', Validators.required),
        this.fb.control('Doing', Validators.required)
      ])
    });
  }

  get columns() { return this.boardForm.get('columns') as FormArray; }

  addColumn() { 
    this.isSubmitted = false;
    this.columns.push(this.fb.control('', Validators.required)); 
  }

  removeColumn(index: number) { this.columns.removeAt(index); }

  patchForm(data: any) {
    this.boardForm.patchValue({ name: data.name });
    this.columns.clear();
    data.columns.forEach((col: any) => {
      this.columns.push(this.fb.control(col.name, Validators.required));
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.boardForm.valid) {
      const boardName = this.boardForm.value.name;

      if (this.state().mode === 'add') {
        this.boardService.addBoard(this.boardForm.value);
        
        // 3. Navigate to the new board automatically
        const boardId = boardName.toLowerCase().replace(/ /g, '-');
        this.router.navigate(['/boards', boardId]);
      } else {
        this.boardService.updateBoard(this.state().data.name, this.boardForm.value);
      }
      
      this.dialogService.close();
    }
  }
}