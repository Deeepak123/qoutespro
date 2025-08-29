// random-image.service.ts
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { lastValueFrom } from 'rxjs';

export type SizeKey = 'thumb' | '1080' | '1080x1920';

@Injectable({ providedIn: 'root' })
export class RandomImageService {
    // CONFIG: set how many images exist in qimg/generic (i001..i200)
    private maxIndex = 37;            // <-- change to your actual max
    private basePath = 'qimg/generic'; // Firebase Storage folder

    constructor(private storage: AngularFireStorage) { }

    randomKeys(count: number): string[] {
        const keys = new Set<number>();
        while (keys.size < count) keys.add(1 + Math.floor(Math.random() * this.maxIndex));
        return Array.from(keys).map(n => `i${String(n).padStart(3, '0')}`);
    }

    pathFor(key: string, size: SizeKey): string {
        if (size === 'thumb') return `${this.basePath}/${key}-thumb.webp`;
        if (size === '1080') return `${this.basePath}/${key}-1080.webp`;
        return `${this.basePath}/${key}-1080x1920.webp`;
    }

    async urlFor(key: string, size: SizeKey): Promise<string> {
        const path = this.pathFor(key, size);
        const ref = this.storage.ref(path);
        return await lastValueFrom(ref.getDownloadURL());
    }

    // Get 5 random images: thumbs for all + HD for the first one
    async getFiveRandom(): Promise<{ keys: string[]; thumbUrls: string[]; firstHdUrl: string }> {
        const keys = this.randomKeys(5);
        const thumbUrls = await Promise.all(keys.map(k => this.urlFor(k, 'thumb')));
        const firstHdUrl = await this.urlFor(keys[0], '1080');
        return { keys, thumbUrls, firstHdUrl };
    }
}
