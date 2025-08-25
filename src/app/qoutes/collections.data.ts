// ---- Types ----
export interface CollectionLink {
    label: string;          // H1 text
    slug: string;           // URL segment (no -YYYY at the end)
    topicId: number;        // API topic id for this specific collection page
    path: string;           // full path used in hub links
    published?: string;     // 'YYYY-MM-DD' (first time this page went live)
    modified?: string;      // 'YYYY-MM-DD' (only set when content actually changes)
}

export interface TopicCollection {
    id: string;             // topic slug ("love")
    mainTopicId: number;    // your base topic id (not used for collections fetch)
    emoji?: string;
    title: string;          // display name of the topic
    links: CollectionLink[];
}

// ---- Helpers ----
export const Y = new Date().getFullYear();
const todayISO = new Date().toISOString().slice(0, 10);

/** Build a link path if you ever want to render from slug/year instead of stored path. */
export function buildCollectionPath(topicSlug: string, link: CollectionLink, year?: string) {
    const seg = year ? `${link.slug}-${year}` : link.slug;
    return `/collection/${topicSlug}/${seg}`;
}

/** Humanize a slug */
export function humanizeSlug(slug?: string | null) {
    const s = (slug ?? '').trim();
    if (!s) return '';
    return s.split('-').map(w => (w ? w[0].toUpperCase() + w.slice(1) : '')).join(' ');
}

// ---- All collections (example: LOVE). Repeat blocks for other topics. ----
export const COLLECTIONS: TopicCollection[] = [
    {
        id: 'love',
        mainTopicId: 1,
        emoji: '❤️',
        title: 'Love Quotes',
        links: [
            {
                label: '200+ Best Love Quotes of All Time',
                slug: 'best-love-quotes',
                topicId: 201,
                path: '/collection/love/best-love-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Love Quotes ${Y}`,
                slug: 'love-quotes', // base; year is appended at the end of path
                topicId: 202,
                path: `/collection/love/love-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Romantic Love Quotes',
                slug: 'romantic-love-quotes',
                topicId: 203,
                path: '/collection/love/romantic-love-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Love Quotes for Her',
                slug: 'love-quotes-for-her',
                topicId: 204,
                path: '/collection/love/love-quotes-for-her',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Love Quotes for Him',
                slug: 'love-quotes-for-him',
                topicId: 205,
                path: '/collection/love/love-quotes-for-him',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],
    },
    {
        id: 'motivational',
        mainTopicId: 13,
        emoji: '💪',
        title: 'Motivational Quotes',
        links: [
            {
                label: '200+ Best Motivational Quotes of All Time',
                slug: 'best-motivational-quotes',
                topicId: 206,
                path: '/collection/motivational/best-motivational-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Motivational Quotes ${Y}`,
                slug: 'motivational-quotes', // base; year appended
                topicId: 207,
                path: `/collection/motivational/motivational-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Motivational Quotes',
                slug: 'short-motivational-quotes',
                topicId: 208,
                path: '/collection/motivational/short-motivational-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Motivational Quotes for Work & Success',
                slug: 'motivational-quotes-for-work-success',
                topicId: 209,
                path: '/collection/motivational/motivational-quotes-for-work-success',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Motivational Quotes for Students',
                slug: 'motivational-quotes-for-students',
                topicId: 210,
                path: '/collection/motivational/motivational-quotes-for-students',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],
    },
    {
        id: 'success',
        mainTopicId: 11,
        emoji: '🏆',
        title: 'Success Quotes',
        links: [
            {
                label: '200+ Best Success Quotes of All Time',
                slug: 'best-success-quotes',
                topicId: 211,
                path: '/collection/success/best-success-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Success Quotes ${Y}`,
                slug: 'success-quotes', // base; year appended
                topicId: 212,
                path: `/collection/success/success-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Success Quotes',
                slug: 'short-success-quotes',
                topicId: 213,
                path: '/collection/success/short-success-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Success Quotes for Work & Business',
                slug: 'success-quotes-for-work-business',
                topicId: 214,
                path: '/collection/success/success-quotes-for-work-business',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Success Quotes for Students',
                slug: 'success-quotes-for-students',
                topicId: 215,
                path: '/collection/success/success-quotes-for-students',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],

    },


    {
        id: 'inspiration',
        mainTopicId: 14,
        emoji: '✨',
        title: 'Inspiration Quotes',
        links: [
            {
                label: '200+ Best Inspiration Quotes of All Time',
                slug: 'best-inspiration-quotes',
                topicId: 216,
                path: '/collection/inspiration/best-inspiration-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Inspiration Quotes ${Y}`,
                slug: 'inspiration-quotes', // base; year appended
                topicId: 217,
                path: `/collection/inspiration/inspiration-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Inspiration Quotes',
                slug: 'short-inspiration-quotes',
                topicId: 218,
                path: '/collection/inspiration/short-inspiration-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Inspiration Quotes for Work & Life',
                slug: 'inspiration-quotes-for-work-life',
                topicId: 219,
                path: '/collection/inspiration/inspiration-quotes-for-work-life',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Inspiration Quotes for Students',
                slug: 'inspiration-quotes-for-students',
                topicId: 220,
                path: '/collection/inspiration/inspiration-quotes-for-students',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],


    },



    {
        id: 'life',
        mainTopicId: 10,
        emoji: '🌱',
        title: 'Life Quotes',
        links: [
            {
                label: '200+ Best Life Quotes of All Time',
                slug: 'best-life-quotes',
                topicId: 221,
                path: '/collection/life/best-life-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Life Quotes ${Y}`,
                slug: 'life-quotes', // base; year appended
                topicId: 222,
                path: `/collection/life/life-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Life Quotes',
                slug: 'short-life-quotes',
                topicId: 223,
                path: '/collection/life/short-life-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Positive Life Quotes',
                slug: 'positive-life-quotes',
                topicId: 224,
                path: '/collection/life/positive-life-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Inspirational Life Quotes',
                slug: 'inspirational-life-quotes',
                topicId: 225,
                path: '/collection/life/inspirational-life-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],

    },



    {
        id: 'attitude',
        mainTopicId: 15,
        emoji: '😎',
        title: 'Attitude Quotes',
        links: [
            {
                label: '200+ Best Attitude Quotes of All Time',
                slug: 'best-attitude-quotes',
                topicId: 226,
                path: '/collection/attitude/best-attitude-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Attitude Quotes ${Y}`,
                slug: 'attitude-quotes', // base; year appended
                topicId: 227,
                path: `/collection/attitude/attitude-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Attitude Quotes',
                slug: 'short-attitude-quotes',
                topicId: 228,
                path: '/collection/attitude/short-attitude-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Positive Attitude Quotes',
                slug: 'positive-attitude-quotes',
                topicId: 229,
                path: '/collection/attitude/positive-attitude-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Savage Attitude Quotes',
                slug: 'savage-attitude-quotes',
                topicId: 230,
                path: '/collection/attitude/savage-attitude-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],


    },


    {
        id: 'friendship',
        mainTopicId: 3,
        emoji: '🤝',
        title: 'Friendship Quotes',
        links: [
            {
                label: '200+ Best Friendship Quotes of All Time',
                slug: 'best-friendship-quotes',
                topicId: 231,
                path: '/collection/friendship/best-friendship-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Friendship Quotes ${Y}`,
                slug: 'friendship-quotes', // base; year appended
                topicId: 232,
                path: `/collection/friendship/friendship-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Friendship Quotes',
                slug: 'short-friendship-quotes',
                topicId: 233,
                path: '/collection/friendship/short-friendship-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'True Friendship Quotes',
                slug: 'true-friendship-quotes',
                topicId: 234,
                path: '/collection/friendship/true-friendship-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Funny Friendship Quotes',
                slug: 'funny-friendship-quotes',
                topicId: 235,
                path: '/collection/friendship/funny-friendship-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],

    },



    {
        id: 'family',
        mainTopicId: 4,
        emoji: '👨‍👩‍👧',
        title: 'Family Quotes',
        links: [
            {
                label: '200+ Best Family Quotes of All Time',
                slug: 'best-family-quotes',
                topicId: 236,
                path: '/collection/family/best-family-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: `Trending Family Quotes ${Y}`,
                slug: 'family-quotes', // base; year appended
                topicId: 237,
                path: `/collection/family/family-quotes-${Y}`,
                published: `${Y}-01-01`,
                // modified: todayISO,
            },
            {
                label: 'Short Family Quotes',
                slug: 'short-family-quotes',
                topicId: 238,
                path: '/collection/family/short-family-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Love and Family Quotes',
                slug: 'love-and-family-quotes',
                topicId: 239,
                path: '/collection/family/love-and-family-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
            {
                label: 'Inspirational Family Quotes',
                slug: 'inspirational-family-quotes',
                topicId: 240,
                path: '/collection/family/inspirational-family-quotes',
                published: '2025-08-25',
                // modified: todayISO,
            },
        ],


    },


    // ---- Copy this block and fill for each topic you support ----
    // {
    //   id: 'motivational',
    //   mainTopicId: 13,
    //   emoji: '💪',
    //   title: 'Motivational Quotes',
    //   links: [ ... ]
    // },
];
