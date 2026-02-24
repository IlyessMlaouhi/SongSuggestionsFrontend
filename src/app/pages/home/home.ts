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
  searchResults: any[] = [];
  autocompleteSuggestions: any[] = [];
  isLoading = false;
  hasSearched = false;
  showDropdown = false;
  showPlaylistModal :boolean = false;
  selectedSong: any = null;
  userPlaylists: any[] = [];


  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private songService: SongService) {}

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),

      switchMap((query: string) => {
        if (query.trim().length === 0) {
          this.autocompleteSuggestions = [];
          this.showDropdown = false;
          return of([]);
        }

        if (query.trim().length >= 2) {
          this.isLoading = true;
          return this.songService.searchSongs(query);
        }

        return of([]);
      })
    ).subscribe({
      next: (results) => {
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
    this.hasSearched = false;
    this.searchSubject.next(query);
  }

  onSearchClick() {
    if (this.searchQuery.trim().length > 0) {
      this.isLoading = true;
      this.hasSearched = true;
      this.showDropdown = false;

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

  onSuggestionClick(song: any) {
    this.searchQuery = song.name;
    this.showDropdown = false;
    this.onSearchClick();
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.autocompleteSuggestions = [];
    this.hasSearched = false;
    this.isLoading = false;
    this.showDropdown = false;
  }

  onClickOutside() {
    this.showDropdown = false;
  }

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

  openPlaylistSelector(song: any) {
    this.selectedSong = song;
    this.showPlaylistModal = true;
    this.fetchPlaylists(); // Call mocked playlists for now
  }

  closePlaylistSelector() {
    this.showPlaylistModal = false;
    this.selectedSong = null;
  }

  fetchPlaylists() {
    // MOCKED DATA - Replace this later with real API call
    this.userPlaylists = [
      { id: 1, name: 'Favorites', songCount: 42 },
      { id: 2, name: 'Workout Mix', songCount: 28 },
      { id: 3, name: 'Chill Vibes', songCount: 35 },
      { id: 4, name: 'Party Hits', songCount: 51 },
      { id: 5, name: 'Study Focus', songCount: 19 },
    ];
  }

  addSongToPlaylist(playlist: any) {
    console.log(`Adding "${this.selectedSong.name}" to "${playlist.name}"`);

    // TODO: Later replace with actual API call
    // this.playlistService.addSong(playlist.id, this.selectedSong.id).subscribe(...)

    // Show success message (you can add a toast notification here)
    alert(`Added "${this.selectedSong.name}" to "${playlist.name}"!`);

    this.closePlaylistSelector();
  }

  createNewPlaylist() {
    console.log('Create new playlist clicked');

    // TODO: Later you can navigate to create playlist page or show another modal
    alert('Create New Playlist feature - Coming soon!');

    this.closePlaylistSelector();
  }


}
