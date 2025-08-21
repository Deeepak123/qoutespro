import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

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
  isLoading = false;
  introText: string = `The Top 100 Quotes collection offers the most inspiring, motivational, life and love quotes from famous authors around the world. These hand-picked quotes are meant to uplift, inspire and encourage. Popular variations include top inspirational quotes, top motivational quotes, best famous quotes, most popular quotes and top quotes of all time.`;

  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService,
    private titleService: Title,
    private metaService: Meta,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {

    //SEO
    // Title + Meta
    this.titleService.setTitle('Top 100 Quotes – IAdoreQuotes');
    this.metaService.updateTag({
      name: 'description',
      content: 'Discover the top 100 most inspiring, motivational, life and love quotes from famous authors. Updated daily with top inspirational quotes, top motivational quotes, best famous quotes, most popular quotes and top quotes of all time.'
    });

    // Schema
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Top 100 Quotes",
      "description": "Discover the top 100 most inspiring, motivational, life and love quotes from famous authors. Updated daily with top inspirational quotes, top motivational quotes, best famous quotes, most popular quotes and top quotes of all time.",
      "author": {
        "@type": "Person",
        "name": "IAdoreQuotes"
      },
      "datePublished": new Date().toISOString().split('T')[0],
      "url": window.location.href
    };

    const old = this.document.getElementById('quoteSchema');
    if (old) old.remove();
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'quoteSchema';
    script.text = JSON.stringify(schemaData);
    this.renderer.appendChild(this.document.head, script);


    this.getTop100();
    this.commonSer.updateStatsCount();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.hasMore || this.isLoading) {
      return;
    }

    const pos = window.pageYOffset + window.innerHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this.page += 1;
      this.getTop100();
    }
  }

  getTop100 = () => {
    this.isLoading = true;
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

        this.isLoading = false;   // ✅ allow next load
      },
      (error: any) => {
        console.log('ERROR:' + error);
        this.isLoading = false;   // ✅ allow retry
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
