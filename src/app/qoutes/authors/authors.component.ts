import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.scss']
})
export class AuthorsComponent implements OnInit {

  authorsList: any = [];
  searchText: string = "";
  private subscription: Subscription = new Subscription();
  @Input() fromHome: boolean = false;

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService
  ) { }

  ngOnInit(): void {
    this.getAuthors();
    debugger;

    if (!this.fromHome) {
      this.commonSer.updateStatsCount();
    }
  }

  getAuthors = () => {
    this.authorsList = [];
    const authorsRes$ = this.apiSer.getAuthors().subscribe((val: any) => {
      if (val) {
        this.authorsList = val;
      }
    }, (error: any) => {
      console.log("ERROR:" + error);
    })
    this.subscription.add(authorsRes$);
  }

  selectedAuthor = (item: any) => {
    this.searchText = "";
    this.router.navigate(['author/' + item.id + "/" + item.authorName]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
