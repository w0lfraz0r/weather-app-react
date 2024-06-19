import React, { useState, useEffect } from "react";
import "../assets/styles/FiveDaysWeatherForecast.css";

const FiveDaysWeatherForecast = () => {
    const [latitude, setLatitude] = useState(34.0522);
    const [longitude, setLongitude] = useState(118.2437);
    const [city, setCity] = useState("Suqian");
    const [country, setCountry] = useState("CN");
    const [isWeatherDataAvailable, setIsWeatherDataAvailable] = useState(false);
    const [fetchFailed, setFetchFailed] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

    const API_key = '074cfb46165e7b23dd4e54c943a1d145';

    const locateMe = () => {
        setLocationPermissionDenied(false);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Location Available");

                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    setLatitude(lat);
                    setLongitude(lon);
                    setCity(null);

                    fetchFiveDayForeCast(lat, lon);
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        console.log("before set state");
                        setLocationPermissionDenied(true);
                        console.log("Location Unavailable");
                    }
                }
            );
        }
    };

    const generalWeatherData = (passedWeatherData) => {
        return Object.entries(passedWeatherData).map((element) => {
            return {
                key: element[1].dt,
                date_str: element[0],
                temp: element[1].main.temp,
                feels_like: element[1].main.feels_like,
                temp_max: element[1].main.temp_min,
                temp_min: element[1].main.temp_max,
                main: element[1].weather[0].main,
                description: element[1].weather[0].description,
                icon: element[1].weather[0].icon,
                weatherIconURL: `http://openweathermap.org/img/wn/${element[1].weather[0].icon}@2x.png`
            };
        });
    };

    const fetchFiveDayForeCast = (latitude, longitude) => {
        const lang = 'en';
        const units = 'metric';
        const url = `https://api.openweathermap.org/data/2.5/forecast/?lat=${latitude}&lon=${longitude}&appid=${API_key}&units=${units}&lang=${lang}`;

        setFetchFailed(null);
        setShowLoader(true);
        setIsWeatherDataAvailable(false);

        console.log("fetch called with lat/long ", latitude, "/", longitude);
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    console.log("Response not okay");
                    throw new Error(response.statusText);
                } else {
                    console.log("Response okay");
                    return response.json();
                }
            })
            .then((data) => {
                const timeStamp = data.list[0].dt_txt.slice(-8);

                const weatherData = data.list.reduce((accumulator, entry) => {
                    if (!accumulator[entry.dt_txt.split(" ")[0]]) {
                        accumulator[entry.dt_txt.split(" ")[0]] = entry;
                    } else if (entry.dt_txt.slice(-8) === timeStamp) {
                        accumulator[entry.dt_txt.split(" ")[0]] = entry;
                    }
                    return accumulator;
                }, {});

                setIsWeatherDataAvailable(true);
                setCity(data.city.name);
                setCountry(data.city.country);
                setShowLoader(false);
                setFetchFailed(false);
                setWeatherData(generalWeatherData(weatherData));
            })
            .catch((error) => {
                console.error(error);
                setFetchFailed(true);
                setShowLoader(false);
                setCity(null);
            });
    };

    useEffect(() => {
        fetchFiveDayForeCast(latitude, longitude);
    }, []);

    return (
        <div className="weather-forecast-container">
            {city !== null && (
                <h2 className="location-name">
                    {city}, {country}
                </h2>
            )}
            {locationPermissionDenied === true && (
                <h4 className="location-name">
                    You denied location permission, showing default location!
                </h4>
            )}
            {showLoader === true && city === null && (
                <h2 className="location-name">Getting your location data...</h2>
            )}
            <span>
                Latitude : {latitude}, Longitude : {longitude}
            </span>
            <div>
                <button onClick={locateMe} title="Press to let us know your location">
                    Locate Me
                </button>
            </div>
            <div className="main-content">
                {showLoader === true && <div className="loader"></div>}
                {isWeatherDataAvailable === true && (
                    <ul>
                        {weatherData.map((dailyData) => (
                            <li className="card" key={dailyData.key}>
                                <h3>{new Date(dailyData.date_str).toString().slice(0, 15)}</h3>
                                <img
                                    width="40px"
                                    height="40px"
                                    src={dailyData.weatherIconURL}
                                    alt={dailyData.description}
                                />
                                <p>Weather : {dailyData.main}</p>
                                <p>Temperature : {dailyData.temp}&deg; C</p>
                                <p>Feels Like : {dailyData.feels_like}&deg; C</p>
                                <p>Minimum : {dailyData.temp_min}&deg; C</p>
                                <p>Maximum : {dailyData.temp_max}&deg; C</p>
                            </li>
                        ))}
                    </ul>
                )}
                {fetchFailed === true && showLoader === false && (
                    <div className="error-div">
                        <h2>Sorry we failed to fetch weather data!</h2>
                    </div>
                )}
                {isWeatherDataAvailable === false && showLoader === false && (
                    <div className="error-div">
                        <h2>Sorry weather data unavailable, try again later!</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FiveDaysWeatherForecast;
