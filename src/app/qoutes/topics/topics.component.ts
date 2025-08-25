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

  searchText: string = "";

  // replaced flat list with grouped list
  groups: Array<{
    group_id: number;
    group_name: string;
    emoji: string;
    topics: { id: number; name: string }[];
  }> = [];

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
    this.getTopicGroups();

    if (!this.fromHome) {
      this.commonSer.updateStatsCount();

      // SEO
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

  // NEW: fetch grouped topics
  getTopicGroups = () => {
    const sub = this.apiSer.getTopicsNew().subscribe({
      next: (val: any) => {
        // expecting the API to return: [{group_id, group_name, emoji, topics:[{id,name},...]}, ...]
        this.groups = Array.isArray(val) ? val : [];
      },
      error: (err: any) => console.error('ERROR:', err)
    });
    this.subscription.add(sub);
  }

  // click handler works with {id, name}
  selectedTopic = (t: { id: number; name: string }) => {
    this.searchText = "";

    let topicId = t.id;

    if (topicId === 79) {
      topicId = 5;  // remap instead of mutating
    }

    if (topicId === 80) {
      topicId = 6;  // remap instead of mutating
    }

    if (topicId === 83) {
      topicId = 9;  // remap instead of mutating
    }


    this.router.navigate(['topic', topicId, t.name]);
  }


  // trackBys for performance
  trackByGroupId = (_: number, g: any) => g.group_id;
  trackByTopicId = (_: number, t: any) => t.id;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
