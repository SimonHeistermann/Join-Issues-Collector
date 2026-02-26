import { Injectable } from '@angular/core';

/**
 * Sanitization Service
 * Strips potentially dangerous HTML/script content from user input
 */
@Injectable({ providedIn: 'root' })
export class SanitizationService {

  /**
   * Sanitize a single text string by removing HTML tags, event attributes, and JS URIs.
   * Returns the cleaned string, or empty string for non-string input.
   */
  sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    let text = input;
    text = text.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
    text = text.replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, '');
    text = text.replace(/<embed[\s\S]*?>/gi, '');
    text = text.replace(/<link[\s\S]*?>/gi, '');
    text = text.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    text = text.replace(/javascript\s*:/gi, '');
    text = text.replace(/data\s*:\s*text\/html/gi, '');
    text = text.replace(/<\/?[^>]+(>|$)/g, '');
    return text.trim();
  }

  /**
   * Sanitize all string properties of an object (shallow).
   * Returns a new object with sanitized values.
   */
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
      if (typeof result[key] === 'string') {
        (result as Record<string, unknown>)[key] = this.sanitizeText(result[key] as string);
      }
    }
    return result;
  }
}
