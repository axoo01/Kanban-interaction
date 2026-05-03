import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss'
})
export class TaskFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private boardService = inject(BoardService);
  private router = inject(Router);
  public dialogService = inject(DialogService);

  taskForm!: FormGroup;
  isSubmitted = false;
  dialogState = this.dialogService.state;

  // DYNAMIC STATUS OPTIONS: Now it watches the BoardService for new columns!
  statusOptions = computed(() => 
    this.boardService.currentBoard()?.columns.map(col => col.name) || []
  );

  title = computed(() => this.dialogState().mode === 'add' ? 'Add New Task' : 'Edit Task');
  submitBtnText = computed(() => this.dialogState().mode === 'add' ? 'Create Task' : 'Save Changes');

  ngOnInit() {
    this.initForm();
    if (this.dialogState().mode === 'edit' && this.dialogState().data) {
      this.patchEditData(this.dialogState().data);
    }
  }

  initForm() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      subtasks: this.fb.array([
        this.createSubtaskFormGroup() 
      ]),
      // Default to the first available column in the board
      status: [this.statusOptions()[0] || ''] 
    });
  }

  createSubtaskFormGroup(value: string = ''): FormGroup {
    return this.fb.group({
      name: [value, Validators.required]
    });
  }

  get subtasksFormArray() {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask() {
    this.isSubmitted = false;
    this.subtasksFormArray.push(this.createSubtaskFormGroup());
  }

  removeSubtask(index: number) {
    this.subtasksFormArray.removeAt(index);
  }

  patchEditData(data: any) {
    this.subtasksFormArray.clear();
    data.subtasks.forEach((st: any) => {
      this.subtasksFormArray.push(this.createSubtaskFormGroup(st.title));
    });

    this.taskForm.patchValue({
      title: data.title,
      description: data.description,
      status: data.status
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.taskForm.valid) {
      const boardId = this.boardService.activeBoardId();
      const mode = this.dialogState().mode;

      if (mode === 'add') {
        this.boardService.addTask(boardId, this.taskForm.value);
      } else {
        const originalTitle = this.dialogState().data.title;
        this.boardService.updateTask(boardId, originalTitle, this.taskForm.value);
      }
      this.dialogService.close();
    }
  }
}