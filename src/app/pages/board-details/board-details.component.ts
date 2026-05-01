import { Component, input } from '@angular/core';

@Component({
  selector: 'app-board-details',
  standalone: true,
  template: `
    <section>
      <h1>Board ID: {{ id() }}</h1>
      <p>Logic to fetch data for this specific board goes here.</p>
    </section>
  `
})
export class BoardDetailsComponent {
  // This signal will automatically update whenever the URL :id changes!
  id = input.required<string>(); 
}