// --- CONFIGURATION ---
const CONFIG = {
    lat: 35.2271,  // Charlotte, NC
    long: -80.8431,
    unit: 'fahrenheit' // 'celsius' or 'fahrenheit'
};
// ---------------------

// Inline SVG paths for weather icons (no external dependencies)
const ICONS = {
    default: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    sunny: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    cloudy: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    rainy: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
    snowy: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>',
    partlycloudy: '<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
    thunderstorm: '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>'
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
        const svgPaths = ICONS[iconKey];
        document.getElementById('weather-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPaths}</svg>`;

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
