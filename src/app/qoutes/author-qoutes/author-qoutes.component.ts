import { Component, OnInit } from '@angular/core';
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
        this.qoutesList = [];
        const authorQoutes$ = this.apiSer.getQoutesByAuthorID(authorId).subscribe((res: any) => {
          if (res) {
            this.modifyData(res);
          }
        });
        this.subscription.add(authorQoutes$);
        this.commonSer.updateStatsCount();
      }
    })
  }

  modifyData = (datalist: any) => {
    datalist.forEach((item: any) => {
      let tempArr = item.qoutes.split("—");
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });

    this.qoutesList = datalist;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
