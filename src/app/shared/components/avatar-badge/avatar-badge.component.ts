import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getBadgeColor, getContactInitials } from '../../../core/models';

/**
 * Avatar Badge Component
 * Displays a circular badge with initials and dynamic background color
 */
@Component({
  selector: 'app-avatar-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar-badge.component.html',
  styleUrl: './avatar-badge.component.scss'
})
export class AvatarBadgeComponent {
  @Input() name: string = '';
  @Input() size: number = 32;

  initials = computed(() => getContactInitials(this.name));
  colorClass = computed(() => getBadgeColor(this.name));
  fontSize = computed(() => this.size * 0.375);
}
