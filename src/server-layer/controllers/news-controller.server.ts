import { fetchNews } from "@/server-layer/services/news-api.server";

function getPaging(request: Request) {
  const url = new URL(request.url);
  return {
    page: Number(url.searchParams.get("page") ?? 1),
    pageSize: Number(url.searchParams.get("pageSize") ?? 80),
    url,
  };
}

export async function getAllNews(request: Request) {
  const { page, pageSize } = getPaging(request);
  return fetchNews("/everything", {
    q: "news",
    language: "en",
    page,
    pageSize,
    sortBy: "publishedAt",
  });
}

export async function getTopHeadlines(request: Request) {
  const { page, pageSize, url } = getPaging(request);
  const category = url.searchParams.get("category") ?? "general";
  const validCats = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
  ];
  const params: Record<string, string | number> = {
    page,
    pageSize,
    language: "en",
  };

  if (category === "politics") {
    params.q = "politics";
  } else if (validCats.includes(category)) {
    params.category = category;
    params.country = "us";
  } else {
    params.category = "general";
  }

  return fetchNews("/top-headlines", params);
}

export async function getCountryNews(request: Request, iso: string) {
  const { page, pageSize } = getPaging(request);
  return fetchNews("/top-headlines", {
    country: iso.toLowerCase(),
    page,
    pageSize,
  });
}

export async function searchNews(request: Request) {
  const { page, pageSize, url } = getPaging(request);
  const msg = url.searchParams.get("msg") ?? "";

  if (!msg.trim()) {
    return {
      status: 400,
      success: false,
      message: "msg query parameter is required",
      data: { articles: [], totalResults: 0 },
    };
  }

  return fetchNews("/everything", {
    q: msg,
    page,
    pageSize,
    sortBy: "publishedAt",
    language: "en",
  });
}
