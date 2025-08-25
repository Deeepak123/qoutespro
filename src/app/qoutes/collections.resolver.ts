import { COLLECTIONS, CollectionLink } from './collections.data';

export interface ResolvedCollectionMeta {
    topicId: number;      // API topic id to fetch
    h1: string;           // H1 (and <title>)
    published?: string;   // YYYY-MM-DD
    modified?: string;    // YYYY-MM-DD
    isYear: boolean;
    year?: string;
    link: CollectionLink; // the matched link object
}

/** Map /collection/:topic/:slug[-:year] to topicId + H1 + dates */
export function resolveFromCollections(
    topicSlug: string,
    slugOrSlugWithYear: string
): ResolvedCollectionMeta | null {
    const topic = COLLECTIONS.find(t => t.id.toLowerCase() === (topicSlug || '').toLowerCase());
    if (!topic) return null;

    const m = /^(.*?)-(\d{4})$/.exec(slugOrSlugWithYear || '');
    const base = (m ? m[1] : slugOrSlugWithYear || '').toLowerCase();
    const year = m ? m[2] : undefined;

    const link = topic.links.find(l => (l.slug || '').toLowerCase() === base);
    if (!link) return null;

    let h1 = link.label;
    if (year) {
        if (/\b20\d{2}\b/.test(h1)) h1 = h1.replace(/\b20\d{2}\b/, year);
        else h1 = `${h1} ${year}`;
    }

    const published = link.published ?? (year ? `${year}-01-01` : undefined);
    const modified = link.modified;

    return {
        topicId: link.topicId,
        h1,
        published,
        modified,
        isYear: !!year,
        year,
        link
    };
}
