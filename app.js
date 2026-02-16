// Your OpenWeatherMap API Key
const API_KEY = '714803d85abb690a7e193aeee59f0d96';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/* ------------------ Async Function to Fetch Weather ------------------ */
async function getWeather(city) {
    // Show loading spinner immediately
    showLoading();

    // Disable search button while loading
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);

    } catch (error) {
        console.error('Error fetching weather:', error);

        if (error.response && error.response.status === 404) {
            showError(`❌ City "${city}" not found. Please check the spelling and try again.`);
        } else {
            showError('⚠️ Something went wrong. Please try again later.');
        }
    } finally {
        // Re-enable search button after API call
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

/* ------------------ Show Loading Spinner ------------------ */
function showLoading() {
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
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.getElementById('weather-display').innerHTML = loadingHTML;
}

/* ------------------ Display Weather ------------------ */
function displayWeather(data) {
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

    document.getElementById('weather-display').innerHTML = weatherHTML;

    // Focus input after displaying weather
    cityInput.focus();
}

/* ------------------ Show Error ------------------ */
function showError(message = "❌ Could not fetch weather data.") {
    const errorHTML = `
        <div class="error-message" style="
            background-color: #ffe6e6;
            color: #cc0000;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
        ">
            <h2 style="margin-bottom: 10px;">Error</h2>
            <p>${message}</p>
        </div>
    `;
    document.getElementById('weather-display').innerHTML = errorHTML;

    // Focus input so user can type again
    cityInput.focus();
}

/* ------------------ Event Listeners ------------------ */
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

searchBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();

    // Input Validation
    if (!city) {
        showError("⚠️ Please enter a city name.");
        return;
    }
    if (city.length < 2) {
        showError("⚠️ City name too short. Enter at least 2 characters.");
        return;
    }

    getWeather(city);
    cityInput.value = ""; // Clear input for better UX
});

cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

/* ------------------ Initial Page Welcome Message ------------------ */
document.getElementById('weather-display').innerHTML = `
    <div class="welcome-message" style="
        background-color: #e6f0ff;
        color: #003366;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        font-family: Arial, sans-serif;
    ">
        <h2>🌤️ Welcome to SkyFetch!</h2>
        <p>Enter a city name above and click "Search" to get the current weather.</p>
    </div>
`;
