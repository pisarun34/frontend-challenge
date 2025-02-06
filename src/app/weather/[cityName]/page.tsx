"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Typography , CircularProgress} from '@mui/material';
import { useCityContext } from '../../../context/CityContext';
import { forecastQueries } from '../../../services/api';
import { useQuery } from '@tanstack/react-query';

export default function CityDetail() {
  const { cityName } = useParams();
  const decodedCityName = Array.isArray(cityName) 
  ? decodeURIComponent(cityName[0])  // ถ้าเป็น array ให้ใช้ค่าตัวแรก
  : decodeURIComponent(cityName);    // ถ้าเป็น string ให้ถอดรหัสตรง ๆ
  const { state } = useCityContext();
  const router = useRouter();

  console.log(decodedCityName);

  const city = state.selectedCities.find(city => city.name === decodedCityName);

  if (!city) {
    return (
        <div className="p-4">
            <Typography variant="h6" className="text-center mt-10">
                City not found. Please go back and select a city.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.back()} className="mt-4">
                Back to List
            </Button>
        </div>
      
      
    );
  }

  const { data: forecast, isFetching } = useQuery({
    ...forecastQueries.detail({ lat: city.lat , lon: city.lon , cnt: 5 , units: 'metric' }),
  });

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="p-4 text-center">
        <Typography variant="h6" className="mt-10">
          Unable to fetch forecast data. Please try again later.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => router.back()} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  const currentWeather = forecast.list[0];
  const forecastList = forecast?.list;
  const forecastCity = forecast.city;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full">
        {/* City Name and Date */}
        <div className="text-center mb-4">
          <Typography variant="h4" className="font-bold">{city.name}</Typography>
          <Typography variant="subtitle1">{new Date(currentWeather.dt * 1000).toLocaleDateString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}</Typography>
          <Typography variant="body2" className="text-gray-500">
            MIN {Math.round(currentWeather.main.temp_min)}°, MAX {Math.round(currentWeather.main.temp_max)}°
          </Typography>
        </div>

        {/* Current Temperature */}
        <div className="flex flex-col items-center my-6">
          <img
            src={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
            alt={currentWeather.weather[0].description}
            className="w-24 h-24 mx-auto my-1"
          />
          <Typography variant="h2" className="text-6xl font-bold">{Math.round(currentWeather.main.temp)}°</Typography>
          <Typography variant="h6" className="text-gray-500 mt-2 capitalize">{currentWeather.weather[0].description}</Typography>
        </div>

        {/* 24 Hours Forecast */}
        <div className="my-4">
          <Typography variant="subtitle1" className="font-semibold mb-2">
            24 HOURS FORECAST
          </Typography>

          {/* ✅ เพิ่ม scroll bar ในแนวนอน และการจัดการพื้นที่ */}
          <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2">
            {forecastList.map((item, index) => (
              <div key={index} className="text-center min-w-[80px]">
                <Typography variant="body2">
                  {new Date((item.dt + forecastCity.timezone) * 1000).toLocaleTimeString([], {
                    hour: 'numeric',
                    hour12: true,
                    timeZone: 'UTC'
                  })}
                </Typography>
                <img
                  src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].description}
                  className="w-16 h-16 mx-auto my-1"
                />
                <Typography variant="body1">{Math.round(item.main.temp)}°</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Current Details */}
        <div className="mt-6 border-t pt-4">
          <Typography variant="subtitle1" className="font-semibold mb-2">CURRENT DETAILS</Typography>
          <div className="grid grid-cols-2 gap-y-2 text-gray-700 mx-auto w-[80%]">
            <div>Humidity</div><div>{currentWeather.main.humidity}%</div>
            <div>Wind</div><div>{currentWeather.wind.speed} km/h</div>
            <div>Pressure</div><div>{currentWeather.main.pressure} mBar</div>
            <div>Chance of rain</div><div>{Math.round(currentWeather.pop * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
