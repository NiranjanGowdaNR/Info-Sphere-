import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudDrizzle,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WeatherWidget } from "./WeatherWidget";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    uv: number;
    air_quality?: {
      pm2_5: number;
      pm10: number;
      "us-epa-index": number;
    };
  };
}

const getWeatherIcon = (code: number, className: string = "h-5 w-5") => {
  // Weather condition codes from WeatherAPI
  if (code === 1000) return <Sun className={`${className} text-yellow-500`} />;
  if ([1003, 1006, 1009].includes(code))
    return <Cloud className={`${className} text-gray-400`} />;
  if (
    [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)
  )
    return <CloudRain className={`${className} text-blue-500`} />;
  if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code))
    return <CloudSnow className={`${className} text-blue-300`} />;
  if ([1150, 1153, 1168, 1171].includes(code))
    return <CloudDrizzle className={`${className} text-blue-400`} />;
  return <Cloud className={`${className} text-gray-400`} />;
};

export function WeatherIcon() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setWeather(data);
        setError(null);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-md border border-border p-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !weather) {
    return null; // Don't show anything if there's an error
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md border border-border bg-card p-2 hover:bg-muted"
          aria-label="Weather"
        >
          {getWeatherIcon(weather.current.condition.code)}
          <span className="text-sm font-medium">
            {Math.round(weather.current.temp_c)}°C
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <WeatherWidget compact />
      </PopoverContent>
    </Popover>
  );
}
