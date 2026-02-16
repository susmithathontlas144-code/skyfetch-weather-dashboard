// ------------------ WeatherApp Constructor ------------------
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Existing DOM references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    // DOM references for recent searches
    this.recentSearchesSection = document.getElementById('recent-searches-section');
    this.recentSearchesContainer = document.getElementById('recent-searches-container');

    // Recent searches
    this.recentSearches = [];
    this.maxRecentSearches = 5;

    this.init();
}

// ------------------ Init Method ------------------
WeatherApp.prototype.init = function() {
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));
    this.cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') this.handleSearch();
    }.bind(this));

    // Load recent searches
    this.loadRecentSearches();

    // Load last searched city or show welcome
    this.loadLastCity();

    // Add clear history button listener
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', this.clearHistory.bind(this));
    }
};

// ------------------ Welcome Message ------------------
WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message" style="
            background-color: #e6f0ff;
            color: #003366;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <h2>🌤️ Welcome to SkyFetch!</h2>
            <p>Search for a city to get started with current weather and 5-day forecast.</p>
            <p>Try: <strong>London</strong>, <strong>Paris</strong>, <strong>Tokyo</strong></p>
        </div>
    `;
    this.weatherDisplay.innerHTML = welcomeHTML;
};

// ------------------ Load Last Searched City ------------------
WeatherApp.prototype.loadLastCity = function() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        this.showWelcome();
    }
};

// ------------------ Clear History Method ------------------
WeatherApp.prototype.clearHistory = function() {
    if (confirm('Clear all recent searches?')) {
        this.recentSearches = [];
        localStorage.removeItem('recentSearches');
        this.displayRecentSearches();
    }
};

// ------------------ Handle Search ------------------
WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();
    if (!city) return this.showError("⚠️ Please enter a city name.");
    if (city.length < 2) return this.showError("⚠️ City name too short. Enter at least 2 characters.");

    this.getWeather(city);
    this.cityInput.value = '';
};

// ------------------ Fetch Forecast ------------------
WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

// ------------------ Fetch Current Weather + Forecast ------------------
WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        // Save this search
        this.saveRecentSearch(city);

        // Save last searched city
        localStorage.setItem('lastCity', city);

    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';
    }
};

// ------------------ Display Weather ------------------
WeatherApp.prototype.displayWeather = function(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    this.weatherDisplay.innerHTML = weatherHTML;
    this.cityInput.focus();
};

// ------------------ Process Forecast Data ------------------
WeatherApp.prototype.processForecastData = function(data) {
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    return dailyForecasts.slice(0, 5);
};

// ------------------ Display Forecast ------------------
WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card" style="
                background-color: #f0f0f0;
                border-radius: 10px;
                padding: 10px;
                margin: 5px;
                text-align: center;
                font-family: Arial, sans-serif;
                width: 100px;
            ">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="${description}" style="width:50px;height:50px;">
                <div>${temp}°C</div>
                <p style="font-size: 12px; text-transform: capitalize;">${description}</p>
            </div>
        `;
    }).join('');

    const forecastSection = `
        <div class="forecast-section" style="margin-top:20px;">
            <h3 style="margin-bottom: 10px;">5-Day Forecast</h3>
            <div class="forecast-container" style="display:flex; justify-content:space-between;">
                ${forecastHTML}
            </div>
        </div>
    `;

    this.weatherDisplay.innerHTML += forecastSection;
};

// ------------------ Show Loading ------------------
WeatherApp.prototype.showLoading = function() {
    const loadingHTML = `
        <div class="loading-container" style="
            background-color: #f0f0f0;
            color: #333;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        ">
            <div class="spinner" style="
                border: 5px solid #f3f3f3;
                border-top: 5px solid #667eea;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin-bottom: 15px;
            "></div>
            <p>Loading weather data...</p>
        </div>

        <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;
    this.weatherDisplay.innerHTML = loadingHTML;
};

// ------------------ Show Error ------------------
WeatherApp.prototype.showError = function(message) {
    const errorHTML = `
        <div class="error-message" style="
            background-color: #ffe6e6;
            color: #cc0000;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <h2 style="margin-bottom: 10px;">❌ Error</h2>
            <p>${message}</p>
        </div>
    `;
    this.weatherDisplay.innerHTML = errorHTML;
    this.cityInput.focus();
};

// ------------------ Recent Searches Methods ------------------
WeatherApp.prototype.loadRecentSearches = function() {
    const saved = localStorage.getItem('recentSearches');
    if (saved) this.recentSearches = JSON.parse(saved);
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function(city) {
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) this.recentSearches.splice(index, 1);

    this.recentSearches.unshift(cityName);

    if (this.recentSearches.length > this.maxRecentSearches) this.recentSearches.pop();

    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function() {
    this.recentSearchesContainer.innerHTML = '';
    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = 'none';
        return;
    }
    this.recentSearchesSection.style.display = 'block';

    this.recentSearches.forEach(function(city) {
        const btn = document.createElement('button');
        btn.className = 'recent-search-btn';
        btn.textContent = city;
        btn.addEventListener('click', function() {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));
        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};

// ------------------ Initialize App ------------------
const app = new WeatherApp('CONFIG.714803d85abb690a7e193aeee59f0d96');
