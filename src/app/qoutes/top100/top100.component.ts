import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-top100',
  templateUrl: './top100.component.html',
  styleUrls: ['./top100.component.scss']
})
export class Top100Component implements OnInit {

  @Output() allLoaded = new EventEmitter<boolean>();

  top100List: any = [];
  page = 0;
  hasMore = true;

  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    this.getTop100();
    this.commonSer.updateStatsCount();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.hasMore) {
      return;   // 🛑 stop further loading
    }

    const pos = window.pageYOffset + window.innerHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this.page += 1;
      this.getTop100();
    }
  }

  getTop100 = () => {
    const top100Res$ = this.apiSer.getTopHundredQoutes(this.page).subscribe(
      (res: any) => {
        // res can be undefined, null, or an empty array, so handle all cleanly
        if (res && res.length > 0) {
          this.modifyData(res);
          this.top100List = this.top100List.concat(res);

          // if less than 20 items were returned, it means last page
          if (res.length < 20) {
            this.hasMore = false;
            this.allLoaded.emit(true);
          }
        } else {
          // no items returned => last page reached
          this.hasMore = false;
          this.allLoaded.emit(true);
        }
      },
      (error: any) => {
        console.log('ERROR:' + error);
      }
    );

    this.subscription.add(top100Res$);
  };


  modifyData = (datalist: any) => {
    datalist.forEach((item: any) => {
      let tempArr = item.qoutes.split("—");
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });
  }


  selectedAuthor = (item: any) => {
    this.router.navigate(['author/' + item.authorId + "/" + item.authorName]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
