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

    <main class="container" aria-live="polite">
        <h1>Hava Durumu</h1>

        <form class="search-box" id="searchForm" novalidate>
            <label for="cityInput" class="sr-only">Şehir adı</label>
            <input id="cityInput" type="text" placeholder="Şehir giriniz..." autocomplete="off" required>
            <button id="searchBtn" type="submit">Ara</button>
            <button id="locationBtn" type="button" title="Konumumu Bul" aria-label="Konumumu bul">📍</button>
        </form>

        <p id="feedback" class="feedback hidden" role="status" aria-live="polite"></p>

        <section class="weather-card" aria-label="Anlık hava durumu">
            <h2 id="cityName">Şehir Seçin</h2>
            <p>Sıcaklık: <span id="temp">--</span> °C</p>
            <p>Durum: <span id="weatherStatus">--</span></p>
            <p>Rüzgar: <span id="wind">--</span> km/h</p>
        </section>

        <section class="forecast-container" id="forecast" aria-label="5 günlük tahmin"></section>

        <div id="loading" class="loading hidden" role="status" aria-live="polite">Yükleniyor...</div>
    </main>

    <script src="{{ asset('js/script.js') }}"></script>
</body>

</html>
