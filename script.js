document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('searchBar_form');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const location = document.getElementById('searchBar_text').value;
      if (location) {
        getWeatherData(location);
      } else {
        console.error('No location provided');
        updateCurrentWeather({}); // Show error state
      }
    });
  }
});

const apiKey = '895669ddc2bdde0fa3410b5c2d9da13c'; 

// Function to fetch weather data from API
async function getWeatherData(location) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=imperial&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&units=imperial&appid=${apiKey}`;
  
  try {
    // Fetch current weather data
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`HTTP error! status: ${weatherResponse.status}`);
    }
    const weatherData = await weatherResponse.json();
    updateCurrentWeather(weatherData); 
    
    // Fetch forecast data
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error(`HTTP error! status: ${forecastResponse.status}`);
    }
    const forecastData = await forecastResponse.json();
    updateDailyForecast(forecastData); 
  } catch (error) {
    console.error('Error fetching weather data:', error);
    updateCurrentWeather({}); // Show error state
  }
}

// Function to update DOM with current weather data
function updateCurrentWeather(data) {
  const icon = document.getElementById('icon');
  const temp = document.getElementById('temp');
  const desc = document.getElementById('desc');
  const feels = document.getElementById('feels');
  const maxtemp = document.getElementById('maxtemp');
  const mintemp = document.getElementById('mintemp');
  const humidity = document.getElementById('humidity');
  const wind = document.getElementById('wind');

  if (data && data.weather && Array.isArray(data.weather) && data.weather.length > 0) {
    const weather = data.weather[0] || {};
    const main = data.main || {};
    const windData = data.wind || {};

    // Map weather condition to image
    const weatherIconMap = {
      'clear sky': 'icons/clear_sky.png',
      'few clouds': 'icons/few_clouds.png',
      'scattered clouds': 'icons/scattered_clouds.png',
      'broken clouds': 'icons/broken_clouds.png',
      'shower rain': 'icons/shower_rain.png',
      'rain': 'icons/rain.png',
      'thunderstorm': 'icons/thunderstorm.png',
      'snow': 'icons/snow.png',
      'mist': 'icons/mist.png',
      'drizzle': 'icons/drizzle.png',
      'default': 'icons/default.png'
    };

    const condition = weather.description.toLowerCase();
    const iconSrc = weatherIconMap[condition] || weatherIconMap['default'];

    icon.src = iconSrc;
    icon.alt = condition;
    temp.innerHTML = `${Math.round(main.temp) || 'N/A'}<div class="unit">F</div>`;
    desc.innerText = condition;
    feels.innerText = `Feels Like ${Math.round(main.feels_like) || 'N/A'}*`;
    maxtemp.innerText = `High ${Math.round(main.temp_max) || 'N/A'}*`;
    mintemp.innerText = `Low ${Math.round(main.temp_min) || 'N/A'}*`;
    humidity.innerText = `Humidity ${main.humidity || 'N/A'}%`;
    wind.innerText = `Wind ${windData.speed || 'N/A'} mph`;
  } else {
    console.error("Weather data is not available or malformed:", data);
    icon.src = 'icons/default.png'; // Default icon for errors
    icon.alt = "Data not available";
    temp.innerHTML = 'N/A';
    desc.innerText = "Weather data not available";
    feels.innerText = "N/A";
    maxtemp.innerText = "N/A";
    mintemp.innerText = "N/A";
    humidity.innerText = "N/A";
    wind.innerText = "N/A";
  }
}

// Function to update DOM with daily forecast data
function updateDailyForecast(data) {
  if (data && data.list && Array.isArray(data.list)) {
    // Group by day
    const dailyData = data.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000); // Convert Unix timestamp to date
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      if (!acc[day]) acc[day] = { temp_max: -Infinity, temp_min: Infinity, weather: item.weather[0] };
      acc[day].temp_max = Math.max(acc[day].temp_max, item.main.temp_max);
      acc[day].temp_min = Math.min(acc[day].temp_min, item.main.temp_min);
      return acc;
    }, {});

    // Clear previous forecasts
    const forecastContainer = document.getElementById('dailyForecast_content');
    forecastContainer.innerHTML = '';

    // Render daily forecasts
    for (const [day, forecast] of Object.entries(dailyData)) {
      const dayElem = document.createElement('div');
      dayElem.className = 'forecastDay';
      dayElem.innerHTML = `
        <p class="dayAbbreviation">${new Date(day).toLocaleDateString('en-US', { weekday: 'short' })}</p>
        <i class="fa-solid fa-${forecast.weather.icon || 'unknown'}"></i>
        <p class="dayHigh">${Math.round(forecast.temp_max)}*</p>
        <p class="dayLow">${Math.round(forecast.temp_min)}*</p>
      `;
      forecastContainer.appendChild(dayElem);
    }
  } else {
    console.error("Forecast data is not available or malformed:", data);
  }
}

// Event listener for the search button
document.getElementById('searchBar_button').addEventListener('click', async (event) => {
  event.preventDefault();
  const location = document.getElementById('searchBar_text').value;
  if (location) {
    await getWeatherData(location);
  } else {
    console.error('No location provided');
    updateCurrentWeather({}); // Show error state
  }
});

// Function to fetch and update weather for current location
async function getCurrentLocationWeather() {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`);
      const data = await response.json();
      updateCurrentWeather(data);
    } catch (error) {
      console.error('Error fetching current location weather:', error);
    }
  }, (error) => {
    console.error('Geolocation error:', error);
  });
}

// Function to convert units
function toggleUnits() {
  // Implement unit conversion logic here
}

// Event listener for the unit toggle button
document.getElementById('unit').addEventListener('click', () => {
  toggleUnits();
});
