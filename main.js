// --- CONFIGURATION ---
const CONFIG = {
    lat: 35.2271,  // Charlotte, NC
    long: -80.8431,
    unit: 'fahrenheit' // 'celsius' or 'fahrenheit'
};
// ---------------------

// Lucide icon names for weather conditions
const ICONS = {
    default: 'circle-help',
    sunny: 'sun',
    cloudy: 'cloud',
    rainy: 'cloud-rain',
    snowy: 'cloud-snow',
    partlycloudy: 'cloud-sun',
    thunderstorm: 'cloud-lightning'
};

function getIconFromWMO(code) {
    if (code === 0) return 'sunny';
    if ([1, 2, 3].includes(code)) return 'partlycloudy';
    if ([45, 48].includes(code)) return 'cloudy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rainy';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
    if ([95, 96, 99].includes(code)) return 'thunderstorm';
    return 'default';
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);

    document.getElementById('time').textContent = `${hours}:${minutes}`;
    document.getElementById('date').textContent = dateStr;
}

async function updateWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.lat}&longitude=${CONFIG.long}&current=temperature_2m,weather_code&temperature_unit=${CONFIG.unit}`;

        // Add a random timestamp to prevent caching
        const bustCache = url + "&t=" + new Date().getTime();

        const response = await fetch(bustCache);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Safety check: Did we get the data structure we expect?
        if (!data.current) {
            throw new Error("Invalid API Data");
        }

        const temp = Math.round(data.current.temperature_2m);
        const wmoCode = data.current.weather_code;
        const unitSymbol = data.current_units.temperature_2m;

        document.getElementById('weather-text').textContent = `${temp}${unitSymbol}`;

        const iconKey = getIconFromWMO(wmoCode);
        const svgString = `<svg viewBox="0 0 24 24">${ICONS[iconKey]}</svg>`;
        document.getElementById('weather-icon').innerHTML = svgString;

        // Clear any previous errors
        weatherError = null;
        updateClock(); // Force immediate redraw to remove error text

    } catch (error) {
        // SAVE THE ERROR to display it on the clock face
        console.error("Weather failed:", error);
        weatherError = error.toString();
        document.getElementById('weather-text').textContent = "--";
        updateClock(); // Force immediate redraw to show error
    }
}

updateClock();
updateWeather();
setInterval(updateClock, 1000);
setInterval(updateWeather, 900000); // 15 mins
