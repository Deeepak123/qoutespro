import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent {
  statsDataList: any = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    this.getStats();
  }

  getStats = () => {
    this.statsDataList = [];
    const statsData$ = this.apiSer.getStats().subscribe((res: any) => {
      this.statsDataList = res;
    }, (error: any) => {
      console.log("ERROR:" + error);
    })
    this.subscription.add(statsData$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
