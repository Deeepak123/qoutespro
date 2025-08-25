import { Component, Input, OnInit, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.scss']
})
export class AuthorsComponent implements OnInit {

  // Page copy
  introText: string = `This page provides a list of famous authors and thinkers, including list of famous authors, quotes by famous people, author quotes collection, browse author quote list and inspirational authors list.`;

  // Data
  authorsList: any[] = [];        // full list from API
  filteredAuthors: any[] = [];    // letter-filtered list (source for grid)

  // Search + Letter filter
  searchText: string = '';
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  selectedLetter: string = '';

  // Misc
  private subscription: Subscription = new Subscription();
  @Input() fromHome: boolean = false;

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService,
    private titleService: Title,
    private metaService: Meta,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.getAuthors();

    if (!this.fromHome) {
      this.commonSer.updateStatsCount();

      // SEO — Title & Meta
      this.titleService.setTitle('Quotes by Authors – Full List of Famous Authors | IAdoreQuotes');
      this.metaService.updateTag({
        name: 'description',
        content:
          'Browse a complete list of famous authors and thinkers. Discover motivational, inspirational and life quotes by authors such as Einstein, Buddha, Gandhi, Oscar Wilde and more. Popular variations include list of famous authors, quotes by famous people, author quotes collection, browse author quote list and inspirational authors list.'
      });

      // SCHEMA (CollectionPage)
      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Quotes by Authors',
        description: 'Browse a complete list of famous authors and thinkers.',
        url: window.location.href
      };

      const oldScript = this.document.getElementById('quoteSchema');
      if (oldScript) oldScript.remove();

      const script = this.renderer.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'quoteSchema';
      script.text = JSON.stringify(schemaData);
      this.renderer.appendChild(this.document.head, script);
    }
  }

  /** Load authors and initialize filters */
  getAuthors = () => {
    this.authorsList = [];
    const sub = this.apiSer.getAuthors().subscribe({
      next: (val: any[]) => {
        this.authorsList = Array.isArray(val) ? val : [];
        this.applyLetterFilter(); // initial view = All
      },
      error: (err: any) => console.error('ERROR:', err)
    });
    this.subscription.add(sub);
  };

  /** User clicked a letter (or "All") */
  filterByLetter(letter: string) {
    this.selectedLetter = letter || '';
    this.applyLetterFilter();
  }

  /** Apply the letter filter to authorsList -> filteredAuthors */
  private applyLetterFilter() {
    if (!this.selectedLetter) {
      this.filteredAuthors = this.authorsList.slice();
      return;
    }
    const L = this.selectedLetter.toUpperCase();
    this.filteredAuthors = this.authorsList.filter(a =>
      (a.authorName || '').toUpperCase().startsWith(L)
    );
  }

  /** Called on search box change (kept for future debouncing/server-side search if needed) */
  onSearchChange(_: string) {
    // No-op: search is handled in template via pipe (searchFilter)
    // Keep this hook if you want to debounce or trigger server-side search later.
  }

  /** TrackBy for *ngFor performance */
  trackByAuthorId = (_: number, a: any) => a.id;

  /** Navigate to author page */
  selectedAuthor = (item: any) => {
    this.searchText = '';
    this.router.navigate(['author', item.id, item.authorName]);
  };

  clearLetter() {
    this.filterByLetter('');
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
