import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';

@Component({
  selector: 'app-parent-layer',
  templateUrl: './parent-layer.component.html',
  styleUrls: ['./parent-layer.component.scss']
})
export class ParentLayerComponent implements OnInit {

  @ViewChild('drawer') drawer: MatDrawer = null as any;
  searchedQoutesList: any = [];
  searchedKeyword: string = "";
  selectedMenu: any = 'home';
  resetSearchBar: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiSer: ApiService,
  ) {
    router.events.subscribe(res => {
      this.selectedMenu = this.router.url.replace("/", "");
    });
  }

  ngOnInit(): void {
  }

  routeToMenu = (val: any) => {
    this.drawer.close();
  }

  openToggle = () => {
    setTimeout(() => {
      window.scroll(0, 0)
      this.drawer.toggle();
    }, 100);
  }

  routTo = (routeValue: string) => {
    this.searchedKeyword = "";
    this.router.navigate([routeValue]);
  }

  searchGlobal = () => {
    this.searchedQoutesList = [];
    const searchedQoutesRes$ = this.apiSer.searchGlobalInQoutes(this.searchedKeyword).subscribe((val: any) => {
      if (val) {
        this.searchedQoutesList = val;
        sessionStorage.setItem("searchedList", JSON.stringify(this.searchedQoutesList));
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/search-results']));
      } else {
        this.searchedQoutesList = [];
        sessionStorage.removeItem("searchedList");
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/search-results']));
      }
    }, (error: any) => {
      console.log("ERROR:" + error);
    })
    this.subscription.add(searchedQoutesRes$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

