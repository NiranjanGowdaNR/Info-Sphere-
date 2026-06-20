import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Support both 'q' and 'msg' query parameters for compatibility
      const query =
           event.queryStringParameters?.q || event.queryStringParameters?.msg || "";

    if (!query.trim()) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          status: 400,
          success: false,
          message: "Search query is required (use 'q' or 'msg' parameter)",
          data: { articles: [], totalResults: 0 },
        }),
      };
    }

    const url = new URL(`${NEWS_API_BASE_URL}/everything`);
    url.searchParams.set("q", query);
    url.searchParams.set("page", page);
    url.searchParams.set("pageSize", pageSize);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("apiKey", NEWS_API_KEY || "");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `News API error: ${response.status}`);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: 200,
        success: true,
        message: "",
        data: data,
      }),
    };
  } catch (err) {
    console.error("[/api/search] error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: 500,
        success: false,
        message: (err as Error).message,
        data: { articles: [], totalResults: 0 },
      }),
    };
  }
};
