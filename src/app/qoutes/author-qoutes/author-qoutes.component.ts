import { Component, HostListener, OnInit, Renderer2, Inject } from '@angular/core';
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
import { getAuthorIntro } from '../author-intro';
import { getAuthorMetaDescription } from '../author-meta';


@Component({
  selector: 'app-author-qoutes',
  templateUrl: './author-qoutes.component.html',
  styleUrls: ['./author-qoutes.component.scss']
})
export class AuthorQoutesComponent implements OnInit {

  qoutesList: any = [];
  authorName: string = "";
  page = 0;
  hasMore = true;
  allLoaded = false;
  introText: any;
  isLoading = false;

  // ADD these fields
  private scrollEl?: HTMLElement;
  private readonly bottomThreshold = 150;
  private readonly scrollHandler = () => this.onScroll();

  private subscription: Subscription = new Subscription();

  constructor(
    private activeRoute: ActivatedRoute,
    private apiSer: ApiService,
    private commonSer: CommonService,
    public router: Router,
    private titleService: Title,
    private metaService: Meta,
    private renderer: Renderer2,
    private clipboard: Clipboard,
    private snack: MatSnackBar,
    private dialog: MatDialog,
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
      let authorId: number | null = params.authorId ? Number(params.authorId) : null;
      this.authorName = params.authorName || null;
      if (authorId) {

        this.page = 0;
        this.hasMore = true;
        this.allLoaded = false;        // <— important
        this.qoutesList = [];

        // ADD this tiny reset (inside the params subscription)
        setTimeout(() => {
          if (this.scrollEl) this.scrollEl.scrollTop = 0;
        });

        //SEO
        // ✅ SEO Title
        this.titleService.setTitle(`${this.authorName} Quotes – iAdoreQuotes`);

        // ✅ Meta Description
        const metaDesc = getAuthorMetaDescription(authorId);
        this.metaService.updateTag({ name: 'description', content: metaDesc });

        // ✅ Intro paragraph (hidden)
        this.introText = getAuthorIntro(authorId);

        // ✅ Schema (remove old one if exists first)
        const oldSchema = this.document.getElementById('quoteSchema');
        if (oldSchema) {
          oldSchema.remove();
        }

        const schemaData = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `${this.authorName} Quotes`,
          "description": metaDesc,
          "author": {
            "@type": "Person",
            "name": this.authorName
          },
          "datePublished": '2025-08-01',
          "dateModified": '2025-09-06',
          "url": window.location.href
        };

        const script = this.renderer.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'quoteSchema';
        script.text = JSON.stringify(schemaData);
        this.renderer.appendChild(this.document.head, script);

        this.getAuthorQuotes(authorId);
        // this.commonSer.updateStatsCount();
      }
    })
  }

  getAuthorQuotes(authorId: number) {
    this.isLoading = true;
    const req$ = this.apiSer.getQoutesByAuthorID(authorId, this.page).subscribe((res: any) => {
      if (res && res.length > 0) {
        this.modifyData(res);
        this.qoutesList = this.qoutesList.concat(res);

        // if less than 20 returned => last page
        if (res.length < 20) {
          this.hasMore = false;
          this.allLoaded = true;
        }

        this.page += 1;
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

  getRelatedAuthors(author: string): Array<{ id: number; name: string }> {
    switch (author) {
      case 'Bhagwad Gita':
        return [
          { id: 2, name: 'Buddha' },
          { id: 66, name: 'Mahatma Gandhi' },
          { id: 55, name: 'Thich Nhat Hanh' }
        ];
      case 'Buddha':
        return [
          { id: 66, name: 'Mahatma Gandhi' },
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 11, name: 'Lao Tzu' }
        ];
      case 'Eckhart Tolle':
        return [
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 12, name: 'Osho' },
          { id: 23, name: 'Marcus Aurelius' }
        ];
      case 'Albert Einstein':
        return [
          { id: 27, name: 'Stephen Hawking' },
          { id: 45, name: 'Leonardo da Vinci' },
          { id: 17, name: 'Isaac Newton' }
        ];
      case 'Elon Musk':
        return [
          { id: 27, name: 'Stephen Hawking' },
          { id: 28, name: 'Thomas Edison' },
          { id: 30, name: 'Abraham Lincoln' }
        ];
      case 'Steve Jobs':
        return [
          { id: 45, name: 'Leonardo da Vinci' },
          { id: 28, name: 'Thomas Edison' },
          { id: 5, name: 'Elon Musk' }
        ];
      case 'Steve Harvey':
        return [
          { id: 8, name: 'Michael Jordan' },
          { id: 9, name: 'Bruce Lee' },
          { id: 59, name: 'Tony Robbins' }
        ];
      case 'Michael Jordan':
        return [
          { id: 9, name: 'Bruce Lee' },
          { id: 5, name: 'Elon Musk' },
          { id: 30, name: 'Abraham Lincoln' }
        ];
      case 'Bruce Lee':
        return [
          { id: 9, name: 'Michael Jordan' },
          { id: 38, name: 'Donald Trump' },
          { id: 59, name: 'Tony Robbins' }
        ];
      case 'Dalai Lama':
        return [
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 2, name: 'Buddha' },
          { id: 12, name: 'Osho' }
        ];
      case 'Lao Tzu':
        return [
          { id: 2, name: 'Buddha' },
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 23, name: 'Marcus Aurelius' }
        ];
      case 'Osho':
        return [
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 66, name: 'Mahatma Gandhi' },
          { id: 2, name: 'Buddha' }
        ];
      case 'Kabir':
        return [
          { id: 2, name: 'Buddha' },
          { id: 15, name: 'Nelson Mandela' },
          { id: 66, name: 'Mahatma Gandhi' }
        ];
      case 'Barack Obama':
        return [
          { id: 30, name: 'Abraham Lincoln' },
          { id: 15, name: 'Nelson Mandela' },
          { id: 66, name: 'Mahatma Gandhi' }
        ];
      case 'Nelson Mandela':
        return [
          { id: 66, name: 'Mahatma Gandhi' },
          { id: 30, name: 'Abraham Lincoln' },
          { id: 55, name: 'Thich Nhat Hanh' }
        ];
      case 'Arnold Schwarzenegger':
        return [
          { id: 8, name: 'Michael Jordan' },
          { id: 30, name: 'Abraham Lincoln' },
          { id: 59, name: 'Tony Robbins' }
        ];
      case 'Isaac Newton':
        return [
          { id: 27, name: 'Stephen Hawking' },
          { id: 45, name: 'Leonardo da Vinci' },
          { id: 4, name: 'Albert Einstein' }
        ];
      case 'Benjamin Franklin':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 28, name: 'Thomas Edison' },
          { id: 30, name: 'Abraham Lincoln' }
        ];
      case 'Charles Darwin':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 20, name: 'Christopher Columbus' },
          { id: 37, name: 'Napoleon Hill' }
        ];
      case 'Christopher Columbus':
        return [
          { id: 30, name: 'Abraham Lincoln' },
          { id: 80, name: 'Benjamin Disraeli' },
          { id: 17, name: 'Isaac Newton' }
        ];
      case 'George Washington':
        return [
          { id: 30, name: 'Abraham Lincoln' },
          { id: 14, name: 'Barack Obama' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'John Eliot':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' },
          { id: 64, name: 'Epictetus' }
        ];
      case 'Marcus Aurelius':
        return [
          { id: 53, name: 'Seneca' },
          { id: 64, name: 'Epictetus' },
          { id: 42, name: 'Socrates' }
        ];
      case 'Martin Luther':
        return [
          { id: 71, name: 'Helen Keller' },
          { id: 25, name: 'Mother Teresa' },
          { id: 57, name: 'Carl Jung' }
        ];
      case 'Mother Teresa':
        return [
          { id: 25, name: 'Martin Luther' },
          { id: 71, name: 'Helen Keller' },
          { id: 66, name: 'Mahatma Gandhi' }
        ];

      case 'Nikola Tesla':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 27, name: 'Stephen Hawking' },
          { id: 28, name: 'Thomas Edison' }
        ];
      case 'Stephen Hawking':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 17, name: 'Isaac Newton' },
          { id: 27, name: 'Nikola Tesla' }
        ];
      case 'Thomas Edison':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 27, name: 'Stephen Hawking' },
          { id: 5, name: 'Elon Musk' }
        ];
      case 'Yogi Berra':
        return [
          { id: 8, name: 'Michael Jordan' },
          { id: 59, name: 'Tony Robbins' },
          { id: 37, name: 'Napoleon Hill' }
        ];
      case 'Abraham Lincoln':
        return [
          { id: 14, name: 'Barack Obama' },
          { id: 15, name: 'Nelson Mandela' },
          { id: 30, name: 'George Washington' }
        ];
      case 'Johann Wolfgang von Goethe':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Byron Pulsifer':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' },
          { id: 44, name: 'Brian Tracy' }
        ];
      case 'Aristotle':
        return [
          { id: 42, name: 'Socrates' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Wayne Dyer':
        return [
          { id: 12, name: 'Osho' },
          { id: 59, name: 'Tony Robbins' },
          { id: 88, name: 'Pema Chodron' }
        ];
      case 'William Shakespeare':
        return [
          { id: 35, name: 'Johann Wolfgang von Goethe' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Publilius Syrus':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Napoleon Hill':
        return [
          { id: 12, name: 'Osho' },
          { id: 59, name: 'Tony Robbins' },
          { id: 8, name: 'Michael Jordan' }
        ];
      case 'Donald Trump':
        return [
          { id: 14, name: 'Barack Obama' },
          { id: 30, name: 'Abraham Lincoln' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'Confucius':
        return [
          { id: 11, name: 'Lao Tzu' },
          { id: 2, name: 'Buddha' },
          { id: 55, name: 'Thich Nhat Hanh' }
        ];
      case 'Sigmund Freud':
        return [
          { id: 57, name: 'Carl Jung' },
          { id: 59, name: 'Tony Robbins' },
          { id: 88, name: 'Pema Chodron' }
        ];
      case 'Chinese Proverb':
        return [
          { id: 11, name: 'Lao Tzu' },
          { id: 2, name: 'Buddha' },
          { id: 39, name: 'Confucius' }
        ];
      case 'Socrates':
        return [
          { id: 33, name: 'Aristotle' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Pearl Buck':
        return [
          { id: 49, name: 'Maya Angelou' },
          { id: 25, name: 'Mother Teresa' },
          { id: 71, name: 'Helen Keller' }
        ];
      case 'Brian Tracy':
        return [
          { id: 59, name: 'Tony Robbins' },
          { id: 37, name: 'Napoleon Hill' },
          { id: 8, name: 'Michael Jordan' }
        ];
      case 'Leonardo da Vinci':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 27, name: 'Stephen Hawking' },
          { id: 17, name: 'Isaac Newton' }
        ];
      case 'John Lennon':
        return [
          { id: 49, name: 'Maya Angelou' },
          { id: 56, name: 'Albert Schweitzer' },
          { id: 46, name: 'Ralph Emerson' }
        ];
      case 'Ralph Emerson':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Sophocles':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Maya Angelou':
        return [
          { id: 49, name: 'Pearl Buck' },
          { id: 25, name: 'Mother Teresa' },
          { id: 71, name: 'Helen Keller' }
        ];
      case 'Winston Churchill':
        return [
          { id: 30, name: 'Abraham Lincoln' },
          { id: 14, name: 'Barack Obama' },
          { id: 15, name: 'Nelson Mandela' }
        ];

      case 'Eleanor Roosevelt':
        return [
          { id: 15, name: 'Nelson Mandela' },
          { id: 14, name: 'Barack Obama' },
          { id: 25, name: 'Mother Teresa' }
        ];
      case 'Richard Bach':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Seneca':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' },
          { id: 42, name: 'Socrates' }
        ];
      case 'Napoleon Bonaparte':
        return [
          { id: 15, name: 'Nelson Mandela' },
          { id: 14, name: 'Barack Obama' },
          { id: 30, name: 'Abraham Lincoln' }
        ];
      case 'Thich Nhat Hanh':
        return [
          { id: 2, name: 'Buddha' },
          { id: 66, name: 'Mahatma Gandhi' },
          { id: 10, name: 'Dalai Lama' }
        ];
      case 'Albert Schweitzer':
        return [
          { id: 25, name: 'Mother Teresa' },
          { id: 71, name: 'Helen Keller' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'Carl Jung':
        return [
          { id: 57, name: 'Sigmund Freud' },
          { id: 2, name: 'Buddha' },
          { id: 12, name: 'Osho' }
        ];
      case 'Anais Nin':
        return [
          { id: 49, name: 'Maya Angelou' },
          { id: 25, name: 'Mother Teresa' },
          { id: 71, name: 'Helen Keller' }
        ];
      case 'Tony Robbins':
        return [
          { id: 37, name: 'Napoleon Hill' },
          { id: 44, name: 'Brian Tracy' },
          { id: 30, name: 'Abraham Lincoln' }
        ];
      case 'Oscar Wilde':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Gloria Steinem':
        return [
          { id: 25, name: 'Mother Teresa' },
          { id: 51, name: 'Eleanor Roosevelt' },
          { id: 75, name: 'Oprah Winfrey' }
        ];
      case 'Bernard Shaw':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Pablo Picasso':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 64, name: 'Epictetus' },
          { id: 23, name: 'Marcus Aurelius' }
        ];
      case 'Epictetus':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' },
          { id: 33, name: 'Aristotle' }
        ];
      case 'Ralph Waldo Emerson':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' },
          { id: 35, name: 'William Shakespeare' }
        ];
      case 'Mahatma Gandhi':
        return [
          { id: 2, name: 'Buddha' },
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'Voltaire':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Virgil':
        return [
          { id: 67, name: 'Voltaire' },
          { id: 35, name: 'William Shakespeare' },
          { id: 85, name: 'Mark Twain' }
        ];
      case 'Elbert Hubbard':
        return [
          { id: 53, name: 'Seneca' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 35, name: 'William Shakespeare' }
        ];
      case 'Albert Camus':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' },
          { id: 64, name: 'Epictetus' }
        ];
      case 'Helen Keller':
        return [
          { id: 25, name: 'Mother Teresa' },
          { id: 51, name: 'Eleanor Roosevelt' },
          { id: 49, name: 'Maya Angelou' }
        ];
      case 'Honore de Balzac':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Ovid':
        return [
          { id: 67, name: 'Voltaire' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 35, name: 'William Shakespeare' }
        ];
      case 'Jim Rohn':
        return [
          { id: 37, name: 'Napoleon Hill' },
          { id: 44, name: 'Brian Tracy' },
          { id: 59, name: 'Tony Robbins' }
        ];
      case 'Oprah Winfrey':
        return [
          { id: 51, name: 'Eleanor Roosevelt' },
          { id: 49, name: 'Maya Angelou' },
          { id: 25, name: 'Mother Teresa' }
        ];

      case 'Anatole France':
        return [
          { id: 51, name: 'Eleanor Roosevelt' },
          { id: 25, name: 'Mother Teresa' },
          { id: 75, name: 'Oprah Winfrey' }
        ];
      case 'Blaise Pascal':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Peter Drucker':
        return [
          { id: 2, name: 'Buddha' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 66, name: 'Mahatma Gandhi' }
        ];
      case 'Thomas Jefferson':
        return [
          { id: 30, name: 'Abraham Lincoln' },
          { id: 14, name: 'Barack Obama' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'Benjamin Disraeli':
        return [
          { id: 30, name: 'Abraham Lincoln' },
          { id: 14, name: 'Barack Obama' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'Arthur Conan Doyle':
        return [
          { id: 27, name: 'Stephen Hawking' },
          { id: 4, name: 'Albert Einstein' },
          { id: 45, name: 'Leonardo da Vinci' }
        ];
      case 'Og Mandino':
        return [
          { id: 37, name: 'Napoleon Hill' },
          { id: 44, name: 'Brian Tracy' },
          { id: 59, name: 'Tony Robbins' }
        ];
      case 'Marie Curie':
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 27, name: 'Stephen Hawking' },
          { id: 17, name: 'Isaac Newton' }
        ];
      case 'Kahlil Gibran':
        return [
          { id: 49, name: 'Maya Angelou' },
          { id: 56, name: 'Albert Schweitzer' },
          { id: 71, name: 'Helen Keller' }
        ];
      case 'Mark Twain':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Walter Lippmann':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' },
          { id: 53, name: 'Seneca' }
        ];
      case 'Robert Stevenson':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 64, name: 'Epictetus' }
        ];
      case 'Pema Chodron':
        return [
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 2, name: 'Buddha' },
          { id: 66, name: 'Mahatma Gandhi' }
        ];
      case 'Henry Thoreau':
        return [
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' },
          { id: 64, name: 'Epictetus' }
        ];
      case 'Catherine Pulsifer':
        return [
          { id: 32, name: 'Byron Pulsifer' },
          { id: 85, name: 'Mark Twain' },
          { id: 49, name: 'Maya Angelou' }
        ];
      case 'Daisaku Ikeda':
        return [
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 2, name: 'Buddha' },
          { id: 12, name: 'Osho' }
        ];
      case 'Rene Descartes':
        return [
          { id: 33, name: 'Aristotle' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'John Dewey':
        return [
          { id: 33, name: 'Aristotle' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 53, name: 'Seneca' }
        ];
      case 'George Orwell':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 85, name: 'Mark Twain' },
          { id: 23, name: 'Marcus Aurelius' }
        ];
      case 'Mohandas Gandhi':
        return [
          { id: 2, name: 'Buddha' },
          { id: 55, name: 'Thich Nhat Hanh' },
          { id: 15, name: 'Nelson Mandela' }
        ];
      case 'Dale Carnegie':
        return [
          { id: 59, name: 'Tony Robbins' },
          { id: 37, name: 'Napoleon Hill' },
          { id: 44, name: 'Brian Tracy' }
        ];
      case 'William James':
        return [
          { id: 53, name: 'Seneca' },
          { id: 23, name: 'Marcus Aurelius' },
          { id: 35, name: 'William Shakespeare' }
        ];
      case 'Thornton Wilder':
        return [
          { id: 35, name: 'William Shakespeare' },
          { id: 85, name: 'Mark Twain' },
          { id: 23, name: 'Marcus Aurelius' }
        ];
      case 'Zig Ziglar':
        return [
          { id: 59, name: 'Tony Robbins' },
          { id: 37, name: 'Napoleon Hill' },
          { id: 44, name: 'Brian Tracy' }
        ];
      case 'Ella Fitzgerald':
        return [
          { id: 49, name: 'Maya Angelou' },
          { id: 85, name: 'Mark Twain' },
          { id: 71, name: 'Helen Keller' }
        ];
      case 'Jean Lacordaire':
        return [
          { id: 49, name: 'Maya Angelou' },
          { id: 71, name: 'Helen Keller' },
          { id: 25, name: 'Mother Teresa' }
        ];

      default:
        return [
          { id: 4, name: 'Albert Einstein' },
          { id: 2, name: 'Buddha' },
          { id: 66, name: 'Mahatma Gandhi' }
        ];
    }
  }

  // ADD this method
  private onScroll(): void {
    if (!this.hasMore || this.isLoading || !this.scrollEl) return;

    const pos = this.scrollEl.scrollTop + this.scrollEl.clientHeight;
    const max = this.scrollEl.scrollHeight;

    if (pos >= max - this.bottomThreshold) {
      // this.page += 1;
      this.getAuthorQuotes(+this.activeRoute.snapshot.params['authorId']);
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
    const currentTopicId = null;
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