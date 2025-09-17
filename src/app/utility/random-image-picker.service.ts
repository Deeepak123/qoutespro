// // random-image.service.ts
// import { Injectable } from '@angular/core';
// import { environment } from './../../environments/environment';

// export type SizeKey = 'thumb' | '1080' | '1080x1920';

// @Injectable({ providedIn: 'root' })
// export class RandomImageService {
//     // How many images exist in qimg/generic (i001..i037 here)
//     private maxIndex = 37;                 // ← update when you add images
//     private basePath = 'qimg/generic';

//     // Generate N unique random keys like i001, i002...
//     randomKeys(count: number): string[] {
//         const keys = new Set<number>();
//         while (keys.size < count) keys.add(1 + Math.floor(Math.random() * this.maxIndex));
//         return Array.from(keys).map(n => `i${String(n).padStart(3, '0')}`);
//     }

//     private pathFor(key: string, size: SizeKey): string {
//         if (size === 'thumb') return `${this.basePath}/${key}-thumb.webp`;
//         if (size === '1080') return `${this.basePath}/${key}-1080.webp`;
//         return `${this.basePath}/${key}-1080x1920.webp`;
//     }

//     urlFor(key: string, size: SizeKey): string {
//         // Build the CDN URL. No tokens, no SDK. Edge-cached by Cloudflare Worker.
//         const rel = this.pathFor(key, size);
//         return `${environment.IMAGE_CDN_URL}${rel}`;
//     }

//     // Get 5 random images: thumbs for all + HD for the first one
//     async getFiveRandom(topicId: Number): Promise<{ keys: string[]; thumbUrls: string[]; firstHdUrl: string }> {
//         this.setTopicConfig(topicId);
//         const keys = this.randomKeys(5);
//         const thumbUrls = keys.map(k => this.urlFor(k, 'thumb'));
//         const firstHdUrl = this.urlFor(keys[0], '1080');
//         return { keys, thumbUrls, firstHdUrl };
//     }

//     // Example function where you set values based on topicId
//     private setTopicConfig(topicId: Number) {
//         if (topicId === 1 || topicId === 2 || topicId === 14) {
//             this.maxIndex = 99;
//             this.basePath = 'qimg/love';
//         } else if (topicId === 20 || topicId === 21 || topicId === 16) {
//             this.maxIndex = 45;
//             this.basePath = 'qimg/motivation';
//         } else {
//             // fallback/default
//             this.maxIndex = 37;
//             this.basePath = 'qimg/generic';
//         }
//     }
// }



// NEW CODE:
// random-image.service.ts
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

export type SizeKey = 'thumb' | '1080' | '1080x1920';

interface TopicConfig {
    basePath: string;
    maxIndex: number;
}

@Injectable({ providedIn: 'root' })
export class RandomImageService {
    // Default config
    private defaultConfig: TopicConfig = {
        basePath: 'qimg/generic',
        maxIndex: 130
    };

    // Map of topicId → TopicConfig
    private topicConfigs: { [id: number]: TopicConfig } = {
        //love, romantic
        1: { basePath: 'qimg/love', maxIndex: 59 },
        2: { basePath: 'qimg/love', maxIndex: 59 },
        201: { basePath: 'qimg/love', maxIndex: 59 },
        202: { basePath: 'qimg/love', maxIndex: 59 },
        203: { basePath: 'qimg/love', maxIndex: 59 },
        204: { basePath: 'qimg/love', maxIndex: 59 },
        205: { basePath: 'qimg/love', maxIndex: 59 },

        //friendship, trust, emapthy, humanity
        3: { basePath: 'qimg/friendship', maxIndex: 50 },
        40: { basePath: 'qimg/friendship', maxIndex: 50 },
        44: { basePath: 'qimg/friendship', maxIndex: 50 },
        71: { basePath: 'qimg/friendship', maxIndex: 50 },
        231: { basePath: 'qimg/friendship', maxIndex: 50 },
        232: { basePath: 'qimg/friendship', maxIndex: 50 },
        233: { basePath: 'qimg/friendship', maxIndex: 50 },
        234: { basePath: 'qimg/friendship', maxIndex: 50 },
        235: { basePath: 'qimg/friendship', maxIndex: 50 },

        //family, memories, cherish moment
        4: { basePath: 'qimg/family', maxIndex: 49 },
        87: { basePath: 'qimg/family', maxIndex: 49 },
        88: { basePath: 'qimg/family', maxIndex: 49 },
        236: { basePath: 'qimg/family', maxIndex: 49 },
        237: { basePath: 'qimg/family', maxIndex: 49 },
        238: { basePath: 'qimg/family', maxIndex: 49 },
        239: { basePath: 'qimg/family', maxIndex: 49 },
        240: { basePath: 'qimg/family', maxIndex: 49 },

        //anniversary, wedding
        5: { basePath: 'qimg/anniversary', maxIndex: 56 },
        6: { basePath: 'qimg/anniversary', maxIndex: 56 },
        79: { basePath: 'qimg/anniversary', maxIndex: 56 },
        80: { basePath: 'qimg/anniversary', maxIndex: 56 },

        //father, parenting
        7: { basePath: 'qimg/father', maxIndex: 49 },
        8: { basePath: 'qimg/father', maxIndex: 49 },

        //valentine's day
        9: { basePath: 'qimg/valentine', maxIndex: 30 },
        83: { basePath: 'qimg/valentine', maxIndex: 30 },

        //success, goals, moeny
        11: { basePath: 'qimg/success', maxIndex: 55 },
        18: { basePath: 'qimg/success', maxIndex: 55 },
        29: { basePath: 'qimg/success', maxIndex: 55 },
        211: { basePath: 'qimg/success', maxIndex: 55 },
        212: { basePath: 'qimg/success', maxIndex: 55 },
        213: { basePath: 'qimg/success', maxIndex: 55 },
        214: { basePath: 'qimg/success', maxIndex: 55 },
        215: { basePath: 'qimg/success', maxIndex: 55 },

        //leadership, business, respect, integrity, technology
        12: { basePath: 'qimg/leadership', maxIndex: 64 },
        28: { basePath: 'qimg/leadership', maxIndex: 64 },
        41: { basePath: 'qimg/leadership', maxIndex: 64 },
        46: { basePath: 'qimg/leadership', maxIndex: 64 },
        76: { basePath: 'qimg/leadership', maxIndex: 64 },

        //motivation, confidence, courage, strength, resilence, growth-mindset, 
        //persistent, productivity, work, change-mindset, fear, failure, pain,
        //fitness, empowerment, passion
        13: { basePath: 'qimg/motivation', maxIndex: 66 },
        17: { basePath: 'qimg/motivation', maxIndex: 66 },
        19: { basePath: 'qimg/motivation', maxIndex: 66 },
        20: { basePath: 'qimg/motivation', maxIndex: 66 },
        21: { basePath: 'qimg/motivation', maxIndex: 66 },
        23: { basePath: 'qimg/motivation', maxIndex: 66 },
        24: { basePath: 'qimg/motivation', maxIndex: 66 },
        25: { basePath: 'qimg/motivation', maxIndex: 66 },
        27: { basePath: 'qimg/motivation', maxIndex: 66 },
        32: { basePath: 'qimg/motivation', maxIndex: 66 },
        49: { basePath: 'qimg/motivation', maxIndex: 66 },
        50: { basePath: 'qimg/motivation', maxIndex: 66 },
        51: { basePath: 'qimg/motivation', maxIndex: 66 },
        54: { basePath: 'qimg/motivation', maxIndex: 66 },
        63: { basePath: 'qimg/motivation', maxIndex: 66 },
        74: { basePath: 'qimg/motivation', maxIndex: 66 },
        206: { basePath: 'qimg/motivation', maxIndex: 66 },
        207: { basePath: 'qimg/motivation', maxIndex: 66 },
        208: { basePath: 'qimg/motivation', maxIndex: 66 },
        209: { basePath: 'qimg/motivation', maxIndex: 66 },
        210: { basePath: 'qimg/motivation', maxIndex: 66 },

        //inspiration, dreams, purpose, time, vision, positivity, hope,
        //kindness, wisdom, truth, forgiveness, compassion, authencity,
        //self-love, emotional-intelligence, letting-go, creativity, 
        //education, imagination, curiosity
        14: { basePath: 'qimg/inspiration', maxIndex: 90 },
        16: { basePath: 'qimg/inspiration', maxIndex: 90 },
        22: { basePath: 'qimg/inspiration', maxIndex: 90 },
        26: { basePath: 'qimg/inspiration', maxIndex: 90 },
        30: { basePath: 'qimg/inspiration', maxIndex: 90 },
        34: { basePath: 'qimg/inspiration', maxIndex: 90 },
        36: { basePath: 'qimg/inspiration', maxIndex: 90 },
        37: { basePath: 'qimg/inspiration', maxIndex: 90 },
        38: { basePath: 'qimg/inspiration', maxIndex: 90 },
        39: { basePath: 'qimg/inspiration', maxIndex: 90 },
        42: { basePath: 'qimg/inspiration', maxIndex: 90 },
        45: { basePath: 'qimg/inspiration', maxIndex: 90 },
        47: { basePath: 'qimg/inspiration', maxIndex: 90 },
        55: { basePath: 'qimg/inspiration', maxIndex: 90 },
        65: { basePath: 'qimg/inspiration', maxIndex: 90 },
        66: { basePath: 'qimg/inspiration', maxIndex: 90 },
        72: { basePath: 'qimg/inspiration', maxIndex: 90 },
        73: { basePath: 'qimg/inspiration', maxIndex: 90 },
        77: { basePath: 'qimg/inspiration', maxIndex: 90 },
        75: { basePath: 'qimg/inspiration', maxIndex: 90 },
        216: { basePath: 'qimg/inspiration', maxIndex: 90 },
        217: { basePath: 'qimg/inspiration', maxIndex: 90 },
        218: { basePath: 'qimg/inspiration', maxIndex: 90 },
        219: { basePath: 'qimg/inspiration', maxIndex: 90 },
        220: { basePath: 'qimg/inspiration', maxIndex: 90 },

        //attitude
        15: { basePath: 'qimg/attitude', maxIndex: 50 },
        226: { basePath: 'qimg/attitude', maxIndex: 50 },
        227: { basePath: 'qimg/attitude', maxIndex: 50 },
        228: { basePath: 'qimg/attitude', maxIndex: 50 },
        229: { basePath: 'qimg/attitude', maxIndex: 50 },
        230: { basePath: 'qimg/attitude', maxIndex: 50 },

        //celebration, birthday, new-year
        86: { basePath: 'qimg/celebration', maxIndex: 93 },
        78: { basePath: 'qimg/celebration', maxIndex: 93 },
        82: { basePath: 'qimg/celebration', maxIndex: 93 },

        //christmas
        81: { basePath: 'qimg/christmas', maxIndex: 50 },

        //funny, laughter
        84: { basePath: 'qimg/funny', maxIndex: 9 },
        85: { basePath: 'qimg/funny', maxIndex: 9 },
    };

    private basePath = this.defaultConfig.basePath;
    private maxIndex = this.defaultConfig.maxIndex;

    // Generate N unique random keys like i001, i002...
    randomKeys(count: number): string[] {
        const keys = new Set<number>();
        const finalCount = Math.min(count, this.maxIndex);
        while (keys.size < finalCount) keys.add(1 + Math.floor(Math.random() * this.maxIndex));
        return Array.from(keys).map(n => `i${String(n).padStart(3, '0')}`);
    }

    private pathFor(key: string, size: SizeKey): string {
        if (size === 'thumb') return `${this.basePath}/${key}-thumb.webp`;
        if (size === '1080') return `${this.basePath}/${key}-1080.webp`;
        return `${this.basePath}/${key}-1080x1920.webp`;
    }

    urlFor(key: string, size: SizeKey): string {
        const rel = this.pathFor(key, size);
        return `${environment.IMAGE_CDN_URL}${rel}`;
    }

    // Get 5 random images: thumbs for all + HD for the first one
    getFiveRandom(topicId: number): { keys: string[]; thumbUrls: string[]; firstHdUrl: string } {
        console.log("-----TI + " + topicId);
        this.setTopicConfig(topicId);
        const keys = this.randomKeys(5);
        const thumbUrls = keys.map(k => this.urlFor(k, 'thumb'));
        const firstHdUrl = this.urlFor(keys[0], '1080');
        return { keys, thumbUrls, firstHdUrl };
    }

    private setTopicConfig(topicId: number) {
        const config = this.topicConfigs[topicId] || this.defaultConfig;
        this.basePath = config.basePath;
        this.maxIndex = config.maxIndex;
    }
}
