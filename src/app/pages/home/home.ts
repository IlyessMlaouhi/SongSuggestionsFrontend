import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SongService } from '../../core/services/songService';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  standalone:true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {

  searchQuery = '';
  searchResults: any[] = []; // Full results shown after clicking Search button
  autocompleteSuggestions: any[] = []; // Dropdown suggestions while typing
  isLoading = false;
  hasSearched = false; // True after clicking Search button
  showDropdown = false; // Controls dropdown visibility

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private songService: SongService) {}

  ngOnInit() {
    // Real-time autocomplete (for dropdown only)
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Faster for autocomplete
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (query.trim().length === 0) {
          this.autocompleteSuggestions = [];
          this.showDropdown = false;
          return of([]);
        }

        // Only show dropdown for autocomplete, not full results
        if (query.trim().length >= 2) {
          this.isLoading = true;
          return this.songService.searchSongs(query);
        }

        return of([]);
      })
    ).subscribe({
      next: (results) => {
        // Limit autocomplete suggestions to 6 items
        this.autocompleteSuggestions = (results || []).slice(0, 6);
        this.showDropdown = this.autocompleteSuggestions.length > 0 && !this.hasSearched;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Autocomplete error:', error);
        this.isLoading = false;
        this.autocompleteSuggestions = [];
        this.showDropdown = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.hasSearched = false; // Reset when typing
    this.searchSubject.next(query);
  }

  // Called when clicking the Search button
  onSearchClick() {
    if (this.searchQuery.trim().length > 0) {
      this.isLoading = true;
      this.hasSearched = true;
      this.showDropdown = false; // Hide dropdown when showing full results

      this.songService.searchSongs(this.searchQuery).subscribe({
        next: (results) => {
          this.searchResults = results || [];
          console.log('Search results:', results);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isLoading = false;
          this.searchResults = [];
        }
      });
    }
  }

  // Called when clicking a suggestion in the dropdown
  onSuggestionClick(song: any) {
    this.searchQuery = song.name;
    this.showDropdown = false;
    this.onSearchClick(); // Trigger full search
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.autocompleteSuggestions = [];
    this.hasSearched = false;
    this.isLoading = false;
    this.showDropdown = false;
  }

  // Close dropdown when clicking outside
  onClickOutside() {
    this.showDropdown = false;
  }

  // Helper method to generate gradient colors for search results
  getGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return gradients[index % gradients.length];
  }
}
