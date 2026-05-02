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
  dialogService = inject(DialogService);
  private boardService = inject(BoardService);
  isSubmitted = false;
  private router = inject(Router);
  

  taskForm!: FormGroup;
  dialogState = this.dialogService.state;

  // Derive title and button text based on mode
  title = computed(() => this.dialogState().mode === 'add' ? 'Add New Task' : 'Edit Task');
  submitBtnText = computed(() => this.dialogState().mode === 'add' ? 'Create Task' : 'Save Changes');

  // Need status options for the dropdown (from Board details component plan)
  statusOptions = ['Todo', 'Doing', 'Done']; // Should match columns in data.json

  ngOnInit() {
    this.initForm();
    // If edit mode, patch values
    if (this.dialogState().mode === 'edit' && this.dialogState().data) {
      this.patchEditData(this.dialogState().data);
    }
  }

  initForm() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      // Dynamic array for subtasks
      subtasks: this.fb.array([
        this.createSubtaskFormGroup() // Start with one empty input
      ]),
      status: [this.statusOptions[0]] // Default to first status
    });
  }

  createSubtaskFormGroup(value: string = ''): FormGroup {
    return this.fb.group({
      name: [value, Validators.required]
    });
  }

  // Getter for easy template access
  get subtasksFormArray() {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask() {
    this.isSubmitted = false; // Reset flag so new subtask isn't immediately red
    this.subtasksFormArray.push(this.createSubtaskFormGroup());
  }

  removeSubtask(index: number) {
    this.isSubmitted = false; // Reset flag
    this.subtasksFormArray.removeAt(index);
    
  }

  patchEditData(data: any) {
    // 1. Clear existing dynamic items
    this.subtasksFormArray.clear();
    // 2. Add existing subtasks
    data.subtasks.forEach((st: any) => {
      this.subtasksFormArray.push(this.createSubtaskFormGroup(st.title));
    });
    // 3. Patch other values
    this.taskForm.patchValue({
      title: data.title,
      description: data.description,
      status: data.status
    });
  }

    onSubmit() {
    this.isSubmitted = true;

    if (this.taskForm.valid) {
      const urlSegments = this.router.url.split('/');
      const boardId = urlSegments[urlSegments.length - 1];
      const mode = this.dialogState().mode;

      if (mode === 'add') {
        this.boardService.addTask(boardId, this.taskForm.value);
      } else {
        // Use the original title from the data to find the task in the service
        const originalTitle = this.dialogState().data.title;
        this.boardService.updateTask(boardId, originalTitle, this.taskForm.value);
      }

      this.dialogService.close();
    }
  }
}