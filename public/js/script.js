/**
 * Hava Durumu Uygulaması - Frontend Mantığı
 * Laravel WeatherController ile entegre çalışır.
 */

// ⭐ ELEMENT TANIMLAMALARI
const input = document.getElementById("cityInput");
const button = document.getElementById("searchBtn");
const cityText = document.getElementById("cityName");
const tempText = document.getElementById("temp");
const windText = document.getElementById("wind");
const statusText = document.getElementById("weatherStatus");
const loading = document.getElementById("loading");
const effectContainer = document.getElementById("effect-container");
const forecastDiv = document.getElementById("forecast");
const locationButton = document.getElementById("locationBtn");

function setLoadingState(isLoading) {
    loading.classList.toggle("hidden", !isLoading);
    button.disabled = isLoading;
    locationButton.disabled = isLoading;
}

// ⭐ ANA FONKSİYON: Hava Durumu Ara
async function searchWeather() {
    const city = input.value.trim();
    if (city === "") {
        alert("Lütfen bir şehir adı giriniz.");
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch(`/weather-data?city=${encodeURIComponent(city)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Sunucu hatası oluştu.");
        }

        const data = await response.json();

        renderWeather(data);

        changeBackground(data.current_weather.weathercode);
        showForecast(data);

    } catch (error) {
        console.error("Hava durumu hatası:", error);
        alert("Hata: " + error.message);
    } finally {
        setLoadingState(false);
    }
}

async function searchWeatherByCoordinates(lat, lon) {
    setLoadingState(true);

    try {
        const response = await fetch(`/weather-data-by-coordinates?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Sunucu hatası oluştu.");
        }

        const data = await response.json();
        renderWeather(data);
        changeBackground(data.current_weather.weathercode);
        showForecast(data);
    } catch (error) {
        console.error("Konuma göre hava durumu hatası:", error);
        alert("Hata: " + error.message);
    } finally {
        setLoadingState(false);
    }
}

function renderWeather(data) {
    cityText.innerText = data.city_name;
    tempText.innerText = `${data.current_weather.temperature}°C`;
    windText.innerText = `${data.current_weather.windspeed} km/h`;
    statusText.innerText = data.status_text;
}

function changeBackground(code) {
    document.body.className = "";
    effectContainer.innerHTML = "";

    if (code === 0) {
        document.body.classList.add("sunny");
        createSun();
    }
    else if (code >= 1 && code <= 3) {
        document.body.classList.add("cloudy");
        createClouds();
    }
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        document.body.classList.add("rainy");
        createRain();
    }
    else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
        document.body.classList.add("snowy");
        createSnow();
    } else {
        document.body.classList.add("cloudy");
    }
}

// ⭐ ANİMASYON OLUŞTURUCULAR
function createSun() {
    let sun = document.createElement("div");
    sun.classList.add("sun");
    effectContainer.appendChild(sun);
}

function createRain() {
    for (let i = 0; i < 120; i++) {
        let drop = document.createElement("div");
        drop.classList.add("rain-drop");
        drop.style.left = Math.random() * window.innerWidth + "px";
        drop.style.animationDuration = (Math.random() + 0.5) + "s";
        effectContainer.appendChild(drop);
    }
}

function createSnow() {
    for (let i = 0; i < 80; i++) {
        let snow = document.createElement("div");
        snow.classList.add("snowflake");
        snow.style.left = Math.random() * window.innerWidth + "px";
        snow.style.animationDuration = (Math.random() * 3 + 2) + "s";
        effectContainer.appendChild(snow);
    }
}

function createClouds() {
    for (let i = 0; i < 8; i++) {
        let cloud = document.createElement("div");
        cloud.classList.add("cloud");
        let size = Math.random() * 200 + 150;
        cloud.style.width = size + "px";
        cloud.style.height = (size * 0.6) + "px";
        cloud.style.top = Math.random() * 40 + "%";
        cloud.style.left = "-250px";
        cloud.style.animationDuration = (Math.random() * 15 + 15) + "s";
        cloud.style.animationDelay = (Math.random() * 10) + "s";
        cloud.style.opacity = Math.random() * 0.5 + 0.3;
        effectContainer.appendChild(cloud);
    }
}

function showForecast(data) {
    forecastDiv.innerHTML = "";

    const days = data?.daily?.time ?? [];
    const maxTemps = data?.daily?.temperature_2m_max ?? [];
    const minTemps = data?.daily?.temperature_2m_min ?? [];

    const safeLength = Math.min(5, days.length, maxTemps.length, minTemps.length);
    if (safeLength === 0) {
        return;
    }

    for (let i = 0; i < safeLength; i++) {
        let card = document.createElement("div");
        card.classList.add("forecast-card");

        let dateLabel = new Date(days[i]).toLocaleDateString('tr-TR', { weekday: 'long' });

        card.innerHTML = `
            <p><strong>${dateLabel}</strong></p>
            <p>⬆ ${maxTemps[i]}°C</p>
            <p>⬇ ${minTemps[i]}°C</p>
        `;
        forecastDiv.appendChild(card);
    }
}

button.addEventListener("click", searchWeather);
locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Tarayıcınız konum desteği sunmuyor.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            searchWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
            console.error("Konum hatası:", error);
            alert("Konum bilgisi alınamadı. İzin verdiğinizden emin olun.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
});

input.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        searchWeather();
    }
});
