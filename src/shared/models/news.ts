export interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsApiResponse {
  status: number;
  success: boolean;
  message: string;
  data: { articles: Article[]; totalResults: number };
  cached?: boolean;
  stale?: boolean;
  rateLimited?: boolean;
  cacheAgeSeconds?: number;
}

export interface NewsResponse {
  status: number;
  success: boolean;
  message: string;
  data: { articles: unknown[]; totalResults: number };
  cached?: boolean;
  stale?: boolean;
  rateLimited?: boolean;
  cacheAgeSeconds?: number;
}

export const CATEGORIES = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
  "politics",
] as const;

export const COUNTRIES: { iso: string; name: string; flag: string }[] = [
  { iso: "us", name: "United States", flag: "🇺🇸" },
  { iso: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { iso: "in", name: "India", flag: "🇮🇳" },
  { iso: "ca", name: "Canada", flag: "🇨🇦" },
  { iso: "au", name: "Australia", flag: "🇦🇺" },
  { iso: "de", name: "Germany", flag: "🇩🇪" },
  { iso: "fr", name: "France", flag: "🇫🇷" },
  { iso: "it", name: "Italy", flag: "🇮🇹" },
  { iso: "es", name: "Spain", flag: "🇪🇸" },
  { iso: "pt", name: "Portugal", flag: "🇵🇹" },
  { iso: "nl", name: "Netherlands", flag: "🇳🇱" },
  { iso: "be", name: "Belgium", flag: "🇧🇪" },
  { iso: "ch", name: "Switzerland", flag: "🇨🇭" },
  { iso: "at", name: "Austria", flag: "🇦🇹" },
  { iso: "se", name: "Sweden", flag: "🇸🇪" },
  { iso: "no", name: "Norway", flag: "🇳🇴" },
  { iso: "dk", name: "Denmark", flag: "🇩🇰" },
  { iso: "fi", name: "Finland", flag: "🇫🇮" },
  { iso: "ie", name: "Ireland", flag: "🇮🇪" },
  { iso: "pl", name: "Poland", flag: "🇵🇱" },
  { iso: "cz", name: "Czechia", flag: "🇨🇿" },
  { iso: "hu", name: "Hungary", flag: "🇭🇺" },
  { iso: "ro", name: "Romania", flag: "🇷🇴" },
  { iso: "gr", name: "Greece", flag: "🇬🇷" },
  { iso: "tr", name: "Turkey", flag: "🇹🇷" },
  { iso: "ru", name: "Russia", flag: "🇷🇺" },
  { iso: "ua", name: "Ukraine", flag: "🇺🇦" },
  { iso: "il", name: "Israel", flag: "🇮🇱" },
  { iso: "sa", name: "Saudi Arabia", flag: "🇸🇦" },
  { iso: "ae", name: "UAE", flag: "🇦🇪" },
  { iso: "eg", name: "Egypt", flag: "🇪🇬" },
  { iso: "za", name: "South Africa", flag: "🇿🇦" },
  { iso: "ng", name: "Nigeria", flag: "🇳🇬" },
  { iso: "ke", name: "Kenya", flag: "🇰🇪" },
  { iso: "ma", name: "Morocco", flag: "🇲🇦" },
  { iso: "mx", name: "Mexico", flag: "🇲🇽" },
  { iso: "br", name: "Brazil", flag: "🇧🇷" },
  { iso: "ar", name: "Argentina", flag: "🇦🇷" },
  { iso: "co", name: "Colombia", flag: "🇨🇴" },
  { iso: "cl", name: "Chile", flag: "🇨🇱" },
  { iso: "ve", name: "Venezuela", flag: "🇻🇪" },
  { iso: "cn", name: "China", flag: "🇨🇳" },
  { iso: "jp", name: "Japan", flag: "🇯🇵" },
  { iso: "kr", name: "South Korea", flag: "🇰🇷" },
  { iso: "tw", name: "Taiwan", flag: "🇹🇼" },
  { iso: "hk", name: "Hong Kong", flag: "🇭🇰" },
  { iso: "sg", name: "Singapore", flag: "🇸🇬" },
  { iso: "my", name: "Malaysia", flag: "🇲🇾" },
  { iso: "th", name: "Thailand", flag: "🇹🇭" },
  { iso: "id", name: "Indonesia", flag: "🇮🇩" },
  { iso: "ph", name: "Philippines", flag: "🇵🇭" },
  { iso: "pk", name: "Pakistan", flag: "🇵🇰" },
  { iso: "bd", name: "Bangladesh", flag: "🇧🇩" },
  { iso: "nz", name: "New Zealand", flag: "🇳🇿" },
];

export const PAGE_SIZE = 12;
