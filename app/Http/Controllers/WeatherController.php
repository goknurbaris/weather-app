<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class WeatherController extends Controller
{
    public function getWeather(Request $request)
    {
        $validator = Validator::make($request->query(), [
            'city' => ['required', 'string', 'min:2', 'max:85', 'regex:/^[\p{L}\s\-\.\']+$/u'],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Geçerli bir şehir adı giriniz.'], 422);
        }

        try {
            $city = trim((string) $request->query('city'));

            $geoResponse = Http::acceptJson()->timeout(10)->get('https://geocoding-api.open-meteo.com/v1/search', [
                'name' => $city,
                'count' => 1,
                'language' => 'tr',
                'format' => 'json',
            ]);

            if (! $geoResponse->successful()) {
                return response()->json(['error' => 'Şehir sorgulama servisi şu anda kullanılamıyor.'], 502);
            }

            $geoData = $geoResponse->json();
            if (! isset($geoData['results'][0])) {
                return response()->json(['error' => 'Şehir bulunamadı.'], 404);
            }

            $cityResult = $geoData['results'][0];
            $lat = (float) $cityResult['latitude'];
            $lon = (float) $cityResult['longitude'];
            $cityName = (string) ($cityResult['name'] ?? $city);

            return $this->buildWeatherResponse($lat, $lon, $cityName);
        } catch (Throwable $e) {
            Log::error('Weather lookup failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Sunucu hatası oluştu.'], 500);
        }
    }

    public function getWeatherByCoordinates(Request $request)
    {
        $validator = Validator::make($request->query(), [
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lon' => ['required', 'numeric', 'between:-180,180'],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Geçerli koordinat gönderiniz.'], 422);
        }

        try {
            $lat = (float) $request->query('lat');
            $lon = (float) $request->query('lon');

            $reverseGeoResponse = Http::acceptJson()->timeout(10)->get('https://geocoding-api.open-meteo.com/v1/reverse', [
                'latitude' => $lat,
                'longitude' => $lon,
                'count' => 1,
                'language' => 'tr',
                'format' => 'json',
            ]);

            $cityName = 'Konumunuz';
            if ($reverseGeoResponse->successful()) {
                $reverseGeoData = $reverseGeoResponse->json();
                $cityName = (string) ($reverseGeoData['results'][0]['name'] ?? $cityName);
            }

            return $this->buildWeatherResponse($lat, $lon, $cityName);
        } catch (Throwable $e) {
            Log::error('Weather lookup by coordinates failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Sunucu hatası oluştu.'], 500);
        }
    }

    private function buildWeatherResponse(float $lat, float $lon, string $cityName)
    {
        $weatherResponse = Http::acceptJson()->timeout(10)->get('https://api.open-meteo.com/v1/forecast', [
            'latitude' => $lat,
            'longitude' => $lon,
            'current' => 'temperature_2m,wind_speed_10m,weather_code',
            'current_weather' => true,
            'daily' => 'temperature_2m_max,temperature_2m_min',
            'timezone' => 'auto',
        ]);

        if (! $weatherResponse->successful()) {
            return response()->json(['error' => 'Hava durumu servisi şu anda kullanılamıyor.'], 502);
        }

        $weatherData = $weatherResponse->json();
        $current = $this->normalizeCurrentWeather($weatherData);

        if ($current === null) {
            return response()->json(['error' => 'Hava durumu verisi alınamadı.'], 502);
        }

        $daily = $this->normalizeDailyForecast($weatherData['daily'] ?? []);
        if ($daily === null) {
            return response()->json(['error' => 'Tahmin verisi alınamadı.'], 502);
        }

        return response()->json([
            'city_name' => $cityName,
            'current_weather' => $current,
            'daily' => $daily,
            'status_text' => $this->getStatusText($current['weathercode']),
        ]);
    }

    private function normalizeCurrentWeather(array $weatherData): ?array
    {
        if (isset($weatherData['current_weather'])) {
            $currentWeather = $weatherData['current_weather'];

            if (! isset($currentWeather['temperature'], $currentWeather['windspeed'], $currentWeather['weathercode'])) {
                return null;
            }

            return [
                'temperature' => (float) $currentWeather['temperature'],
                'windspeed' => (float) $currentWeather['windspeed'],
                'weathercode' => (int) $currentWeather['weathercode'],
            ];
        }

        if (isset($weatherData['current'])) {
            $current = $weatherData['current'];

            if (! isset($current['temperature_2m'], $current['wind_speed_10m'], $current['weather_code'])) {
                return null;
            }

            return [
                'temperature' => (float) $current['temperature_2m'],
                'windspeed' => (float) $current['wind_speed_10m'],
                'weathercode' => (int) $current['weather_code'],
            ];
        }

        return null;
    }

    private function normalizeDailyForecast(array $dailyData): ?array
    {
        if (
            ! isset($dailyData['time']) ||
            ! isset($dailyData['temperature_2m_max']) ||
            ! isset($dailyData['temperature_2m_min']) ||
            ! is_array($dailyData['time']) ||
            ! is_array($dailyData['temperature_2m_max']) ||
            ! is_array($dailyData['temperature_2m_min'])
        ) {
            return null;
        }

        return [
            'time' => $dailyData['time'],
            'temperature_2m_max' => array_map('floatval', $dailyData['temperature_2m_max']),
            'temperature_2m_min' => array_map('floatval', $dailyData['temperature_2m_min']),
        ];
    }

    private function getStatusText(int $code): string
    {
        if ($code === 0) {
            return 'Güneşli';
        }

        if ($code >= 1 && $code <= 3) {
            return 'Bulutlu';
        }

        if (($code >= 51 && $code <= 67) || ($code >= 80 && $code <= 82)) {
            return 'Yağmurlu';
        }

        if (($code >= 71 && $code <= 77) || ($code >= 85 && $code <= 86)) {
            return 'Karlı';
        }

        return 'Bilinmiyor';
    }
}
