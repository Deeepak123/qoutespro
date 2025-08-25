import { Component, ChangeDetectionStrategy, Inject, OnInit, Renderer2 } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { COLLECTIONS, TopicCollection } from '../collections.data';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsComponent implements OnInit {
  collections: TopicCollection[] = COLLECTIONS;

  constructor(private title: Title, private meta: Meta, private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) { }

  ngOnInit(): void {
    // Title (grammar + SEO)
    this.title.setTitle('Best & Trending Quote Collections – IAdoreQuotes');

    // Meta description (~150 chars, clear & keyword-rich)
    this.meta.updateTag({
      name: 'description',
      content: 'Explore curated quote collections by topic—best of all time, trending 2025, short captions, romantic, motivational, and more.'
    });

    // simple canonical
    const href = typeof window !== 'undefined' ? window.location.href : '';
    let link = this.document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'canonical');
      this.renderer.appendChild(this.document.head, link);
    }
    this.renderer.setAttribute(link!, 'href', href);
  }

  trackTopic = (_: number, t: TopicCollection) => t.id;
  trackLink = (_: number, l: any) => l.path;
}
