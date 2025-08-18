import { Component, Input, OnInit, Renderer2, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {

  introText: string = `This page lists all quote topics and categories, including quote categories list, all inspirational quote topics, list of quote topics, browse quote themes and explore quote subjects.`;

  topicsList: any = [];
  private subscription: Subscription = new Subscription();
  @Input() fromHome: boolean = false;

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
    this.getTopics();

    if (!this.fromHome) {
      this.commonSer.updateStatsCount();


      //SEO
      // Title & Meta
      this.titleService.setTitle('Quote Topics – Explore All Categories | IAdoreQuotes');
      this.metaService.updateTag({
        name: 'description',
        content: 'Browse a complete list of quote topics including love, motivational, life, success, happiness, forgiveness and more. Explore all quote categories to find inspiration, including quote categories list, list of quote topics, all inspirational quote topics, browse quote themes, and explore quote subjects.'
      });

      // SCHEMA (CollectionPage)
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Quote Topics",
        "description": "Browse a complete list of quote topics including love, motivational, life, success, happiness, forgiveness and more.",
        "url": window.location.href
      };

      const oldScript = this.document.getElementById('quoteSchema');
      if (oldScript) oldScript.remove();

      const script = this.renderer.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'quoteSchema';
      script.text = JSON.stringify(schemaData);
      this.renderer.appendChild(this.document.head, script);
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
