import { Component, OnInit } from '@angular/core';
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

  top100List: any = [];
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

  getTop100 = () => {
    this.top100List = [];
    const top100Res$ = this.apiSer.getTopHundredQoutes().subscribe((res: any) => {
      if (res) {
        this.modifyData(res);
      }
    }, (error: any) => {
      console.log("ERROR:" + error);
    })
    this.subscription.add(top100Res$);
  }

  modifyData = (datalist: any) => {
    datalist.forEach((item: any) => {
      let tempArr = item.qoutes.split("—");
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });

    this.top100List = datalist;
  }

  selectedAuthor = (item: any) => {
    this.router.navigate(['author/' + item.authorId + "/" + item.authorName]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
