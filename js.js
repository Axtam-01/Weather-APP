document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search");
    const cityName = document.querySelector(".city-name");
    const temperature = document.querySelector(".temperature");
    const rainPercentage = document.querySelector(".rain-percentage");
    const forecastContainer = document.querySelector(".weather-forecast .temperature-block");
    const realFeel = document.querySelector(".temp_value h1 span");
    const windSpeed = document.querySelector(".wind-info h1 span");
    const humidity = document.querySelector(".humidity_level h1 span");
    const uvIndex = document.querySelector(".uv_index h1");

    const MAX_RAIN_MM = 10;
    const API_KEY = "286d526543394fa53c2fcb9d35c1ddf7";
    const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
    const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
    const UV_URL = "https://api.openweathermap.org/data/2.5/uvi";

    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            //  e.preventDefault();
            const city = searchInput.value.trim();
            if (city) {
                getWeather(city);
                getHourlyForecast(city);
                getAirConditions(city);
            }
        }
    });

    async function getWeather(city) {
        try {
            const response = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`);
            const data = await response.json();

            if (data.cod === 200) {
                cityName.textContent = data.name;
                temperature.textContent = `${Math.round(data.main.temp)}°C`;
                rainPercentage.textContent = data.rain?.["1h"]
                    ? `${Math.min((data.rain["1h"] / MAX_RAIN_MM) * 100, 100).toFixed(1)}%`
                    : "0%";

                searchInput.value = "";
            } else {
                alert("City not found. Please try again.");
            }
        } catch (error) {
            alert("An error occurred: Check your Internet connection.");
            console.error("Error fetching weather:", error);
        }
    }

    async function getHourlyForecast(city) {
        try {
            const response = await fetch(`${FORECAST_URL}?q=${city}&units=metric&appid=${API_KEY}`);
            const data = await response.json();

            if (data.cod !== "200") {
                alert("City not found. Please try again.");
                return;
            }

            forecastContainer.innerHTML = ""; // Oldingi ma'lumotlarni tozalash

            const forecasts = data.list.slice(0, 6); // Faqat keyingi 6 ta vaqt oralig‘ini olish

            forecasts.forEach((forecast, index) => {
                const time = new Date(forecast.dt * 1000).getHours() + ":00"; // Vaqtni olish
                const temp = Math.round(forecast.main.temp); // Harorat
                const icon = forecast.weather[0].icon; // Belgisi

                // HTML element yaratish
                const forecastElement = document.createElement("div");
                forecastElement.classList.add("forecast-item");
                forecastElement.innerHTML = `
                    <p>${time}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
                    <h2>${temp}°C</h2>
                `;

                forecastContainer.appendChild(forecastElement);

                // Har bir prognoz orasiga chiziq qo'shish
                if (index < forecasts.length - 1) {
                    const lineElement = document.createElement("span");
                    lineElement.classList.add("line");
                    forecastContainer.appendChild(lineElement);
                }
            });

        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    }

    async function getAirConditions(city) {
        try {
            const response = await fetch(`${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`);
            const data = await response.json();

            if (data.cod !== 200) {
                alert("City not found. Please try again.");
                return;
            }

            realFeel.textContent = Math.round(data.main.feels_like);
            windSpeed.textContent = Math.round(data.wind.speed);
            humidity.textContent = data.main.humidity;

            // UV indeksini olish (Kordinata kerak!)
            const lat = data.coord.lat;
            const lon = data.coord.lon;

            const uvResponse = await fetch(`${UV_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            const uvData = await uvResponse.json();
            uvIndex.textContent = uvData.value.toFixed(1); // UV indeksi

        } catch (error) {
            console.error("Error fetching air conditions:", error);
        }
    }


    
    
});
