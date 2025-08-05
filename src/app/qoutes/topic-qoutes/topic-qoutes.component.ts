import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-topic-qoutes',
  templateUrl: './topic-qoutes.component.html',
  styleUrls: ['./topic-qoutes.component.scss']
})
export class TopicQoutesComponent implements OnInit {

  qoutesList: any = [];
  topicName: string = "";
  private subscription: Subscription = new Subscription();

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(params => {
      window.scroll(0, 0);
      let topicId = params.topicId || null;
      this.topicName = params.topicName || null;
      if (topicId) {
        this.qoutesList = [];
        const topicQoutes$ = this.apiSer.getQoutesByTopicID(topicId).subscribe((res: any) => {
          if (res) {
            this.modifyData(res);
          }
        });
        this.subscription.add(topicQoutes$);
        this.commonSer.updateStatsCount();
      }
    })
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

    this.qoutesList = datalist;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
