let input = document.getElementById("cityInput");
let button = document.getElementById("searchBtn");

let cityText = document.getElementById("cityName");
let tempText = document.getElementById("temp");
let windText = document.getElementById("wind");
let statusText = document.getElementById("weatherStatus");
let loading = document.getElementById("loading");

function searchWeather(){

let city = input.value.trim();
if(city === "") return;

loading.classList.remove("hidden");

fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
.then(res => res.json())
.then(geo => {

if(!geo.results){
alert("Şehir bulunamadı");
loading.classList.add("hidden");
return;
}

let result = geo.results[0];

// ⭐ EĞER YAZILAN İLE BULUNAN AYNI DEĞİLSE ÖNER
if(city.toLowerCase() !== result.name.toLowerCase()){

showSuggestion(result);
loading.classList.add("hidden");
return;
}

loadWeather(result.latitude, result.longitude, result.name);

});
}

button.addEventListener("click", searchWeather);

input.addEventListener("keypress", e => {
if(e.key === "Enter") searchWeather();
});


// ⭐ SUGGESTION

function showSuggestion(cityData){

let suggestion = document.getElementById("suggestion");

suggestion.style.display = "block";

suggestion.innerText = "Bunu mu demek istediniz? " + cityData.name;

suggestion.onclick = () => {

input.value = cityData.name;
suggestion.style.display = "none";

loadWeather(cityData.latitude, cityData.longitude, cityData.name);
};
}


// ⭐ WEATHER YÜKLE

function loadWeather(lat, lon, cityName){

fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`)
.then(res => res.json())
.then(data => {


let weather = data.current_weather;

cityText.innerText = cityName;
tempText.innerText = weather.temperature;
windText.innerText = weather.windspeed;
showForecast(data);
let code = weather.weathercode;

statusText.innerText = getStatus(code);
changeBackground(code);

loading.classList.add("hidden");
});
}


// ⭐ STATUS

function getStatus(code){

if(code === 0) return "Güneşli";
if(code >= 1 && code <= 3) return "Bulutlu";

if((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
return "Yağmurlu";

if((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
return "Karlı";

return "Bilinmiyor";
}


// ⭐ BACKGROUND

function changeBackground(code){

document.body.className = "";
let container = document.getElementById("effect-container");
container.innerHTML = "";

if(code === 0){
document.body.classList.add("sunny");
createSun();
}

else if((code >= 51 && code <= 67) || (code >= 80 && code <= 82)){
document.body.classList.add("rainy");
createRain();
}

else if((code >= 71 && code <= 77) || (code >= 85 && code <= 86)){
document.body.classList.add("snowy");
createSnow();
}
else if(code >= 1 && code <= 3) {
    document.body.classList.add("cloudy");
    createClouds();
}
}


// ⭐ ANIMATIONS

function createSun(){
let sun = document.createElement("div");
sun.classList.add("sun");
document.getElementById("effect-container").appendChild(sun);
}

function createRain(){
let container = document.getElementById("effect-container");

for(let i=0;i<120;i++){
let drop = document.createElement("div");
drop.classList.add("rain-drop");

drop.style.left = Math.random()*window.innerWidth + "px";
drop.style.animationDuration = (Math.random()+0.5)+"s";

container.appendChild(drop);
}
}

function createSnow(){
let container = document.getElementById("effect-container");

for(let i=0;i<80;i++){
let snow = document.createElement("div");
snow.classList.add("snowflake");

snow.style.left = Math.random()*window.innerWidth + "px";
snow.style.animationDuration = (Math.random()*3+2)+"s";

container.appendChild(snow);
}
}
function showForecast(data){

let forecastDiv = document.getElementById("forecast");
forecastDiv.innerHTML = "";

let days = data.daily.time;
let maxTemps = data.daily.temperature_2m_max;
let minTemps = data.daily.temperature_2m_min;

for(let i = 0; i < 5; i++){

let card = document.createElement("div");
card.classList.add("forecast-card");

card.innerHTML = `
<p>${days[i]}</p>
<p>⬆ ${maxTemps[i]}°C</p>
<p>⬇ ${minTemps[i]}°C</p>
`;

forecastDiv.appendChild(card);

}
}
function createClouds() {
    let container = document.getElementById("effect-container");

    // Ekranda aynı anda 6-8 arası bulut olması yeterli
    for(let i=0; i<8; i++) {
        let cloud = document.createElement("div");
        cloud.classList.add("cloud");

        // Rastgele boyut (150px - 350px arası)
        let size = Math.random() * 200 + 150;
        cloud.style.width = size + "px";
        cloud.style.height = (size * 0.6) + "px";

        // Rastgele konum (Ekranın üst yarısında)
        cloud.style.top = Math.random() * 40 + "%";
        cloud.style.left = "-250px"; // Ekranın solundan başlasın

        // Rastgele hız (15s - 30s arası)
        cloud.style.animationDuration = (Math.random() * 15 + 15) + "s";

        // Rastgele gecikme (Bulutların hepsi aynı anda çıkmasın)
        cloud.style.animationDelay = (Math.random() * 15) + "s";

        // Opaklık çeşitliliği
        cloud.style.opacity = Math.random() * 0.5 + 0.3;

        container.appendChild(cloud);
    }
}
// 1. Elementi seçiyoruz
let locationBtn = document.getElementById("locationBtn");

// 2. Tıklama olayını dinliyoruz
locationBtn.addEventListener("click", () => {
    // Tarayıcı konum desteği var mı kontrol et
    if (navigator.geolocation) {
        loading.classList.remove("hidden"); // Yükleniyor yazısını göster

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Koordinatlardan şehir ismini öğrenmek için ücretsiz bir servis (Nominatim) kullanalım
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(res => res.json())
                    .then(data => {
                        // Şehir ismini al (adres yapısı değişebildiği için birkaç seçenek sunduk)
                        let cityName = data.address.city || data.address.town || data.address.village || "Konumum";

                        // Kendi yazdığın loadWeather fonksiyonunu çağırıyoruz
                        loadWeather(lat, lon, cityName);
                    })
                    .catch(() => {
                        // Eğer isim bulunamazsa sadece koordinatlarla çalıştır
                        loadWeather(lat, lon, "Konumum");
                    });
            },
            (error) => {
                loading.classList.add("hidden");
                alert("Konum izni verilmedi veya bir hata oluştu.");
            }
        );
    } else {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
    }
});
