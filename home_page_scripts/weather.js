const RANDOM_WEATHER = [
    { condition: 'clear',  cloudCover: 0.05, icon: '☀️',  label: 'Clear sky'     },
    { condition: 'clear',  cloudCover: 0.15, icon: '🌤',  label: 'Few clouds'    },
    { condition: 'cloudy', cloudCover: 0.45, icon: '⛅',  label: 'Partly cloudy' },
    { condition: 'cloudy', cloudCover: 0.75, icon: '🌥',  label: 'Mostly cloudy' },
    { condition: 'cloudy', cloudCover: 0.95, icon: '☁️',  label: 'Overcast'      },
    { condition: 'rain',   cloudCover: 0.85, icon: '🌧',  label: 'Light rain'    },
    { condition: 'rain',   cloudCover: 0.90, icon: '🌧',  label: 'Rain'          },
    { condition: 'snow',   cloudCover: 0.85, icon: '❄️',  label: 'Snow'          },
    { condition: 'storm',  cloudCover: 0.95, icon: '⛈',  label: 'Thunderstorm'  },
];

const applyRandomWeather = () => {
    const pick     = RANDOM_WEATHER[Math.floor(Math.random() * RANDOM_WEATHER.length)];
    const weatherEl = document.getElementById('weather-icon');

    setWeatherCondition(pick.condition, pick.cloudCover);

    if (weatherEl) {
        weatherEl.textContent = pick.icon;
        weatherEl.title       = pick.label;
    }
};

const initWeather = () => {
    applyRandomWeather();
    // Re-randomise every 10 minutes
    setInterval(applyRandomWeather, 10 * 60 * 1000);
};

// Called from index.js after geolocation resolves — still just random
const initWeatherWithCoords = (_lat, _lon) => {
    initWeather();
};