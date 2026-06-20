import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/weather")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const location = url.searchParams.get("location") || "auto:ip";

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Weather API key not configured" },
            { status: 500 },
          );
        }

        try {
          const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=yes`;
          const response = await fetch(weatherUrl);

          if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
          }

          const data = await response.json();
          return Response.json(data);
        } catch (error) {
          console.error("[weather-api] Error fetching weather:", error);
          return Response.json(
            { error: "Failed to fetch weather data" },
            { status: 500 },
          );
        }
      },
    },
  },
});
