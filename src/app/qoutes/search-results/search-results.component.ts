import { Component, HostListener, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/utility/common.service';
import { ApiService } from 'src/app/utility/api.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {

  searchedQoutesList: any[] = [];
  page = 0;
  hasMore = true;
  allLoaded = false;
  isLoading = false;
  // ADD these fields
  private scrollEl?: HTMLElement;
  private readonly bottomThreshold = 150;
  private readonly scrollHandler = () => this.onScroll();

  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  // ADD this lifecycle hook
  ngAfterViewInit(): void {
    this.scrollEl = this.document.getElementById('contentScroll') as HTMLElement;
    if (this.scrollEl) {
      this.scrollEl.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
  }

  ngOnInit(): void {
    // get initial 20 results + keyword from sessionStorage
    const storedList = sessionStorage.getItem('searchedList');
    const keyword = sessionStorage.getItem('searchedKeyword');

    if (storedList && keyword) {
      this.page = 1;                  // already loaded page 0
      this.hasMore = true;
      this.allLoaded = false;
      this.searchedQoutesList = JSON.parse(storedList);
    }

    setTimeout(() => {
      if (this.scrollEl) this.scrollEl.scrollTop = 0;
    });

    // this.commonSer.updateStatsCount();
  }

  loadNextPage(keyword: string): void {
    this.isLoading = true;
    const req$ = this.apiSer.searchGlobalInQoutes(keyword, this.page).subscribe((res: any) => {
      if (res && res.length > 0) {
        this.modifyData(res);
        this.searchedQoutesList = this.searchedQoutesList.concat(res);

        if (res.length < 20) {
          this.hasMore = false;
          this.allLoaded = true;
        }

        this.page += 1;
      } else {
        this.hasMore = false;
        this.allLoaded = true;
      }

      this.isLoading = false;
    });

    this.subscription.add(req$);
  }

  modifyData(datalist: any[]): void {
    datalist.forEach((item: any) => {
      const tempArr = item.qoutes.split('—');
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });
  }


  selectedAuthor(item: any): void {
    this.router.navigate(['author/' + item.authorId + '/' + item.authorName]);
  }

  // ADD this method
  private onScroll(): void {
    if (!this.hasMore || this.isLoading || !this.scrollEl) return;

    const pos = this.scrollEl.scrollTop + this.scrollEl.clientHeight;
    const max = this.scrollEl.scrollHeight;

    if (pos >= max - this.bottomThreshold) {
      // this.page += 1;
      const keyword = sessionStorage.getItem('searchedKeyword');
      if (keyword) {
        this.loadNextPage(keyword);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
