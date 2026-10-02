const createSources = () => [
  {
    name: 'Infosecurity Magazine',
    feed: 'https://www.infosecurity-magazine.com/rss/news/',
    page: 'https://www.infosecurity-magazine.com/identity-access-management/',
  },
  {
    name: 'Microsoft Security Blog',
    feed: 'https://www.microsoft.com/en-us/security/blog/feed/',
    page: 'https://www.microsoft.com/en-us/security/blog/topic/identity-and-access-management/',
  },
  {
    name: 'CISA',
    feed: 'https://www.cisa.gov/news.xml',
    page: 'https://www.cisa.gov/news-events',
  },
];

const decode = (value = '') => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .trim();

const readTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decode(match[1]) : '';
};

const readLink = (block) => {
  const href = block.match(/<link[^>]+href=["']([^"']+)["']/i);
  return href?.[1] || readTag(block, 'link');
};

const parseFeed = (xml, source) => {
  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0]);
  return blocks.map((block) => ({
    title: readTag(block, 'title'),
    url: readLink(block),
    publishedAt: readTag(block, 'pubDate') || readTag(block, 'published') || readTag(block, 'updated'),
    sourceName: source.name,
    sourceUrl: source.page,
  })).filter((item) => item.title && item.url);
};

const relevance = (item) => {
  const text = `${item.title} ${item.sourceName}`.toLowerCase();
  return ['identity', 'access', 'authentication', 'credential', 'passkey', 'entra', 'okta', 'privileged', 'zero trust', 'mfa', 'oauth', 'token', 'directory', 'account'].reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
};

export default async () => {
  const sources = createSources();
  const results = await Promise.all(sources.map(async (source) => {
    try {
      const response = await fetch(source.feed, {headers: {accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml'}, signal: AbortSignal.timeout(8000)});
      if (!response.ok) return [];
      return parseFeed(await response.text(), source);
    } catch {
      return [];
    }
  }));

  const items = results.flat()
    .filter((item) => relevance(item) > 0)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 12);

  return new Response(JSON.stringify({updatedAt: new Date().toISOString(), items, sources: sources.map(({name, page}) => ({name, page}))}), {
    headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=900, s-maxage=1800'},
  });
};

export const config = {path: '/api/noticias'};
