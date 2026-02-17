<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hava Durumu</title>

    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body>

    <div id="effect-container"></div>

    <div class="container">
        <h1>Hava Durumu</h1>

        <div class="search-box">
            <input id="cityInput" type="text" placeholder="Şehir giriniz...">
            <button id="searchBtn">Ara</button>
            <button id="locationBtn" type="button" title="Konumumu Bul">📍</button>
        </div>

        <p id="suggestion" style="display:none;"></p>

        <div class="weather-card">
            <h2 id="cityName">Şehir Seçin</h2>
            <p>Sıcaklık: <span id="temp">--</span> °C</p>
            <p>Durum: <span id="weatherStatus">--</span></p>
            <p>Rüzgar: <span id="wind">--</span> km/h</p>
        </div>

        <div class="forecast-container" id="forecast"></div>

        <div id="loading" class="loading hidden">Yükleniyor...</div>
    </div>

    <script src="{{ asset('js/script.js') }}"></script>
</body>

</html>
