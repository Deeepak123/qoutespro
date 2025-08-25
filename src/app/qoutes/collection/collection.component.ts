import {
  Component, HostListener, Inject, OnDestroy, OnInit, Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

import { ApiService } from 'src/app/utility/api.service';
import { humanizeSlug } from '../collections.data';
import { resolveFromCollections } from '../collections.resolver';

type QuoteItem = { qoutes: string; authorId?: number; authorName?: string; istopHun?: 'Y' | 'N' };

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit, OnDestroy {

  // UI data for your template
  qoutesList: QuoteItem[] = [];
  topicName = '';        // header topic (e.g., 'Love')
  pageH1 = '';           // H1 text (link label)
  introTextDisplay = ''; // optional intro below H1

  // paging
  page = 0;
  hasMore = true;
  allLoaded = false;
  isLoading = false;

  // route state
  private currentTopicId = 0;
  private isYearPage = false;
  private sub = new Subscription();

  pageIntro: any;
  Y = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private apiSer: ApiService,
    private titleSrv: Title,
    private metaSrv: Meta,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(pm => {
        // reset
        window.scrollTo(0, 0);
        this.page = 0; this.hasMore = true; this.allLoaded = false; this.isLoading = false;
        this.qoutesList = [];

        const topicSlug = (pm.get('topic') ?? '').toLowerCase();
        const raw = (pm.get('slug') ?? '').toLowerCase(); // "best-love-quotes" or "love-quotes-2025"

        // extract optional -YYYY
        const m = /^(.*?)-(\d{4})$/.exec(raw);
        const baseSlug = m ? m[1] : raw;
        const year = m ? m[2] : undefined;

        // normalized slug to feed resolver
        const slugFull = year ? `${baseSlug}-${year}` : baseSlug;

        const meta = resolveFromCollections(topicSlug, slugFull);
        if (!meta) { this.router.navigateByUrl('/collections'); return; }

        // UI text
        this.currentTopicId = meta.topicId;
        this.topicName = humanizeSlug(topicSlug) || 'Quotes';
        this.pageH1 = meta.h1;
        this.isYearPage = meta.isYear;
        this.pageIntro = this.getIntro(this.currentTopicId);

        // SEO
        this.titleSrv.setTitle(`${this.pageH1} – IAdoreQuotes`); //set whole name
        const desc = this.getMetaDescription(this.currentTopicId); //set it one by one
        this.metaSrv.updateTag({ name: 'description', content: desc }); //set desc
        this.setCanonicalSimple(typeof window !== 'undefined' ? window.location.href : '');
        this.injectSchema(this.pageH1, desc, {
          published: meta.published,
          modified: meta.modified
        }); //update modify date for particular page when update page with qoutes

        // Fetch
        this.getCollectionQuotes(); // loads first 20
      })
    );
  }

  private getCollectionQuotes() {
    if (!this.hasMore || this.isLoading) return;
    this.isLoading = true;

    const sub = this.apiSer.getQoutesByTopicID(this.currentTopicId, this.page).subscribe({
      next: (res: any[]) => {
        let batch: QuoteItem[] = Array.isArray(res) ? res : [];

        // split qoutes → text/author
        batch = batch.map((it: any) => {
          const parts = (it.qoutes || '').split('—');
          return {
            qoutes: (parts[0] || '').trim(),
            authorName: (parts[1] || '').trim() || undefined,
            authorId: it.authorId != null ? Number(it.authorId) : undefined,
            istopHun: it.istopHun
          };
        });

        // append
        this.qoutesList = [...this.qoutesList, ...batch];

        // paginate
        if (batch.length < 20) { this.hasMore = false; this.allLoaded = true; }
        else { this.page += 1; }

        this.isLoading = false;
      },
      error: () => {
        this.hasMore = false; this.allLoaded = true; this.isLoading = false;
      }
    });

    this.sub.add(sub);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.hasMore || this.isLoading) return;
    const pos = window.pageYOffset + window.innerHeight;
    const max = document.documentElement.scrollHeight;
    if (pos >= max - 150) {
      this.getCollectionQuotes();
    }
  }

  // Click on author
  selectedAuthor = (item: QuoteItem) => {
    if (item?.authorId) {
      const nameSlug = (item.authorName || 'author').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      this.router.navigate(['/author', item.authorId, nameSlug]);
    }
  };

  // ---- SEO helpers ----
  private setCanonicalSimple(url: string) {
    if (typeof window === 'undefined' || !url) return; // SSR-safe
    const d = this.document;
    let link = d.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = d.createElement('link');
      link.setAttribute('rel', 'canonical');
      d.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private injectSchema(
    headline: string,
    description: string,
    opts: { published?: string | Date; modified?: string | Date; url?: string } = {}
  ) {
    const old = this.document.getElementById('quoteSchema');
    if (old) old.remove();

    const ymd = (d?: string | Date) => d ? new Date(d).toISOString().split('T')[0] : undefined;

    const schema: any = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": headline,
      "description": description,
      "author": { "@type": "Organization", "name": "IAdoreQuotes" },
      "url": opts.url ?? (typeof window !== 'undefined' ? window.location.href : '')
    };

    const dp = ymd(opts.published);
    const dm = ymd(opts.modified);
    if (dp) schema.datePublished = dp;
    if (dm) schema.dateModified = dm;

    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'quoteSchema';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.document.head, script);
  }

  // Same descriptions you already have; keep or extend per topic
  private getMetaDescription(topicId: number): string {
    switch (topicId) {
      // label: '200+ Best Love Quotes of All Time',
      case 201: return `Discover 200+ of the best love quotes of all time — timeless, romantic, and heartfelt words to inspire, express, and celebrate the power of true love.`;
      case 202: return `Explore the most Trending Love Quotes ${this.Y} — fresh, romantic, and inspiring words of love to share with your partner, friends, or on social media.`
      case 203: return `Discover the most touching Romantic Love Quotes — heartfelt words to express passion, affection, and timeless romance with your partner or loved one.`
      case 204: return `Find the sweetest Love Quotes for Her — romantic, heartfelt, and inspiring words to make your girlfriend, wife, or special woman feel truly loved.`
      case 205: return `Express your feelings with the best Love Quotes for Him — romantic, thoughtful, and inspiring words to show your boyfriend, husband, or partner how much he means to you.`
      case 206: return `Discover 200+ of the best motivational quotes of all time—timeless lines on grit, success, confidence, and perseverance. Perfect for daily inspiration, captions, work and study focus. Updated picks from legends and modern voices.`
      case 207: return `Discover the most powerful and Trending Motivational Quotes of ${this.Y}. Stay inspired with timeless wisdom, fresh insights, and daily encouragement to boost your confidence, success, and positivity every single day.`
      case 208: return `Explore the best Short Motivational Quotes to spark inspiration instantly. These powerful, concise quotes deliver positivity, courage, and focus—perfect for boosting confidence, achieving success, and staying motivated every day.`
      case 209: return `Find the most inspiring Motivational Quotes for Work & Success. Uplift your mindset, boost productivity, and stay focused with powerful words that encourage hard work, determination, and achievement every day.`
      case 210: return `Discover the best Motivational Quotes for Students to inspire learning, focus, and success. Stay encouraged with powerful words that boost confidence, overcome challenges, and ignite passion for education and growth.`
      case 211: return `Explore 200+ Best Success Quotes of All Time. Timeless words of wisdom to inspire hard work, determination, and achievement—perfect for staying motivated and reaching new heights in life and career.`
      case 212: return `Discover the latest and Trending Success Quotes of ${this.Y}. Stay inspired with fresh, powerful words that boost determination, fuel ambition, and guide you toward achieving goals and lasting success.`
      case 213: return `Explore the best Short Success Quotes that inspire achievement in just a few words. Boost motivation, confidence, and focus with powerful quotes for daily encouragement and lasting success.`
      case 214: return `Find inspiring Success Quotes for Work & Business. Powerful words to boost focus, drive, and determination—perfect for professionals, entrepreneurs, and leaders aiming to achieve growth and lasting success.`
      case 215: return `Discover the best Success Quotes for Students to inspire learning, hard work, and determination. Stay motivated to achieve academic goals, overcome challenges, and build confidence for a brighter future.`
      case 216: return `Explore 200+ Best Inspiration Quotes of All Time. Timeless words to uplift your spirit, spark creativity, and fuel determination—perfect for daily motivation, personal growth, and lifelong success.`
      case 217: return `Discover the most Trending Inspiration Quotes of ${this.Y}. Fresh and uplifting words to spark creativity, build confidence, and keep you motivated on your journey to success and happiness.`
      case 218: return `Explore the best Short Inspiration Quotes that deliver powerful motivation in just a few words. Perfect for quick encouragement, positivity, and daily inspiration to uplift your spirit.`
      case 219: return `Find the best Inspiration Quotes for Work & Life. Powerful words to boost positivity, strengthen focus, and inspire success—perfect for balancing career, personal growth, and daily motivation.`
      case 220: return `Discover the best Inspiration Quotes for Students to spark learning, focus, and determination. Stay motivated to achieve goals, overcome challenges, and build confidence for academic and personal success.`
      case 221: return `Explore 200+ Best Life Quotes of All Time. Timeless words of wisdom about love, happiness, and growth—perfect for daily inspiration, self-reflection, and living a meaningful life.`
      case 222: return `Discover the most Trending Life Quotes of ${this.Y}. Uplifting words of wisdom to inspire positivity, self-growth, and happiness—perfect for guiding you through life’s journey this year.`
      case 223: return `Explore the best Short Life Quotes that capture wisdom and positivity in just a few words. Perfect for daily inspiration, happiness, and guiding you toward a meaningful life.`
      case 224: return `Discover the best Positive Life Quotes to inspire happiness, hope, and confidence. Uplifting words that encourage optimism, self-growth, and a brighter outlook on life every day.`
      case 225: return `Discover the best Inspirational Life Quotes to uplift your spirit, spark positivity, and guide you toward happiness and growth. Perfect for daily motivation and living a meaningful life.`
      case 226: return `Explore 200+ Best Attitude Quotes of All Time. Powerful words to build confidence, positivity, and resilience—perfect for inspiring success, self-belief, and a winning mindset in life.`
      case 227: return `Discover the most Trending Attitude Quotes of ${this.Y}. Bold and inspiring words to boost confidence, positivity, and self-belief—perfect for motivating success and shaping a winning mindset this year.`
      case 228: return `Explore the best Short Attitude Quotes that inspire confidence, positivity, and strength in just a few words. Perfect for quick motivation, self-belief, and building a winning mindset.`
      case 229: return `Discover the best Positive Attitude Quotes to inspire confidence, optimism, and resilience. Uplifting words that help you stay strong, motivated, and focused on success in every aspect of life.`
      case 230: return `Explore the best Savage Attitude Quotes that show boldness, confidence, and fearless vibes. Perfect for standing strong, shutting negativity, and inspiring a powerful, unapologetic mindset.`
      case 231: return `Explore 200+ Best Friendship Quotes of All Time. Heartwarming words about love, trust, and laughter—perfect for celebrating true friends and the bond that makes life meaningful.`
      case 232: return `Discover the most Trending Friendship Quotes of ${this.Y}. Heartwarming and uplifting words to celebrate love, trust, and joy—perfect for honoring true friends and lifelong bonds this year.`
      case 233: return `Explore the best Short Friendship Quotes that capture love, trust, and joy in just a few words. Perfect for celebrating true friends and sharing meaningful bonds.`
      case 234: return `Discover the best True Friendship Quotes that celebrate loyalty, trust, and unconditional support. Heartfelt words that honor the bond of real friends who make life meaningful.`
      case 235: return `Explore the best Funny Friendship Quotes filled with laughter, joy, and witty lines. Celebrate the lighter side of friendship with quotes that bring smiles and unforgettable memories.`
      case 236: return `Explore 200+ Best Family Quotes of All Time. Heartwarming words about love, unity, and togetherness—perfect for celebrating the bond that makes family life meaningful and special.`
      case 237: return `Discover the most Trending Family Quotes of ${this.Y}. Heartfelt words about love, unity, and togetherness—perfect for celebrating the joy and strength of family bonds this year.`
      case 238: return `Explore the best Short Family Quotes that capture love, unity, and togetherness in just a few words. Perfect for celebrating the joy and strength of family bonds.`
      case 239: return `Discover the best Love and Family Quotes that celebrate unity, care, and togetherness. Heartfelt words about unconditional love, trust, and the bonds that make family life meaningful.`
      case 240: return `Explore the best Inspirational Family Quotes that celebrate love, unity, and strength. Uplifting words to motivate, encourage, and remind us of the true value of family bonds.`
      default: return ``;
    }
  }

  private getIntro(topicId: number): string {
    switch (topicId) {
      case 201: return 'Love is the most beautiful feeling — it inspires, heals, and connects us. Here are 200+ of the best love quotes of all time to express romance, passion, and timeless affection.';
      case 202: return `Love never goes out of style — but every year brings new ways to express it. Here are the most Trending Love Quotes ${this.Y}, filled with fresh emotions and timeless romance for every heart`
      case 203: return `Romance is the language of the heart. In this collection of Romantic Love Quotes, you’ll find heartfelt words that capture passion, tenderness, and the beauty of love in its purest form.`
      case 204: return `She deserves to know how much she means to you. This collection of Love Quotes for Her brings together romantic, thoughtful, and inspiring words to express your deepest feelings and brighten her heart.`
      case 205: return `Men also love to feel cherished and valued. This collection of Love Quotes for Him shares heartfelt, romantic, and inspiring words to let your partner know just how deeply you care.`
      case 206: return `Fuel your day with the greatest motivation lines ever written. This handpicked list gathers powerful quotes on hard work, resilience, and mindset—from classic icons to today’s leaders—to spark action, boost confidence, and keep you moving.`
      case 207: return `Looking for motivation in ${this.Y}? Explore our handpicked collection of trending motivational quotes that fuel confidence, inspire action, and uplift your spirit—perfect for staying positive, focused, and unstoppable throughout the year.`
      case 208: return `Discover impactful short motivational quotes that inspire in just a few words. Perfect for daily motivation, quick encouragement, and a boost of positivity to keep you focused and moving forward with confidence.`
      case 209: return `Discover motivational quotes for work and success that fuel determination, inspire focus, and drive achievement. Perfect for professionals, dreamers, and achievers seeking daily encouragement to overcome challenges and reach their goals.`
      case 210: return `Explore motivational quotes for students that spark focus, inspire learning, and build confidence. Perfect for exams, studies, and personal growth—these quotes help students stay positive, determined, and motivated to achieve success.`;
      case 211: return `Dive into 200+ of the greatest success quotes ever shared. These powerful words from leaders, thinkers, and achievers will fuel your motivation, strengthen your mindset, and guide you toward lasting success.`;
      case 212: return `Looking for inspiration in ${this.Y}? Explore trending success quotes that motivate you to chase goals, build confidence, and achieve greatness. Perfect for daily encouragement and staying focused on your journey to success.`;
      case 213: return `Discover short success quotes that deliver big inspiration in few words. Perfect for quick motivation, these quotes uplift your spirit and keep you focused on achieving your goals.`;
      case 214: return `Discover success quotes for work and business that fuel ambition, inspire productivity, and encourage perseverance. Ideal for entrepreneurs, professionals, and dreamers striving to achieve goals and build a successful future.`;
      case 215: return `Explore success quotes for students that inspire focus, persistence, and achievement. Perfect for studies, exams, and personal growth—these quotes motivate learners to stay positive and chase their dreams with confidence.`;
      case 216: return `Dive into 200+ of the most inspiring quotes ever shared. These powerful words from great thinkers and achievers will motivate you to dream big, stay positive, and embrace life with confidence.`;
      case 217: return `Looking for daily inspiration in ${this.Y}? Explore trending inspiration quotes that uplift your spirit, fuel positivity, and motivate you to embrace challenges with confidence and courage.`;
      case 218: return `Discover short inspiration quotes that spark big motivation in little words. Ideal for daily encouragement, these quotes uplift your mood and keep you positive, focused, and inspired.`;
      case 219: return `Explore inspiration quotes for work and life that uplift your spirit, fuel determination, and guide you through challenges. Ideal for staying motivated, productive, and positive in both career and personal journeys.`;
      case 220: return `Explore inspiration quotes for students that fuel motivation, boost confidence, and encourage perseverance. Perfect for studies, exams, and personal growth—these quotes help students stay positive and focused on success.`;
      case 221: return `Dive into 200+ of the greatest life quotes ever shared. These inspiring words from thinkers, leaders, and writers offer guidance, positivity, and motivation to live fully and embrace every moment.`;
      case 222: return `Looking for fresh inspiration in ${this.Y}? Explore trending life quotes that motivate you to embrace positivity, find balance, and live every moment with purpose and joy.`;
      case 223: return `Discover short life quotes that deliver big inspiration in few words. Ideal for quick motivation, these quotes uplift your spirit and remind you to live fully and positively.`;
      case 224: return `Explore positive life quotes that spark joy, build resilience, and encourage optimism. Perfect for daily inspiration, these quotes help you stay motivated, hopeful, and focused on living a meaningful life.`;
      case 225: return `Explore inspirational life quotes that encourage positivity, resilience, and purpose. These timeless words help you stay motivated, embrace challenges, and live each day with confidence and joy.`;
      case 226: return `Dive into 200+ of the greatest attitude quotes ever shared. These inspiring words motivate confidence, positivity, and strength, helping you cultivate the right mindset to face challenges and achieve success.`;
      case 227: return `Looking for fresh inspiration in ${this.Y}? Explore trending attitude quotes that uplift your spirit, strengthen confidence, and motivate you to face challenges with positivity and determination.`;
      case 228: return `Discover short attitude quotes that deliver bold inspiration in few words. Ideal for boosting confidence, staying positive, and motivating yourself to face life with courage and determination.`;
      case 229: return `Explore positive attitude quotes that spark confidence, encourage optimism, and build inner strength. Perfect for daily motivation, these quotes guide you to face challenges with courage and a winning mindset.`;
      case 230: return `Discover savage attitude quotes that radiate confidence and bold energy. These fearless words inspire self-belief, strength, and determination—perfect for those who embrace life with power and unapologetic style.`;
      case 231: return `Dive into 200+ of the greatest friendship quotes ever shared. These timeless words capture the beauty of trust, loyalty, and joy, reminding us why friends are life’s most cherished treasure.`;
      case 232: return `Looking for fresh friendship inspiration in ${this.Y}? Explore trending friendship quotes that celebrate loyalty, laughter, and love, reminding you of the true value of friends in life.`;
      case 233: return `Discover short friendship quotes that beautifully express the value of true friends. These simple yet powerful words celebrate love, loyalty, and the joy of lifelong connections.`;
      case 234: return `Explore true friendship quotes that capture the essence of genuine bonds. These timeless words celebrate trust, love, and loyalty—the qualities that define real and lasting friendships.`;
      case 235: return `Discover funny friendship quotes that capture the humor, love, and craziness shared with true friends. Perfect for bringing smiles, sharing laughs, and celebrating the joy of lifelong bonds.`;
      case 236: return `Dive into 200+ of the greatest family quotes ever shared. These timeless words celebrate love, support, and unity, reminding us why family is life’s greatest blessing and strength.`;
      case 237: return `Looking for family inspiration in ${this.Y}? Explore trending family quotes that honor love, support, and connection, reminding us why family is the heart of happiness and strength.`;
      case 238: return `Discover short family quotes that beautifully express love and unity. Simple yet powerful, these quotes remind us of the strength, joy, and comfort that family brings to life.`;
      case 239: return `Explore love and family quotes that honor the joy of togetherness, the warmth of support, and the strength of lasting bonds. Perfect for celebrating the true meaning of family and love.`;
      case 240: return `Discover inspirational family quotes that highlight love, support, and togetherness. These powerful words uplift your spirit, strengthen relationships, and remind you why family is life’s greatest blessing.`;
      default: return ``;
    }
  }



  getRelatedTopics(topic: string): Array<{ id: number; name: string }> {
    switch (topic) {
      case 'Anxiety':
        return [
          { id: 9, name: 'Confidence' },
          { id: 11, name: 'Courage' },
          { id: 12, name: 'Motivational' },
        ];
      case 'Confidence':
        return [
          { id: 11, name: 'Courage' },
          { id: 12, name: 'Motivational' },
          { id: 2, name: 'Success' },
        ];
      case 'Courage':
        return [
          { id: 9, name: 'Confidence' },
          { id: 14, name: 'Fear' },
          { id: 12, name: 'Motivational' },
        ];
      case 'Dreams':
        return [
          { id: 12, name: 'Motivational' },
          { id: 2, name: 'Success' },
          { id: 4, name: 'Life' },
        ];
      case 'Failure':
        return [
          { id: 2, name: 'Success' },
          { id: 9, name: 'Confidence' },
          { id: 12, name: 'Motivational' },
        ];
      case 'Fear':
        return [
          { id: 11, name: 'Courage' },
          { id: 9, name: 'Confidence' },
          { id: 12, name: 'Motivational' },
        ];
      case 'Forgiveness':
        return [
          { id: 3, name: 'Love' },
          { id: 6, name: 'Kindness' },
          { id: 19, name: 'Past' },
        ];
      case 'Freedom':
        return [
          { id: 17, name: 'Leadership' },
          { id: 12, name: 'Motivational' },
          { id: 1, name: 'Happiness' },
        ];
      case 'Happiness':
        return [
          { id: 3, name: 'Love' },
          { id: 5, name: 'Living' },
          { id: 7, name: 'Inspiration' },
        ];
      case 'Inspiration':
        return [
          { id: 12, name: 'Motivational' },
          { id: 2, name: 'Success' },
          { id: 4, name: 'Life' },
        ];
      case 'Kindness':
        return [
          { id: 3, name: 'Love' },
          { id: 1, name: 'Happiness' },
          { id: 15, name: 'Forgiveness' },
        ];
      case 'Leadership':
        return [
          { id: 2, name: 'Success' },
          { id: 9, name: 'Confidence' },
          { id: 12, name: 'Motivational' },
        ];
      case 'Life':
        return [
          { id: 5, name: 'Living' },
          { id: 1, name: 'Happiness' },
          { id: 3, name: 'Love' },
        ];
      case 'Living':
        return [
          { id: 4, name: 'Life' },
          { id: 1, name: 'Happiness' },
          { id: 7, name: 'Inspiration' },
        ];
      case 'Love':
        return [
          { id: 1, name: 'Happiness' },
          { id: 6, name: 'Kindness' },
          { id: 5, name: 'Living' },
        ];
      case 'Motivational':
        return [
          { id: 2, name: 'Success' },
          { id: 9, name: 'Confidence' },
          { id: 11, name: 'Courage' },
        ];
      case 'Pain':
        return [
          { id: 18, name: 'Past' },
          { id: 14, name: 'Fear' },
          { id: 11, name: 'Courage' },
        ];
      case 'Past':
        return [
          { id: 18, name: 'Pain' },
          { id: 15, name: 'Forgiveness' },
          { id: 1, name: 'Happiness' },
        ];
      case 'Success':
        return [
          { id: 9, name: 'Confidence' },
          { id: 12, name: 'Motivational' },
          { id: 11, name: 'Courage' },
        ];
      case 'Time':
        return [
          { id: 2, name: 'Success' },
          { id: 4, name: 'Life' },
          { id: 7, name: 'Inspiration' },
        ];
      case 'Truth':
        return [
          { id: 17, name: 'Leadership' },
          { id: 6, name: 'Kindness' },
          { id: 15, name: 'Forgiveness' },
        ];
      case 'Work':
        return [
          { id: 2, name: 'Success' },
          { id: 12, name: 'Motivational' },
          { id: 9, name: 'Confidence' },
        ];
      default:
        return [];
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
