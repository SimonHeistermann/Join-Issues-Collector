import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map, tap } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Contact, ContactFormData, getBadgeColor, getContactInitials } from '../models';

/**
 * Contact Service
 * Handles all contact-related operations
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  private firebase = inject(FirebaseService);

  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  /**
   * Load all contacts from Firebase
   */
  loadContacts(): Observable<Contact[]> {
    return this.firebase.loadData<Record<string, Contact>>('contacts').pipe(
      map(data => {
        if (!data) return [];
        return Object.values(data).filter(contact => contact !== null && contact !== undefined);
      }),
      tap(contacts => this.contactsSubject.next(contacts))
    );
  }

  /**
   * Get current contacts value
   */
  getContacts(): Contact[] {
    return this.contactsSubject.value;
  }

  /**
   * Get contacts sorted alphabetically by name
   */
  getContactsSorted(): Contact[] {
    return [...this.contactsSubject.value].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  /**
   * Get contacts grouped by first letter
   */
  getContactsGrouped(): Map<string, Contact[]> {
    const sorted = this.getContactsSorted();
    const grouped = new Map<string, Contact[]>();

    sorted.forEach(contact => {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!grouped.has(letter)) {
        grouped.set(letter, []);
      }
      grouped.get(letter)!.push(contact);
    });

    return grouped;
  }

  /**
   * Create a new contact
   */
  async createContact(data: ContactFormData): Promise<Contact> {
    const contacts = this.contactsSubject.value;
    const newId = (contacts.length > 0
      ? Math.max(...contacts.map(c => parseInt(c.id) || 0)) + 1
      : 0
    ).toString();

    const newContact: Contact = {
      id: newId,
      name: data.name,
      email: data.email,
      phone: data.phone
    };

    const updatedContacts = [...contacts, newContact];
    await firstValueFrom(this.firebase.putData('contacts', updatedContacts));
    this.contactsSubject.next(updatedContacts);

    return newContact;
  }

  /**
   * Update an existing contact
   */
  async updateContact(id: string, data: ContactFormData): Promise<void> {
    const contacts = this.contactsSubject.value.map(c =>
      c.id === id ? { ...c, ...data } : c
    );

    await firstValueFrom(this.firebase.putData('contacts', contacts));
    this.contactsSubject.next(contacts);
  }

  /**
   * Delete a contact
   */
  async deleteContact(id: string): Promise<void> {
    const contacts = this.contactsSubject.value.filter(c => c.id !== id);
    await firstValueFrom(this.firebase.putData('contacts', contacts));
    this.contactsSubject.next(contacts);
  }

  /**
   * Get a contact by ID
   */
  getContactById(id: string): Contact | undefined {
    return this.contactsSubject.value.find(c => c.id === id);
  }

  /**
   * Get a contact by name
   */
  getContactByName(name: string): Contact | undefined {
    return this.contactsSubject.value.find(c => c.name === name);
  }

  /**
   * Get badge color for a contact
   */
  getBadgeColorForContact(contact: Contact): string {
    return getBadgeColor(contact.name);
  }

  /**
   * Get initials for a contact
   */
  getInitialsForContact(contact: Contact): string {
    return getContactInitials(contact.name);
  }
}
