const axios = require("axios");

async function getWeather(city) {
  if (!city) return "❓ Usage: *kola weather <city name>*";

  try {
    const key = process.env.OPENWEATHER_KEY;
    const res = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric`
    );

    const d = res.data;
    const name = d.name;
    const country = d.sys.country;
    const temp = d.main.temp;
    const feels = d.main.feels_like;
    const desc = d.weather[0].description;
    const humidity = d.main.humidity;
    const wind = d.wind.speed;

    return (
      `🌍 *${name}, ${country}*\n` +
      `🌡️ Temp: ${temp}°C (feels like ${feels}°C)\n` +
      `🌤️ ${desc.charAt(0).toUpperCase() + desc.slice(1)}\n` +
      `💧 Humidity: ${humidity}%\n` +
      `💨 Wind: ${wind} m/s`
    );
  } catch (err) {
    if (err?.response?.status === 404) return `❌ City "${city}" not found.`;
    if (err?.response?.status === 401) return "❌ Invalid weather API key. Check your .env file.";
    return "❌ Could not fetch weather. Try again later.";
  }
}

module.exports = { getWeather };
