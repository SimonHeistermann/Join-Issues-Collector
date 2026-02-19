import { Pipe, PipeTransform } from '@angular/core';
import { getContactInitials } from '../../core/models';

/**
 * Initials Pipe
 * Transforms a full name into initials
 * e.g., "John Doe" => "JD"
 */
@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    return getContactInitials(name);
  }
}
