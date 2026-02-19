import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskPriority, getPriorityLabel } from '../../../core/models';

/**
 * Priority Icon Component
 * Displays the appropriate priority icon based on task priority level
 */
@Component({
  selector: 'app-priority-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './priority-icon.component.html',
  styleUrl: './priority-icon.component.scss'
})
export class PriorityIconComponent {
  @Input() priority: TaskPriority = '';

  priorityLabel = computed(() => getPriorityLabel(this.priority));

  iconPath = computed(() => {
    switch (this.priority) {
      case 1:
        return 'assets/icons/low_icon_green.png';
      case 2:
        return 'assets/icons/medium_icon_orange.png';
      case 3:
        return 'assets/icons/urgent_icon_red.png';
      default:
        return '';
    }
  });
}
