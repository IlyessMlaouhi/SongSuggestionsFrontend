import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SongDto } from '../models/songDto';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'http://localhost:8080/v1/songs';

  constructor(private http: HttpClient) {}

  searchSongs(query: string): Observable<SongDto[]> {
    if (!query?.trim()) {
      return of([]);
    }
    const params = new HttpParams().set('name', query.trim());

    return this.http.get<SongDto[]>(`${this.apiUrl}/search`, { params }).pipe(
      map((response: any) => {
        return response.data || response || [];
      }),
      catchError((error) => {
        console.error('Search error:', error);
        return of([]);
      })
    );
  }
}
