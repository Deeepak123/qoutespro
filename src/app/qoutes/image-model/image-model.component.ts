// image-modal.component.ts
import { Component, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RandomImageService, SizeKey } from '../../utility/random-image-picker.service';
import html2canvas from 'html2canvas';

type DialogData = { quote: string; author: string; currentTopicId: number };


@Component({
  selector: 'app-image-model',
  templateUrl: './image-model.component.html',
  styleUrls: ['./image-model.component.scss'],
})
export class ImageModelComponent {
  @ViewChild('captureBox', { static: false }) captureBox!: ElementRef<HTMLElement>;

  private _iosOverlayEl: HTMLDivElement | null = null;
  private _iosOverlayImg: HTMLImageElement | null = null;

  quote = '';
  author = '';
  topicId: number;
  loading = true;
  capturing = false;

  keys: string[] = [];
  thumbs: string[] = [];
  selectedIdx = 0;
  mode: SizeKey = '1080';        // '1080' | '1080x1920'
  bigUrl = '';

  private preloadTimers = new Map<number, number>();
  private inflight = new Map<string, Promise<void>>();
  private hdCache = new Map<string, string>(); // key|size -> url

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<ImageModelComponent>,
    private rand: RandomImageService
  ) {
    this.quote = data.quote;
    this.author = data.author;
    this.topicId = data.currentTopicId;
    this.init();
  }

  private async init() {
    this.loading = true;
    const { keys, thumbUrls, firstHdUrl } = await this.rand.getFiveRandom(this.topicId);
    this.keys = keys;
    this.thumbs = thumbUrls;
    this.selectedIdx = 0;
    this.mode = '1080';
    this.bigUrl = firstHdUrl;
    this.hdCache.set(`${this.keys[0]}|1080`, firstHdUrl);
    this.loading = false;
  }

  reelView() {
    this.mode = '1080x1920';
  }

  async onPick(i: number) {
    if (this.selectedIdx === i) return;
    this.selectedIdx = i;
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
    this.bigUrl = this.thumbs[this.selectedIdx]; // temp preview
    const hd = await this.rand.urlFor(key, size);
    this.hdCache.set(cacheKey, hd);
    this.bigUrl = hd;
    this.loading = false;
  }

  // ===== Capture helpers =====
  private addNoTooltipClass() { document.documentElement.classList.add('no-tooltips'); }
  private removeNoTooltipClass() { document.documentElement.classList.remove('no-tooltips'); }

  // Add this helper
  private async waitForFonts(maxMs = 2000): Promise<void> {
    try {
      const fs: any = (document as any).fonts;
      if (!fs) return;                    // no FontFaceSet API
      if (fs.status === 'loaded') return; // already done

      const ready: Promise<any> = fs.ready instanceof Promise ? fs.ready : Promise.resolve();
      // race with a timeout so we never hang here
      await Promise.race([
        ready.catch(() => { }),
        new Promise(r => setTimeout(r, maxMs))
      ]);
    } catch { }
  }

  // Replace your current safeCapture with this version
  private async safeCapture<T>(fn: () => Promise<T>): Promise<T> {
    this.capturing = true;
    this.addNoTooltipClass();
    try {
      // 1) time-box fonts (iOS can hang here)
      await this.waitForFonts(2000);

      // 2) let layout settle before capture (helps Safari)
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      // 3) do the actual capture
      return await fn();
    } finally {
      this.removeNoTooltipClass();
      this.capturing = false;
    }
  }


  // ===== Download (uses current preview size; iOS-friendly) =====
  async downloadSquare() {
    const isIOS = this.isIOS();
    const isAndroid = this.isAndroid();

    if (!isIOS && !isAndroid) {
      // your existing desktop/Android flow
      console.log(this.mode);
      // const blob = await this.safeCapture(() => this.captureFixed('1080'));
      const blob = await this.safeCapture(() => this.captureFixed(this.mode));

      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'quote-1080x1080.png'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return;
    }

    // iOS: render to canvas to match CSS, then show as PNG to long-press/save
    const blob = await this.renderCardOnIOS('1080');
    if (!blob) { alert('Could not render image on iPhone.'); return; }
    const blobUrl = URL.createObjectURL(blob);
    this.presentIOSOverlayBlob(blobUrl, 'Tap & hold the image → Save Image');
  }


  private async renderCardOnIOS(size: SizeKey): Promise<Blob | null> {
    const target = size === '1080x1920' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 };

    const key = this.keys[this.selectedIdx];
    const cacheKey = `${key}|${size}`;
    let bgUrl = this.hdCache.get(cacheKey) || await this.rand.urlFor(key, size);
    this.hdCache.set(cacheKey, bgUrl);

    const bg = await this.loadImageCORS(bgUrl);
    if (!bg) return null;

    const cv = document.createElement('canvas');
    cv.width = target.w; cv.height = target.h;
    const ctx = cv.getContext('2d')!;

    // draw bg
    this.drawCover(ctx, bg, target.w, target.h);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 0, target.w, target.h);

    // vignette
    const grad = ctx.createLinearGradient(0, 0, 0, target.h);
    grad.addColorStop(0.00, 'rgba(0,0,0,0.30)');
    grad.addColorStop(0.30, 'rgba(0,0,0,0.10)');
    grad.addColorStop(0.60, 'rgba(0,0,0,0.10)');
    grad.addColorStop(1.00, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, target.w, target.h);

    const centerX = target.w / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';

    // === QUOTE ===
    const quote = `“${this.quote}”`;
    const qClass = this.getQuoteClass();
    // add +2px to exporting sizes
    const qSize = qClass === 'quote-lg' ? 60 : qClass === 'quote-md' ? 46 : 36;
    const quoteFontFamily = `'Q ExBold', ui-serif, Georgia, "Times New Roman", serif`;
    const quoteWeight = 800;
    const quoteLSpx = 0.2;
    const quoteLH = Math.round(qSize * 1.25);

    // NO shadow for quote now
    ctx.shadowBlur = 0;
    ctx.font = `${quoteWeight} ${qSize}px ${quoteFontFamily}`;
    const maxQuoteW = Math.round(target.w * 0.88);
    const qLines = this.wrapLinesWithTracking(ctx, quote, maxQuoteW, quoteLSpx);

    let y = Math.round(target.h * 0.40) - Math.round(((qLines.length - 1) * quoteLH) / 2);
    for (const ln of qLines) {
      this.fillTextWithTracking(ctx, ln, centerX, y, quoteLSpx);
      y += quoteLH;
    }

    // === AUTHOR ===
    const authorRaw = this.author ? `${this.author}` : '';
    const author = authorRaw.toUpperCase();
    const authorFontFamily = `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
    const authorSize = Math.min(19, Math.max(15, Math.round(qSize * 0.48)));
    const authorWeight = 700;
    const authorLSEm = 0.15;
    const authorLSpx = authorLSEm * authorSize;

    ctx.font = `${authorWeight} ${authorSize}px ${authorFontFamily}`;
    y += Math.round(qSize * 0.60);
    this.fillTextWithTracking(ctx, author, centerX, y, authorLSpx);

    // === BRAND ===
    const brand = 'iAdoreQuotes.com';
    const brandSize = 30;
    const brandWeight = 700;
    const brandFontFamily = authorFontFamily;
    const brandLSEm = 0.06;
    const brandLSpx = brandLSEm * brandSize;

    ctx.font = `${brandWeight} ${brandSize}px ${brandFontFamily}`;
    ctx.fillStyle = '#ffffffd9';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    // moved UP: 20px margin-bottom instead of flush with bottom
    this.fillTextWithTracking(ctx, brand, centerX, target.h - 52, brandLSpx);

    ctx.shadowBlur = 0;

    return await new Promise<Blob | null>(res => cv.toBlob(b => res(b), 'image/png', 1));
  }



  private loadImageCORS(src: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      (img as any).decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // object-fit: cover
  private drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const r = Math.max(W / iw, H / ih);
    const nw = Math.round(iw * r);
    const nh = Math.round(ih * r);
    const ox = Math.round((W - nw) / 2);
    const oy = Math.round((H - nh) / 2);
    ctx.drawImage(img, ox, oy, nw, nh);
  }

  // measure with tracking (letter-spacing) by adding (n-1)*ls
  private measureWithTracking(ctx: CanvasRenderingContext2D, text: string, lsPx: number): number {
    if (!text) return 0;
    return ctx.measureText(text).width + Math.max(0, text.length - 1) * lsPx;
  }

  // draw centered text with tracking
  private fillTextWithTracking(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number, lsPx: number) {
    if (!text) return;
    // draw one char at a time so tracking matches CSS letter-spacing
    const total = this.measureWithTracking(ctx, text, lsPx);
    let x = centerX - total / 2;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      ctx.fillText(ch, x + ctx.measureText(ch).width / 2, y); // per-char center align
      x += ctx.measureText(ch).width + lsPx;
    }
  }

  // wrap respecting tracking width
  private wrapLinesWithTracking(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lsPx: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';

    const widthOf = (s: string) => this.measureWithTracking(ctx, s, lsPx);

    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (widthOf(test) <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        // if a single long word still exceeds max, hard-split by chars
        if (widthOf(w) > maxWidth) {
          let chunk = '';
          for (const ch of w) {
            const t = chunk + ch;
            if (widthOf(t) <= maxWidth) chunk = t;
            else { if (chunk) lines.push(chunk); chunk = ch; }
          }
          line = chunk;
        } else {
          line = w;
        }
      }
    }
    if (line) lines.push(line);
    return lines;
  }










  private presentIOSOverlayBlob(blobUrl: string, hint: string) {
    const wrap = document.createElement('div');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.tabIndex = -1;
    wrap.style.cssText = `
      position: fixed; inset: 0; background: #fff; z-index: 2147483647;
      display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px;
      -webkit-touch-callout: default; /* ensure long-press menu appears */
      touch-action: manipulation;
    `;

    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;gap:8px;align-items:center;';

    const msg = document.createElement('div');
    msg.textContent = hint || 'Long-press → Save Image';
    msg.style.cssText = 'font:14px -apple-system,system-ui;color:#444;';

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.style.cssText = 'font:14px -apple-system;padding:6px 10px;border-radius:10px;';
    close.onclick = () => { try { URL.revokeObjectURL(blobUrl); } catch { }; wrap.remove(); };

    bar.appendChild(msg);
    bar.appendChild(close);

    const img = document.createElement('img');
    img.src = blobUrl;              // <-- Blob URL inside <img> is allowed on iOS
    img.alt = 'quote image';
    img.style.cssText = `
      max-width: 100%; height: auto; display: block;
      -webkit-user-select: none; user-select: none;
    `;

    wrap.appendChild(bar);
    wrap.appendChild(img);
    document.body.appendChild(wrap);

    // Focus overlay to avoid ARIA/focus issues
    setTimeout(() => wrap.focus(), 0);
  }



  private ensurePNG(blob: Blob): Promise<Blob> {
    if (blob.type === 'image/png') return Promise.resolve(blob);
    return new Promise(resolve => {
      const img = new Image();
      (img as any).decoding = 'async';
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        cv.getContext('2d')!.drawImage(img, 0, 0);
        cv.toBlob(b => resolve(b || blob), 'image/png', 1);
      };
      img.onerror = () => resolve(blob);
      img.crossOrigin = 'anonymous';
      img.src = URL.createObjectURL(blob);
    });
  }


  private async ensureImageReady(src: string): Promise<void> {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';   // <-- set BEFORE src
      (img as any).decoding = 'async';
      img.onload = () => resolve();
      img.onerror = () => resolve();   // don't hang; fail soft
      img.src = src;                   // <-- googleapis URL with ?alt=media
    });
  }



  // ===== Share (simple link share fallback) =====
  // Add this small helper anywhere in the class
  // 1) Keep (or add) this helper:
  private getShareUrl(): string {
    // Prefer canonical if you set it on topic pages; else current URL
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    return link?.href || location.href;
  }

  // (optional) if you built deep links earlier, call your makeDeepLink() here instead
  // const url = this.makeDeepLink();


  // 2) Replace share() with this version:
  async share() {
    const n: any = navigator;

    // Build the link you want attached
    const url = this.getShareUrl(); // or: const url = this.makeDeepLink();
    const quoteText = `“${this.quote}” — ${this.author}`;
    const combinedText = `${quoteText}\n${url}`;

    // Try to prepare a PNG for mobile share (nice-to-have)
    let imgBlob: Blob | null = null;
    try {
      if (this.isIOS() || this.isAndroid()) {
        imgBlob = await this.renderCardOnIOS(this.mode); // returns PNG
      } else {
        const captured = await this.safeCapture(() => this.captureFixed(this.mode));
        if (captured) imgBlob = await this.ensurePNG(captured);
      }
    } catch { imgBlob = null; }

    // A) Best case: Web Share + file support → share PNG + text (text includes URL)
    if (imgBlob && n?.share) {
      try {
        const file = new File([imgBlob], 'iAdoreQuotes.png', { type: 'image/png' });
        if (!n.canShare || n.canShare({ files: [file] })) {
          await n.share({
            files: [file],
            title: 'iAdoreQuotes',
            text: combinedText, // <- include URL here; many apps ignore separate `url` with files
            // url: url,        // optional; often ignored when files present
          });
          return;
        }
      } catch { /* fall through */ }
    }

    // B) Web Share without files → text + URL
    if (n?.share) {
      try {
        await n.share({ title: 'iAdoreQuotes', text: combinedText /*, url */ });
        return;
      } catch { /* fall through */ }
    }

    // C) Clipboard fallback → text + URL
    try {
      await navigator.clipboard.writeText(combinedText);
      alert('Link copied to clipboard! Paste it anywhere to share.');
    } catch {
      //prompt('Copy this to share:', combinedText);
    }
  }



  // ===== UI helpers used in template =====
  close() { this.ref.close(); }
  isActive(i: number) { return this.selectedIdx === i; }

  // Preload HD image on hover/focus
  prewarm(i: number, size: SizeKey = this.mode) {
    const key = this.keys[i]; if (!key) return;
    const cacheKey = `${key}|${size}`;
    if (this.hdCache.has(cacheKey) || this.inflight.has(cacheKey)) return;

    const timer = window.setTimeout(async () => {
      try {
        const hdUrl = await this.rand.urlFor(key, size);
        const task: Promise<void> = this.preloadImage(hdUrl).then(() => {
          this.hdCache.set(cacheKey, hdUrl);
        }).finally(() => this.inflight.delete(cacheKey));
        this.inflight.set(cacheKey, task);
        await task;
      } catch { }
    }, 120);
    this.preloadTimers.set(i, timer);
  }

  cancelPrewarm(i: number) {
    const t = this.preloadTimers.get(i);
    if (t) { clearTimeout(t); this.preloadTimers.delete(i); }
  }

  private preloadImage(src: string): Promise<void> {
    return new Promise(resolve => {
      const img = new Image();
      (img as any).decoding = 'async';
      (img as any).loading = 'eager';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  getQuoteClass(): string {
    const len = this.quote.length;
    if (len < 90) return 'quote-lg';
    if (len < 160) return 'quote-md';
    return 'quote-sm';
  }

  // ===== iOS + capture utilities =====
  // private isIOS(): boolean {
  //   const ua = navigator.userAgent || '';
  //   const iPadOS13 = navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1;
  //   return /iPhone|iPad|iPod/i.test(ua) || iPadOS13;
  // }

  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent || '');
  }

  private isIOS(): boolean {
    const n = navigator as any;

    const ua = n.userAgent || '';
    const platform = n.platform || '';
    const vendor = n.vendor || '';
    const maxTP = n.maxTouchPoints || 0;

    // 1) Hard exclude Android early
    if (/Android/i.test(ua)) return false;

    // 2) Classic iOS (older iPhones/iPads/iPods)
    if (/iPhone|iPad|iPod/i.test(ua)) return true;

    // 3) iPadOS 13+ often reports like a Mac
    //    Safari/Chrome on iPad: platform=MacIntel, vendor contains "Apple", has touch
    if (platform === 'MacIntel' && maxTP > 1 && /Apple/i.test(vendor)) return true;

    // 4) Some webviews/PWAs strip vendor; rely on WebKit + touch
    //    (Desktop Safari won't have Mobile+touch together)
    if (/AppleWebKit/i.test(ua) && /Mobile/i.test(ua) && maxTP > 0) return true;

    // 5) Some environments still expose platform as iPhone/iPad even with weird UA
    if (/iPhone|iPad/i.test(platform)) return true;

    return false;
  }


  private async buildOffscreenNode(targetW: number, targetH: number, size: SizeKey): Promise<HTMLElement> {
    const src = this.captureBox?.nativeElement;
    if (!src) throw new Error('captureBox missing');

    const key = this.keys[this.selectedIdx];
    const cacheKey = `${key}|${size}`;
    let hdUrl = this.hdCache.get(cacheKey);
    if (!hdUrl) {
      hdUrl = await this.rand.urlFor(key, size);
      this.hdCache.set(cacheKey, hdUrl);
    }

    const clone = src.cloneNode(true) as HTMLElement;

    // mark export mode
    if (this.mode == '1080') {
      console.log("exporting");
      clone.classList.add('exporting');
    } else {
      console.log("exportingreel");
      clone.classList.add('exportingreel');
    }

    Object.assign(clone.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: `${targetW}px`,
      height: `${targetH}px`,
      maxHeight: 'none',
      margin: '0',
      opacity: '1',
      zIndex: '-1',
      aspectRatio: 'auto',   // 👈 override CSS aspect-ratio
    });

    // also strip any aspect-ratio classes if needed
    clone.classList.remove('square', 'story');

    const bg = clone.querySelector('.bg') as HTMLElement | null;
    if (bg) bg.style.backgroundImage = `url(${hdUrl})`;

    const sp = clone.querySelector('.spinner');
    if (sp && sp.parentNode) sp.parentNode.removeChild(sp);

    document.body.appendChild(clone);

    await this.ensureImageReady(hdUrl);
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;

    return clone;
  }



  private async captureFixed(size: SizeKey): Promise<Blob | null> {
    const target = size === '1080x1920' ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 };
    const node = await this.buildOffscreenNode(target.w, target.h, size);

    try {
      const canvas = await html2canvas(node, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: 1,
        width: target.w,
        height: target.h,
        logging: false,
      });

      try { canvas.getContext('2d')!.getImageData(0, 0, 1, 1); console.log('Canvas OK'); }
      catch (e) { console.warn('Canvas TAINTED', e); }



      // return await new Promise<Blob | null>((resolve) =>
      //   canvas.toBlob((b) => resolve(b), 'image/png', 1)
      // );
      return await this.canvasToBlob(canvas);
    } finally {
      node.remove();
    }
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    const usePNG = true;//this.isIOS(); // Safari prefers PNG here
    return new Promise(resolve => {
      if (canvas.toBlob) {
        canvas.toBlob(b => resolve(b || new Blob()),
          usePNG ? 'image/png' : 'image/webp',
          usePNG ? 1 : 0.85);
      } else {
        const dataURL = canvas.toDataURL(usePNG ? 'image/png' : 'image/webp', usePNG ? 1 : 0.85);
        const base64 = dataURL.split(',')[1] || '';
        const ab = new ArrayBuffer(base64.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < base64.length; i++) ia[i] = base64.charCodeAt(i);
        resolve(new Blob([ab], { type: usePNG ? 'image/png' : 'image/webp' }));
      }
    });
  }




  async iosSmokeTest() {
    if (!this.isIOS()) { alert('Run on iPhone'); return; }

    // make a small test PNG in-memory to avoid html2canvas entirely
    const cv = document.createElement('canvas'); cv.width = 300; cv.height = 300;
    const ctx = cv.getContext('2d')!; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = '#000'; ctx.font = '20px -apple-system'; ctx.fillText('Hello iPhone', 60, 150);

    const png = await new Promise<Blob>(res => cv.toBlob(b => res(b!), 'image/png', 1));
    const blobUrl = URL.createObjectURL(png);

    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px';
    const img = document.createElement('img');
    img.src = blobUrl; // BLOB URL
    img.style.cssText = 'max-width:100%;height:auto';
    const openBtn = document.createElement('button'); openBtn.textContent = 'Open Image';
    openBtn.onclick = () => { window.location.href = blobUrl; }; // same-tab open (optional)
    const close = document.createElement('button');
    close.textContent = 'Close'; close.onclick = () => { try { URL.revokeObjectURL(blobUrl); } catch { }; wrap.remove(); };
    close.style.cssText = 'position:fixed;top:10px;right:10px;padding:6px 10px;border-radius:10px';

    wrap.appendChild(close);
    wrap.appendChild(img);
    wrap.appendChild(openBtn);
    document.body.appendChild(wrap);
  }






}
