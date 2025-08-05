import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  searchedQoutesList: any = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    let tempList = sessionStorage.getItem('searchedList');
    if (tempList) {
      this.modifyData(JSON.parse(tempList));
    }

    this.commonSer.updateStatsCount();
  }

  selectedAuthor = (item: any) => {
    this.router.navigate(['author/' + item.authorId + "/" + item.authorName]);
  }

  modifyData = (datalist: any) => {
    datalist.forEach((item: any) => {
      let tempArr = item.qoutes.split("—");
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });

    this.searchedQoutesList = datalist;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

