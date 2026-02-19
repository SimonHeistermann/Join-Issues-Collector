import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'join-angular';

  ngAfterViewInit(): void {
    // Safety net: remove splash after a short delay.
    // WelcomeComponent will mark it as 'handled' if it needs the animation.
    // If no one handles it (non-welcome routes), remove after 100ms.
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash && !splash.hasAttribute('data-handled')) {
        splash.remove();
        document.body.style.backgroundColor = '';
      }
    }, 100);
  }
}
