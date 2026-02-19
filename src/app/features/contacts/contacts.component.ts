import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ContactService, AuthService, TaskService } from '../../core/services';
import { Contact, ContactFormData, getBadgeColor, getContactInitials } from '../../core/models/contact.model';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit, OnDestroy {
  private contactService = inject(ContactService);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private subscriptions: Subscription[] = [];

  contactGroups: { letter: string; contacts: Contact[] }[] = [];
  selectedContact: Contact | null = null;
  detailsVisible = false;

  // Overlay
  overlayOpen = false;
  overlayMode: 'add' | 'edit' = 'add';
  formData: ContactFormData = { name: '', email: '', phone: '' };
  nameError = '';
  emailError = '';
  phoneError = '';

  // Mobile
  mobileDetailsOpen = false;
  mobileMenuOpen = false;

  // Notification
  notificationText = '';
  showNotification = false;

  // Navigation
  private pendingHighlight: string | null = null;

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        this.pendingHighlight = params['highlight'] || null;
      })
    );
    this.loadContacts();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadContacts(): void {
    this.subscriptions.push(
      this.contactService.loadContacts().subscribe(() => {
        this.buildContactGroups();
        if (this.pendingHighlight) {
          this.highlightContactByName(this.pendingHighlight);
          this.pendingHighlight = null;
        }
      })
    );
  }

  buildContactGroups(): void {
    const grouped = this.contactService.getContactsGrouped();
    this.contactGroups = [];
    grouped.forEach((contacts, letter) => {
      this.contactGroups.push({ letter, contacts });
    });
    this.addCurrentUserToGroups();
    this.contactGroups.sort((a, b) => a.letter.localeCompare(b.letter));
  }

  private addCurrentUserToGroups(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    const allContacts = this.contactGroups.flatMap(g => g.contacts);
    if (allContacts.some(c => c.email === currentUser.email
      || (currentUser.email === 'guest' && c.email === 'guest@join.de'))) return;
    const isGuest = currentUser.email === 'guest';
    const userContact: Contact = {
      id: `user-${currentUser.email}`,
      name: currentUser.name,
      email: isGuest ? 'guest@join.de' : currentUser.email,
      phone: isGuest ? '+49 123 456789' : (currentUser.tel || '')
    };
    const letter = currentUser.name.charAt(0).toUpperCase();
    const group = this.contactGroups.find(g => g.letter === letter);
    if (group) {
      group.contacts.push(userContact);
      group.contacts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.contactGroups.push({ letter, contacts: [userContact] });
    }
  }

  private highlightContactByName(name: string): void {
    const allContacts = this.contactGroups.flatMap(g => g.contacts);
    const contact = allContacts.find(c => c.name === name);
    if (contact) {
      this.selectContact(contact);
    }
  }

  selectContact(contact: Contact): void {
    if (this.selectedContact?.id === contact.id) {
      this.mobileDetailsOpen = true;
      return;
    }
    this.detailsVisible = false;
    setTimeout(() => {
      this.selectedContact = contact;
      this.detailsVisible = true;
      this.mobileDetailsOpen = true;
    }, 10);
  }

  isSelected(contact: Contact): boolean {
    return this.selectedContact?.id === contact.id;
  }

  getInitials(name: string): string {
    return getContactInitials(name);
  }

  getBadgeColor(name: string): string {
    return getBadgeColor(name);
  }

  isCurrentUser(contact: Contact): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? contact.email === currentUser.email : false;
  }

  openAddOverlay(): void {
    this.overlayMode = 'add';
    this.formData = { name: '', email: '', phone: '' };
    this.clearErrors();
    this.overlayOpen = true;
    this.mobileMenuOpen = false;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  openEditOverlay(): void {
    if (!this.selectedContact) return;
    this.overlayMode = 'edit';
    this.formData = {
      name: this.selectedContact.name,
      email: this.selectedContact.email,
      phone: this.selectedContact.phone
    };
    this.clearErrors();
    this.overlayOpen = true;
    this.mobileMenuOpen = false;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  closeOverlay(): void {
    this.overlayOpen = false;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  clearErrors(): void {
    this.nameError = '';
    this.emailError = '';
    this.phoneError = '';
  }

  validateForm(): boolean {
    let valid = true;
    this.clearErrors();

    if (!this.formData.name.trim()) {
      this.nameError = 'This field is required';
      valid = false;
    }

    if (!this.formData.email.trim()) {
      this.emailError = 'This field is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.emailError = 'Please enter a valid email';
      valid = false;
    }

    if (this.formData.phone && !/^(?:\+?[0-9]{1,3})?[1-9][0-9]{4,14}$/.test(this.formData.phone.replace(/\s/g, ''))) {
      this.phoneError = 'Please enter a valid phone number';
      valid = false;
    }

    return valid;
  }

  async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.validateForm()) return;

    if (this.overlayMode === 'add') {
      const newContact = await this.contactService.createContact(this.formData);
      this.loadContacts();
      this.selectedContact = newContact;
      this.detailsVisible = true;
      this.showSuccessNotification('Contact successfully created');
    } else if (this.overlayMode === 'edit' && this.selectedContact) {
      await this.contactService.updateContact(this.selectedContact.id, this.formData);
      this.loadContacts();
      this.selectedContact = { ...this.selectedContact, ...this.formData };
      this.detailsVisible = true;
      this.showSuccessNotification('Contact successfully updated');
    }

    this.closeOverlay();
  }

  async deleteContact(): Promise<void> {
    if (!this.selectedContact) return;

    const contactName = this.selectedContact.name;
    await this.removeContactFromTasks(contactName);
    await this.contactService.deleteContact(this.selectedContact.id);

    this.selectedContact = null;
    this.detailsVisible = false;
    this.mobileDetailsOpen = false;
    this.loadContacts();
    this.closeOverlay();
    this.showSuccessNotification('Contact successfully deleted');
  }

  private async removeContactFromTasks(contactName: string): Promise<void> {
    const tasks = this.taskService.getTasks();
    for (const task of tasks) {
      if (task.assigned_to && typeof task.assigned_to === 'object') {
        const entries = Object.entries(task.assigned_to);
        const filtered = entries.filter(([, name]) => name !== contactName);
        if (filtered.length !== entries.length) {
          const newAssignedTo: Record<string, string> | '' =
            filtered.length > 0
              ? filtered.reduce((acc, [, name], i) => {
                  acc[i.toString()] = name;
                  return acc;
                }, {} as Record<string, string>)
              : '';
          await this.taskService.updateTask({ ...task, assigned_to: newAssignedTo });
        }
      }
    }
  }

  showSuccessNotification(text: string): void {
    this.notificationText = text;
    this.showNotification = true;
    setTimeout(() => { this.showNotification = false; }, 2000);
  }

  openMobileDetails(contact: Contact): void {
    this.selectContact(contact);
    this.mobileDetailsOpen = true;
  }

  closeMobileDetails(): void {
    this.mobileDetailsOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }
}
