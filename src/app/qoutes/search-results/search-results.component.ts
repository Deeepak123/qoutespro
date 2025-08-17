import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/utility/common.service';
import { ApiService } from 'src/app/utility/api.service';

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

  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

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

    this.commonSer.updateStatsCount();
  }

  loadNextPage(keyword: string): void {
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

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.hasMore) {
      return;
    }

    const pos = window.pageYOffset + window.innerHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      const keyword = sessionStorage.getItem('searchedKeyword');
      if (keyword) {
        this.loadNextPage(keyword);
      }
    }
  }

  selectedAuthor(item: any): void {
    this.router.navigate(['author/' + item.authorId + '/' + item.authorName]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
