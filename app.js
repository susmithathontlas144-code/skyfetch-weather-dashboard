// SkyFetch Weather Dashboard - Part 1 API Integration

const apiKey = "714803d85abb690a7e193aeee59f0d96"; // Replace with your OpenWeatherMap API key
const city = "London";

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const iconEl = document.getElementById("icon");

const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

axios
  .get(apiURL)
  .then(function (response) {
    const data = response.data;

    cityEl.textContent = data.name;
    tempEl.textContent = `${data.main.temp} °C`;
    descEl.textContent = data.weather[0].description;

    const iconCode = data.weather[0].icon;
    iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  })
  .catch(function (error) {
    cityEl.textContent = "Error fetching weather";
    console.error(error);
  });