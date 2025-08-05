import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {

  topicsList: any = [];
  private subscription: Subscription = new Subscription();
  @Input() fromHome: boolean = false;

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    this.getTopics();

    if (!this.fromHome) {
      this.commonSer.updateStatsCount();
    }
  }

  getTopics = () => {
    this.topicsList = [];
    const topicsRes$ = this.apiSer.getTopics().subscribe((val: any) => {
      if (val) {
        this.topicsList = val;
      }
    }, (error: any) => {
      console.log("ERROR:" + error);
    })
    this.subscription.add(topicsRes$);
  }

  selectedTopic = (item: any) => {
    let topicId = item.id;
    let topicName = item.topicName;
    this.router.navigate(['topic/' + topicId + "/" + topicName]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
