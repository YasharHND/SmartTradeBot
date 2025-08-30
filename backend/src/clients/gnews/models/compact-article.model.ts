export interface GNewsCompactArticle {
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  source: {
    name: string;
    country: string;
  };
}
