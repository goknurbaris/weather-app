<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('weather-api', function (Request $request) {
    $ip = $request->ip() ?? 'unknown-ip';

    return Limit::perMinute(30)->by($ip);
});

Route::get('/', function () {
    return view('weather');
});

Route::middleware('throttle:weather-api')->group(function () {
    Route::get('/weather-data', [WeatherController::class, 'getWeather']);
    Route::get('/weather-data-by-coordinates', [WeatherController::class, 'getWeatherByCoordinates']);
});
