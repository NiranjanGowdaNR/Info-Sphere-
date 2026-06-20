import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1";

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
    const location = event.queryStringParameters?.location || "London";

    const url = new URL(`${WEATHER_API_BASE_URL}/current.json`);
    url.searchParams.set("q", location);
    url.searchParams.set("key", WEATHER_API_KEY || "");
    url.searchParams.set("aqi", "yes");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || `Weather API error: ${response.status}`,
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[/api/weather] error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: (err as Error).message,
      }),
    };
  }
};
