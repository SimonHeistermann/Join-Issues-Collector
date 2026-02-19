import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  private authService = inject(AuthService);
  private location = inject(Location);

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  goBack(): void {
    this.location.back();
  }
}
