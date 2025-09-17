import { Component, HostListener, Input, OnInit, Renderer2, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/utility/api.service';
import { CommonService } from 'src/app/utility/common.service';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImageModelComponent } from '../image-model/image-model.component';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { getTopicIntro } from '../topic-intro';
import { getTopicMetaDescription } from '../topic-meta';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-topic-qoutes',
  templateUrl: './topic-qoutes.component.html',
  styleUrls: ['./topic-qoutes.component.scss']
})
export class TopicQoutesComponent implements OnInit {

  qoutesList: any = [];
  topicName: string = "";
  page = 0;
  hasMore = true;
  allLoaded = false;
  introText: any
  introTextDisplay: any
  isLoading = false;

  displayedText: string = '';
  showReadMore: boolean = false;
  isLargeScreen: boolean = false;
  topicId: any;

  // ADD these fields
  private scrollEl?: HTMLElement;
  private readonly bottomThreshold = 150;
  private readonly scrollHandler = () => this.onScroll();

  private subscription: Subscription = new Subscription();


  constructor(
    private activeRoute: ActivatedRoute,
    public router: Router,
    private apiSer: ApiService,
    private commonSer: CommonService,
    private titleService: Title,
    private metaService: Meta,
    private renderer: Renderer2,
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    @Inject(DOCUMENT) private document: Document
  ) { }


  // ADD this lifecycle hook
  ngAfterViewInit(): void {
    this.scrollEl = this.document.getElementById('contentScroll') as HTMLElement;
    if (this.scrollEl) {
      this.scrollEl.addEventListener('scroll', this.scrollHandler, { passive: true });
    }
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(params => {
      window.scroll(0, 0);
      let topicId: number | null = params.topicId ? Number(params.topicId) : null;
      this.topicId = topicId;
      this.topicName = params.topicName || null;
      if (topicId) {

        this.page = 0;
        this.hasMore = true;
        this.allLoaded = false;        // <— important
        this.qoutesList = [];

        // ADD this tiny reset (inside the params subscription)
        setTimeout(() => {
          if (this.scrollEl) this.scrollEl.scrollTop = 0;
        });

        //SEO
        // 1. <title> tag
        this.titleService.setTitle(`${this.topicName} Quotes – IAdoreQuotes`);

        // 2. meta description
        const metaDescription = getTopicMetaDescription(topicId);
        this.metaService.updateTag({ name: 'description', content: metaDescription });

        // 3. H1 and intro text
        // (you already assign {{topicName}} in template as page header, so now just create an intro paragraph variable)
        //for seo intro 
        //LONG PARAGARPAH write here make it as intor and meta same seprate file
        this.introText = this.getIntroParagraph(this.topicName);

        //display seo intro
        this.introTextDisplay = getTopicIntro(topicId);
        console.log("---------INTRO----------");
        console.log(this.introTextDisplay);
        console.log(topicId);

        // Observe screen size
        this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
          .subscribe(result => {
            this.isLargeScreen = result.matches;
            this.updateDisplayText();
          });

        console.log("---------META----------");
        console.log(metaDescription);


        // ----- STRUCTURED DATA (SEO Schema) -----
        const schemaData = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `${this.topicName} Quotes`,
          "description": metaDescription,
          "author": {
            "@type": "Person",
            "name": "iAdoreQuotes"
          },
          "datePublished": '2025-08-01',
          "dateModified": '2025-09-06',
          "url": window.location.href
        };

        // Remove previous schema (if any)
        const oldSchema = this.document.getElementById('quoteSchema');
        if (oldSchema) {
          oldSchema.remove();
        }

        // Add new JSON-LD schema
        const schemaScript = this.renderer.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.id = 'quoteSchema';
        schemaScript.text = JSON.stringify(schemaData);
        this.renderer.appendChild(this.document.head, schemaScript);

        this.getTopicQuotes(topicId);
        // this.commonSer.updateStatsCount();
      }
    })
  }


  getTopicQuotes(topicId: number) {
    this.isLoading = true;
    const req$ = this.apiSer.getQoutesByTopicID(topicId, this.page).subscribe((res: any) => {
      if (res && res.length > 0) {
        this.modifyData(res);
        this.qoutesList = this.qoutesList.concat(res);

        // if less than 20 returned => last page
        if (res.length < 20) {
          this.hasMore = false;
          this.allLoaded = true;
        }
      } else {
        this.hasMore = false;
        this.allLoaded = true;
      }

      this.isLoading = false;
    });

    this.subscription.add(req$);
  }

  modifyData(datalist: any) {
    datalist.forEach((item: any) => {
      let tempArr = item.qoutes.split("—");
      item.qoutes = tempArr[0];
      item.authorName = tempArr[1];
    });
  }

  selectedAuthor = (item: any) => {
    this.router.navigate(['author/' + item.authorId + "/" + item.authorName]);
  }

  updateDisplayText() {
    if (this.isLargeScreen) {
      this.displayedText = this.introTextDisplay;
      this.showReadMore = false;
    } else {
      // Take only first 2 sentences
      const sentences = this.introTextDisplay.split('.');
      this.displayedText = sentences.slice(0, 3).join('.') + (sentences.length > 3 ? '.' : '');
      this.showReadMore = sentences.length > 3;
    }
  }

  onReadMore() {
    this.displayedText = this.introTextDisplay;
    this.showReadMore = false;
  }

  getIntroParagraph(topic: string): string {
    switch (topic) {
      case 'Anxiety':
        return `Anxiety Quotes offer comfort and strength to those struggling with fearful thoughts. These inspirational anxiety quotes can help calm the mind and bring peace to the heart. Explore a collection of overcoming anxiety quotes, positive quotes for anxious mind and uplifting sayings for inner healing. Popular variations include calming quotes for anxiety attacks, inspirational quotes for anxious mind, anxiety quotes for mental peace, positive quotes for overcoming anxiety, and encouraging quotes for anxiety sufferers.`;

      case 'Confidence':
        return `Confidence Quotes remind us to believe in ourselves even when self esteem is low. These powerful lines help build confidence and stay motivated in life. Here you’ll find inspiring quotes about confidence, believe in yourself quotes, boost self confidence quotes, and short sayings to build confidence. Popular variations include boost self confidence quotes, confidence quotes for success, short quotes to build confidence, believe in yourself motivational quotes, and positive confidence quotes for daily use.`;

      case 'Courage':
        return `Courage Quotes inspire us to embrace bravery and face challenges fearlessly. These quotes about being brave and fearless sayings encourage you to overcome fear and remain strong in difficult times. Explore powerful courage quotes, bravery affirmations and encouraging words to stay bold. Popular variations include quotes about being brave and strong, fearless quotes to overcome fear, courageous quotes for difficult times, inspiring quotes about courage and bravery, and stay strong and courageous quotes.`;

      case 'Dreams':
        return `Dream Quotes motivate us to follow our passion and envision a better future. These inspirational dream quotes remind you to dream big and pursue your goals fearlessly. Discover follow your dreams quotes, dream big sayings, pursue your dreams messages and motivational dream quotes. Popular variations include follow your dreams motivational quotes, dream big and achieve quotes, inspiring quotes about chasing dreams, encouraging quotes for dreamers, and quotes to pursue your dreams and goals.`;

      case 'Failure':
        return `Failure Quotes remind us that setbacks are a part of the journey toward success. These quotes about learning from failure will inspire you to keep trying until you succeed. Find powerful failure quotes, bounce back sayings, overcoming failure messages and inspirational quotes about not giving up. Popular variations include quotes about learning from failure, bounce back after failure quotes, encouraging quotes about failure and success, failure quotes for overcoming setbacks, and inspirational quotes about not giving up on failure.`;

      case 'Fear':
        return `Fear Quotes encourage you to face your fears and take bold steps in life. These quotes about conquering fear will motivate you to grow strong and courageous. Browse fearless quotes, quotes about fear and courage, and inspiring words to overcome fear and move forward. Popular variations include face your fears motivational quotes, inspiring quotes about overcoming fear, quotes about fear and courage, stop being afraid quotes, and fearless life inspirational quotes.`;

      case 'Forgiveness':
        return `Forgiveness Quotes help us let go of anger and find peace through compassion. These inspirational quotes about forgiving others remind us of the freedom that comes with letting go. Discover heartwarming forgiveness sayings, letting go and forgiveness quotes and short forgiving messages. Popular variations include heart touching forgiveness quotes, quotes about forgiving and moving on, inspirational quotes about letting go and forgiveness, forgiving yourself motivational quotes, and quotes about forgiveness and love.`;

      case 'Freedom':
        return `Freedom Quotes celebrate the power of living authentically and independently. These quotes about liberty encourage you to embrace personal freedom and break boundaries. Read inspiring freedom sayings, live freely quotes, independence quotes and powerful quotes about personal liberty. Popular variations include inspirational quotes about living freely, personal freedom motivational quotes, quotes about freedom and independence, liberating quotes about free life, and quotes about finding your own freedom.`;

      case 'Happiness':
        return `Happiness Quotes remind us to appreciate the beautiful moments in life and stay positive. These quotes about being happy inspire joy, gratitude, and peace of mind. Explore true happiness quotes, positive happy sayings, stay happy quotes and happiness inspirational messages. Popular variations include positive quotes about being happy in life, stay happy inspirational quotes, quotes for true happiness and peace, beautiful quotes about happiness and smile, and uplifting happiness quotes for daily life.`;

      case 'Inspiration':
        return `Inspirational Quotes offer daily motivation and remind us of our inner strength. These positive inspiration quotes uplift your spirit and encourage success. Browse powerful inspirational quotes, uplifting sayings, everyday inspiration messages and quotes to inspire success. Popular variations include uplifting quotes for daily inspiration, positive quotes to inspire success, motivational quotes for everyday life, inspirational quotes to keep going, and powerful quotes about inspiration and motivation.`;

      case 'Kindness':
        return `Kindness Quotes encourage acts of compassion and love toward others. These quotes about being kind inspire us to make the world a better place. Discover inspirational kindness sayings, spread kindness quotes, and short messages on kindness and compassion. Popular variations include inspirational quotes about being kind to others, spread kindness and love quotes, random act of kindness motivational quotes, quotes about kindness and compassion, and kindness makes a difference quotes.`;

      case 'Leadership':
        return `Leadership Quotes motivate us to guide others with wisdom and courage. These quotes from great leaders inspire responsibility, vision and positive influence. Explore successful leader sayings, motivational leadership quotes and powerful quotes about leadership and responsibility. Popular variations include inspiring quotes for great leaders, motivational leadership quotes for success, quotes about leadership and responsibility, successful leader inspirational quotes, and empowering quotes about leadership qualities.`;

      case 'Life':
        return `Life Quotes offer deep insight into the meaning and beauty of life. These inspirational life quotes encourage you to live fully and appreciate every moment. Read meaningful life sayings, positive life quotes, and deep quotes about life and living. Popular variations include meaningful quotes about life and happiness, inspirational quotes about living life to the fullest, positive life quotes for daily encouragement, deep quotes about life and love, and motivational quotes for a happy life.`;

      case 'Living':
        return `Living Quotes remind us to enjoy each day and live intentionally. These quotes about living in the moment inspire simplicity, gratitude and joy. Discover live in the moment quotes, live well sayings, enjoy life quotes and simple living messages. Popular variations include live in the moment inspirational quotes, simple living and high thinking quotes, enjoy every day of your life quotes, inspirational quotes about living well, and live every day as your last quotes.`;

      case 'Love':
        return `Love Quotes express the beauty and emotion of true affection. These romantic love quotes touch the heart and inspire connection. Explore deep love sayings, short love quotes, romantic quotes for couples and heart-touching love messages. Popular variations include heart touching love quotes for him/her, deep romantic love quotes, short love sayings for couples, love quotes that melt the heart, and emotional love quotes to express feelings.`;

      case 'Motivational':
        return `Motivational Quotes push us to work harder and stay focused on our goals. These inspiring motivational quotes ignite determination, courage and strength. Browse motivational quotes for success, powerful motivation sayings, and never give up messages. Popular variations include motivational quotes for hard times, never give up motivational quotes, powerful quotes to stay motivated, morning motivational quotes for success, and motivational quotes for work and productivity.`;

      case 'Pain':
        return `Pain Quotes offer understanding and strength to those experiencing difficult times. These emotional pain quotes inspire healing and resilience. Discover deep hurt sayings, pain and strength quotes, and moving quotes to overcome pain in life. Popular variations include healing quotes for emotional pain, inspirational quotes about pain and strength, quotes about pain and overcoming hardships, deep painful life quotes with meaning, and encouraging quotes to deal with pain.`;

      case 'Past':
        return `Past Quotes remind us to learn from yesterday and move forward with hope. These quotes about letting go of the past inspire growth and new beginnings. Explore forget the past sayings, move on from past quotes, and learn from past experiences messages. Popular variations include quotes about letting go of the past, inspirational quotes to move on from past, quotes about past and new beginnings, motivational quotes about forgetting the past, and quotes to learn from the past and grow.`;

      case 'Success':
        return `Success Quotes motivate us to work hard, stay disciplined and persist until we win. These quotes about achieving success inspire determination and ambition. Browse success sayings, hard work and success quotes, and motivational quotes from successful people. Popular variations include success quotes for students and young people, quotes about success and hard work, inspirational quotes to achieve success, famous quotes about successful people, and motivational success quotes for daily inspiration.`;

      case 'Time':
        return `Time Quotes remind us that every moment matters and should be used wisely. These inspirational time quotes encourage mindfulness and productivity. Discover value of time sayings, time and life quotes and motivational quotes about time. Popular variations include quotes about time and life value, inspirational quotes about time management, motivational quotes on using time wisely, quotes about passing time and making memories, and value of time quotes for success.`;

      case 'Truth':
        return `Truth Quotes encourage honesty and authenticity in every situation. These quotes about truth highlight the power of integrity and transparency. Explore honest truth sayings, deep truth quotes and motivational quotes about honesty and truth. Popular variations include inspirational quotes about truth and honesty, deep truth quotes about life, powerful quotes about speaking the truth, quotes about truth always winning, and motivational quotes about living with truth.`;

      case 'Work':
        return `Work Quotes inspire us to stay focused, productive and enthusiastic in our job. These motivational work quotes encourage discipline and commitment. Browse hard work sayings, inspirational quotes for employees and focused work messages. Popular variations include motivational quotes for work productivity, quotes about hard work and dedication, positive work quotes to stay focused, inspirational quotes about loving your work, and encouraging quotes for employees at work.`;

      default:
        return `${topic} quotes and sayings to inspire you.`;
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

  // ADD this method
  private onScroll(): void {
    if (!this.hasMore || this.isLoading || !this.scrollEl) return;

    const pos = this.scrollEl.scrollTop + this.scrollEl.clientHeight;
    const max = this.scrollEl.scrollHeight;

    if (pos >= max - this.bottomThreshold) {
      this.page += 1;
      this.getTopicQuotes(+this.activeRoute.snapshot.params['topicId']);
    }
  }


  copyQuote(item: any) {
    const author = item.authorName ? `— ${item.authorName}` : '';
    const base = this.document?.defaultView?.location?.origin || 'https://www.iadorequotes.com';
    //const url = item?.id ? `${base}/quote/${item.id}` : base;
    const url = "https://iadorequotes.com";

    // Add your brand for organic attribution
    const text = `"${item.qoutes}" ${author}\n${url}`;

    this.clipboard.copy(text);
    this.snack.open('Quote copied', 'OK', { duration: 2000 });
  }


  openImageModel(quote: string, author?: string) {
    console.log(author);
    author = author ?? 'Unknown';
    const currentTopicId = this.topicId;
    const dialogRef = this.dialog.open(ImageModelComponent, {
      data: { quote, author, currentTopicId },
      panelClass: 'image-modal',          // <-- use this exact class
      backdropClass: 'custom-backdrop',
      width: 'min(90vw, 600px)',
      maxWidth: '600px',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.keydownEvents()
      .pipe(filter(e => e.key === 'Escape'))
      .subscribe(() => dialogRef.close());
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.scrollEl) {
      this.scrollEl.removeEventListener('scroll', this.scrollHandler);
    }
  }
}
