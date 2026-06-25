import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WeatherIcon } from "./WeatherIcon";

const mockWeatherData = {
  location: {
    name: "Test City",
    region: "Test Region",
    country: "Testland",
    localtime: "2026-06-25 12:00",
  },
  current: {
    temp_c: 25,
    temp_f: 77,
    condition: {
      text: "Sunny",
      icon: "",
      code: 1000,
    },
    wind_kph: 5,
    wind_mph: 3,
    wind_dir: "N",
    pressure_mb: 1013,
    precip_mm: 0,
    humidity: 40,
    feelslike_c: 25,
    feelslike_f: 77,
    vis_km: 10,
    uv: 5,
    air_quality: {
      pm2_5: 5,
      pm10: 8,
      "us-epa-index": 1,
    },
  },
};

describe("WeatherIcon", () => {
  const originalNavigator = globalThis.navigator;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("navigator", originalNavigator);
    vi.stubGlobal("fetch", originalFetch);
  });

  it("requests geolocation and fetches weather by lat/long", async () => {
    const mockGetCurrentPosition = vi.fn((success) =>
      success({
        coords: { latitude: 12.34, longitude: 56.78 },
      } as GeolocationPosition),
    );

    vi.stubGlobal("navigator", {
      ...originalNavigator,
      geolocation: { getCurrentPosition: mockGetCurrentPosition } as Geolocation,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockWeatherData),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WeatherIcon />);

    expect(mockGetCurrentPosition).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText("25°C")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/weather?location=12.34,56.78",
    );
  });

  it("falls back to IP weather when geolocation is denied", async () => {
    const mockGetCurrentPosition = vi.fn((_, error) =>
      error(new Error("Permission denied")),
    );

    vi.stubGlobal("navigator", {
      ...originalNavigator,
      geolocation: { getCurrentPosition: mockGetCurrentPosition } as Geolocation,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockWeatherData),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WeatherIcon />);

    expect(mockGetCurrentPosition).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText("25°C")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/weather");
  });
});
