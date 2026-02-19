import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Firebase REST API Service
 * Handles all CRUD operations with Firebase Realtime Database
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly BASE_URL = environment.firebaseUrl;
  private http = inject(HttpClient);

  /**
   * Load data from Firebase
   * @param path - The path to the data (e.g., 'tasks', 'contacts')
   * @returns Observable of the data
   */
  loadData<T>(path: string): Observable<T | null> {
    return this.http.get<T>(`${this.BASE_URL}/${path}.json`).pipe(
      catchError(error => {
        console.error(`Error loading data from ${path}:`, error);
        return of(null);
      })
    );
  }

  /**
   * PUT data to Firebase (replaces entire path)
   * @param path - The path to save to
   * @param data - The data to save
   * @returns Observable of the saved data
   */
  putData<T>(path: string, data: T): Observable<T | null> {
    return this.http.put<T>(`${this.BASE_URL}/${path}.json`, data).pipe(
      catchError(error => {
        console.error(`Error putting data to ${path}:`, error);
        return of(null);
      })
    );
  }

  /**
   * POST data to Firebase (creates new entry with auto-generated key)
   * @param path - The path to post to
   * @param data - The data to post
   * @returns Observable with the generated key
   */
  postData<T>(path: string, data: T): Observable<{ name: string } | null> {
    return this.http.post<{ name: string }>(`${this.BASE_URL}/${path}.json`, data).pipe(
      catchError(error => {
        console.error(`Error posting data to ${path}:`, error);
        return of(null);
      })
    );
  }

  /**
   * DELETE data from Firebase
   * @param path - The path to delete
   * @returns Observable of null on success
   */
  deleteData(path: string): Observable<null> {
    return this.http.delete<null>(`${this.BASE_URL}/${path}.json`).pipe(
      catchError(error => {
        console.error(`Error deleting data from ${path}:`, error);
        return of(null);
      })
    );
  }

  /**
   * PATCH data to Firebase (partial update)
   * @param path - The path to patch
   * @param data - The partial data to update
   * @returns Observable of the updated data
   */
  patchData<T>(path: string, data: Partial<T>): Observable<T | null> {
    return this.http.patch<T>(`${this.BASE_URL}/${path}.json`, data).pipe(
      catchError(error => {
        console.error(`Error patching data at ${path}:`, error);
        return of(null);
      })
    );
  }
}
