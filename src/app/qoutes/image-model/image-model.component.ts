// image-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RandomImageService, SizeKey } from '../../utility/random-image-picker.service';

type DialogData = {
  quote: string;
  author: string;
};

@Component({
  selector: 'app-image-model',
  templateUrl: './image-model.component.html',
  styleUrls: ['./image-model.component.scss'],
})
export class ImageModelComponent {
  quote = '';
  author = '';

  // state
  keys: string[] = [];           // e.g., ['i012','i077','i099','i140','i003']
  thumbs: string[] = [];         // resolved thumb URLs
  selectedIdx = 0;               // index in keys/thumbs
  mode: SizeKey = '1080';        // '1080' | '1080x1920'
  bigUrl = '';                   // currently displayed HD url
  loading = true;

  // --- add with other fields ---
  private preloadTimers = new Map<number, any>();
  private inflight = new Map<string, Promise<void>>();

  // cache resolved HD URLs to avoid re-downloading
  private hdCache = new Map<string, string>(); // key|size -> url

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<ImageModelComponent>,
    private rand: RandomImageService
  ) {
    this.quote = data.quote;
    this.author = data.author;
    this.init();
  }

  async init() {
    this.loading = true;
    // get 5 random images (thumbs + hd for first)
    const { keys, thumbUrls, firstHdUrl } = await this.rand.getFiveRandom();
    this.keys = keys;
    this.thumbs = thumbUrls;

    this.selectedIdx = 0;
    this.mode = '1080';
    this.bigUrl = firstHdUrl;
    this.hdCache.set(`${this.keys[0]}|1080`, firstHdUrl);
    this.loading = false;
  }

  async onPick(i: number) {
    if (this.selectedIdx === i) return;
    this.selectedIdx = i;
    await this.loadSelected(this.mode);
  }

  async toggleStory() {
    this.mode = this.mode === '1080' ? '1080x1920' : '1080';
    await this.loadSelected(this.mode);
  }

  private async loadSelected(size: SizeKey) {
    this.loading = true;
    const key = this.keys[this.selectedIdx];
    const cacheKey = `${key}|${size}`;
    if (this.hdCache.has(cacheKey)) {
      this.bigUrl = this.hdCache.get(cacheKey)!;
      this.loading = false;
      return;
    }
    // show thumb immediately while HD loads
    this.bigUrl = this.thumbs[this.selectedIdx];
    const hd = await this.rand.urlFor(key, size);
    this.hdCache.set(cacheKey, hd);
    this.bigUrl = hd;
    this.loading = false;
  }

  // —— actions ——
  download() {
    // download current bigUrl as file
    const a = document.createElement('a');
    a.href = this.bigUrl;
    a.download = `quote-${this.mode}.webp`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async share() {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({
          title: 'Quote',
          text: `“${this.quote}” — ${this.author}`,
          url: this.bigUrl,
        });
        return;
      }
    } catch { }
    // fallback: open a small share menu popup (X/FB/WhatsApp)
    const encoded = encodeURIComponent(this.bigUrl);
    const text = encodeURIComponent(`“${this.quote}” — ${this.author}`);
    const links = [
      `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      `https://api.whatsapp.com/send?text=${text}%20${encoded}`
    ];
    window.open(links[0], '_blank');
  }

  close() { this.ref.close(); }

  isActive(i: number) { return this.selectedIdx === i; }

  // Preload HD for hovered thumb (and neighbors)
  prewarm(i: number, size: SizeKey = this.mode) {
    const key = this.keys[i];
    if (!key) return;

    const cacheKey = `${key}|${size}`;
    if (this.hdCache.has(cacheKey) || this.inflight.has(cacheKey)) return;

    // small delay to avoid over-preloading
    const timer = setTimeout(async () => {
      try {
        const hdUrl = await this.rand.urlFor(key, size);
        // keep a single inflight task per key|size
        const task = this.preloadImage(hdUrl).then(() => {
          this.hdCache.set(cacheKey, hdUrl);
        }).finally(() => this.inflight.delete(cacheKey));
        this.inflight.set(cacheKey, task);
        await task;

        // (optional) also prewarm immediate neighbors for snappier feel
        [i - 1, i + 1].forEach(n => {
          if (n < 0 || n >= this.keys.length) return;
          this.prewarm(n, size);
        });
      } catch { /* swallow */ }
    }, 120);

    this.preloadTimers.set(i, timer);
  }

  cancelPrewarm(i: number) {
    const t = this.preloadTimers.get(i);
    if (t) {
      clearTimeout(t);
      this.preloadTimers.delete(i);
    }
  }

  // Utility: actually load into browser cache
  private preloadImage(src: string): Promise<void> {
    return new Promise(resolve => {
      const img = new Image();
      (img as any).decoding = 'async';
      (img as any).loading = 'eager';
      img.onload = () => resolve();
      img.onerror = () => resolve(); // fail-soft
      img.src = src;
    });
  }
}
