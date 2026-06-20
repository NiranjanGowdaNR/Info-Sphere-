import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudDrizzle,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Thermometer,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const getWeatherIcon = (code: number) => {
  // Weather condition codes from WeatherAPI
  if (code === 1000) return <Sun className="h-12 w-12 text-yellow-500" />;
  if ([1003, 1006, 1009].includes(code))
    return <Cloud className="h-12 w-12 text-gray-400" />;
  if (
    [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)
  )
    return <CloudRain className="h-12 w-12 text-blue-500" />;
  if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code))
    return <CloudSnow className="h-12 w-12 text-blue-300" />;
  if ([1150, 1153, 1168, 1171].includes(code))
    return <CloudDrizzle className="h-12 w-12 text-blue-400" />;
  return <Cloud className="h-12 w-12 text-gray-400" />;
};

const getAQILabel = (index: number) => {
  const labels = [
    "Good",
    "Moderate",
    "Unhealthy for Sensitive",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous",
  ];
  return labels[index - 1] || "Unknown";
};

const getAQIColor = (index: number) => {
  const colors = [
    "text-green-600",
    "text-yellow-600",
    "text-orange-600",
    "text-red-600",
    "text-purple-600",
    "text-red-900",
  ];
  return colors[index - 1] || "text-gray-600";
};

interface WeatherWidgetProps {
  compact?: boolean;
}

export function WeatherWidget({ compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useCelsius, setUseCelsius] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `/api/weather?location=${latitude},${longitude}`,
              );
              if (!response.ok) {
                throw new Error("Failed to fetch weather data");
              }
              const data = await response.json();
              if (data.error) {
                throw new Error(data.error);
              }
              setWeather(data);
              setError(null);
              setLoading(false);
            },
            async () => {
              // Fallback to IP-based location if geolocation is denied
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
              setLoading(false);
            },
          );
        } else {
          // Fallback if geolocation is not supported
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
          setLoading(false);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError((err as Error).message);
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
      <Card className="mb-6">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cloud className="h-5 w-5 animate-pulse" />
            <span>Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="mb-6 border-destructive/50">
        <CardContent className="py-4">
          <p className="text-sm text-destructive">
            Unable to load weather data. {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  const temp = useCelsius ? weather.current.temp_c : weather.current.temp_f;
  const feelsLike = useCelsius
    ? weather.current.feelslike_c
    : weather.current.feelslike_f;
  const tempUnit = useCelsius ? "°C" : "°F";

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-1 flex items-center gap-2 text-lg">
              <MapPin className="h-4 w-4" />
              {weather.location.name}
              {weather.location.region && `, ${weather.location.region}`}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {weather.location.country} •{" "}
              {new Date(weather.location.localtime).toLocaleString("en-US", {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={() => setUseCelsius(!useCelsius)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
          >
            {useCelsius ? "°F" : "°C"}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Main Weather Display */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.current.condition.code)}
            <div>
              <div className="text-4xl font-bold">
                {Math.round(temp)}
                {tempUnit}
              </div>
              <p className="text-sm text-muted-foreground">
                Feels like {Math.round(feelsLike)}
                {tempUnit}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">
              {weather.current.condition.text}
            </p>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="text-sm font-medium">
                {Math.round(weather.current.wind_kph)} km/h{" "}
                {weather.current.wind_dir}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="text-sm font-medium">{weather.current.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <p className="text-sm font-medium">{weather.current.vis_km} km</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pressure</p>
              <p className="text-sm font-medium">
                {weather.current.pressure_mb} mb
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">UV Index</p>
              <p className="text-sm font-medium">{weather.current.uv}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Precipitation</p>
              <p className="text-sm font-medium">
                {weather.current.precip_mm} mm
              </p>
            </div>
          </div>

          {weather.current.air_quality && (
            <div className="col-span-2 flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Air Quality</p>
                <p
                  className={`text-sm font-medium ${getAQIColor(weather.current.air_quality["us-epa-index"])}`}
                >
                  {getAQILabel(weather.current.air_quality["us-epa-index"])}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
