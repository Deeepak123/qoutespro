import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-author-qoutes',
  templateUrl: './author-qoutes.component.html',
  styleUrls: ['./author-qoutes.component.scss']
})
export class AuthorQoutesComponent implements OnInit {

  qoutesList: any = [];
  authorName: string = "";
  page = 0;
  hasMore = true;
  allLoaded = false;

  private subscription: Subscription = new Subscription();

  constructor(
    private activeRoute: ActivatedRoute,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(params => {
      window.scroll(0, 0);
      let authorId = params.authorId || null;
      this.authorName = params.authorName || null;
      if (authorId) {
        this.page = 0;
        this.hasMore = true;
        this.qoutesList = [];
        // const authorQoutes$ = this.apiSer.getQoutesByAuthorID(authorId).subscribe((res: any) => {
        //   if (res) {
        //     this.modifyData(res);
        //   }
        // });

        //this.subscription.add(authorQoutes$);
        this.getAuthorQuotes(authorId);
        this.commonSer.updateStatsCount();
      }
    })
  }

  getAuthorQuotes(authorId: number) {
    const req$ = this.apiSer.getQoutesByAuthorID(authorId, this.page).subscribe((res: any) => {
      if (res && res.length > 0) {
        this.modifyData(res);
        this.qoutesList = this.qoutesList.concat(res);

        // if less than 20 returned => last page
        if (res.length < 20) {
          this.hasMore = false;
          this.allLoaded = true;
        }
      } else {
        this.hasMore = false;
        this.allLoaded = true;
      }
    });

    this.subscription.add(req$);
  }

  modifyData(datalist: any) {
    datalist.forEach((item: any) => {
      let tempArr = item.qoutes.split("—");
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.hasMore) {
      return;
    }

    const pos = window.pageYOffset + window.innerHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this.page += 1;
      this.getAuthorQuotes(this.activeRoute.snapshot.params.authorId);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}