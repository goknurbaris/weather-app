<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WeatherControllerTest extends TestCase
{
    public function test_weather_data_requires_valid_city(): void
    {
        $response = $this->getJson('/weather-data');
        $response->assertStatus(422)->assertJson(['error' => 'Geçerli bir şehir adı giriniz.']);

        $response = $this->getJson('/weather-data?city=' . urlencode('@@@'));
        $response->assertStatus(422)->assertJson(['error' => 'Geçerli bir şehir adı giriniz.']);
    }

    public function test_weather_data_returns_normalized_payload_for_city_lookup(): void
    {
        Http::fake([
            'https://geocoding-api.open-meteo.com/v1/search*' => Http::response([
                'results' => [
                    ['name' => 'Istanbul', 'latitude' => 41.0, 'longitude' => 29.0],
                ],
            ], 200),
            'https://api.open-meteo.com/v1/forecast*' => Http::response([
                'current' => [
                    'temperature_2m' => 23.4,
                    'wind_speed_10m' => 11.2,
                    'weather_code' => 1,
                ],
                'daily' => [
                    'time' => ['2026-04-16', '2026-04-17'],
                    'temperature_2m_max' => [24, 25],
                    'temperature_2m_min' => [12, 13],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/weather-data?city=Istanbul');

        $response->assertOk()->assertJson([
            'city_name' => 'Istanbul',
            'status_text' => 'Bulutlu',
        ]);

        $response->assertJsonPath('current_weather.weathercode', 1);
        $response->assertJsonPath('current_weather.windspeed', 11.2);
    }

    public function test_weather_data_by_coordinates_requires_valid_coordinates(): void
    {
        $response = $this->getJson('/weather-data-by-coordinates?lat=500&lon=29');
        $response->assertStatus(422)->assertJson(['error' => 'Geçerli koordinat gönderiniz.']);
    }

    public function test_weather_data_by_coordinates_returns_weather(): void
    {
        Http::fake([
            'https://geocoding-api.open-meteo.com/v1/reverse*' => Http::response([
                'results' => [
                    ['name' => 'Kadikoy'],
                ],
            ], 200),
            'https://api.open-meteo.com/v1/forecast*' => Http::response([
                'current_weather' => [
                    'temperature' => 19.5,
                    'windspeed' => 8.1,
                    'weathercode' => 0,
                ],
                'daily' => [
                    'time' => ['2026-04-16', '2026-04-17'],
                    'temperature_2m_max' => [20, 21],
                    'temperature_2m_min' => [11, 12],
                ],
            ], 200),
        ]);

        $response = $this->getJson('/weather-data-by-coordinates?lat=41.01&lon=29.03');

        $response->assertOk()->assertJson([
            'city_name' => 'Kadikoy',
            'status_text' => 'Güneşli',
        ]);
    }
}
