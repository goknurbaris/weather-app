<?php

use Illuminate\Support\Facades\Route;

// Ana sayfaya (/) girildiğinde 'weather' sayfasını aç
Route::get('/', function () {
    return view('weather');
});

// İstersen /weather yolunu da yedek olarak tutabilirsin
Route::get('/weather', function () {
    return view('weather');
});
