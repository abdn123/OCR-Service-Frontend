import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import '@angular/localize/init';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet />
    </div>
  `,
  styles: [`
    .app-container {
      display: contents;
    }
  `]
})
export class AppComponent {
  title = 'User Management System';
}
