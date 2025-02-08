"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Typography , CircularProgress} from '@mui/material';
import { useWeatherContext } from '../../../context/WeatherContext';
import { forecastQueries } from '../../../services/api';
import { useQuery } from '@tanstack/react-query';
import { useTemperatureContext } from '../../../context/TemperatureContext';

export default function WeatherDetail() {
  const { state : temperatureState } = useTemperatureContext();
  const { cityName } = useParams();
  const decodedCityName = Array.isArray(cityName) 
  ? decodeURIComponent(cityName[0]) 
  : decodeURIComponent(cityName);
  const { state } = useWeatherContext();
  const router = useRouter();

  const city = state.selectedCities.find(city => city.name === decodedCityName);

  if (!city) {
    // Display error message if city not found in selected cities
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
    ...forecastQueries.detail({ lat: city.lat , lon: city.lon , cnt: 8 , units: temperatureState.unit }),
  });

  if (isFetching) {
    // Display loading spinner while fetching forecast data
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!forecast) {
    return (
      // Display error message if forecast data cannot be fetched
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
          <Typography variant="h4" className="font-bold">{city?.name || 'Unknown City'}</Typography>
          <Typography variant="subtitle1">{currentWeather?.dt ? new Date(currentWeather.dt * 1000).toLocaleDateString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }) : 'Date Unavailable'}</Typography>
          <Typography variant="body2" className="text-gray-500">
            MIN {currentWeather?.main?.temp_min ? Math.round(currentWeather.main.temp_min) : '--'} {temperatureState.unitSymbol}, MAX {currentWeather?.main?.temp_max ? Math.round(currentWeather.main.temp_max) : '--'} {temperatureState.unitSymbol}
          </Typography>
        </div>
  
        {/* Current Temperature */}
        <div className="flex flex-col items-center my-6">
          {currentWeather?.weather?.[0]?.icon ? (
            <img
              src={`http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
              alt={currentWeather.weather[0]?.description || 'Weather Icon'}
              className="w-24 h-24 mx-auto my-1"
              data-testid="current-weather-icon"
            />
          ) : (
            <div className="w-24 h-24 mx-auto my-1 bg-gray-200 flex items-center justify-center">No Icon</div>
          )}
          <Typography variant="h2" className="text-6xl font-bold">
            {currentWeather?.main?.temp ? Math.round(currentWeather.main.temp) : '--'} {temperatureState.unitSymbol}
          </Typography>
          <Typography variant="h6" className="text-gray-500 mt-2 capitalize">
            {currentWeather?.weather?.[0]?.description || 'Description Unavailable'}
          </Typography>
        </div>
  
        {/* 24 Hours Forecast */}
        <div className="my-4">
          <Typography variant="subtitle1" className="font-semibold mb-2">
            24 HOURS FORECAST
          </Typography>
  
          {/* scroll bar  */}
          <div className="flex space-x-4 overflow-x-auto touch-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2">
            {forecastList?.length ? forecastList.map((item, index) => (
              <div key={index} className="text-center min-w-[100px] mx-auto">
                <Typography variant="body2">
                  {item?.dt ? new Date((item.dt + (forecastCity?.timezone || 0)) * 1000).toLocaleTimeString([], {
                    hour: 'numeric',
                    hour12: true,
                    timeZone: 'UTC'
                  }) : 'Time Unavailable'}
                </Typography>
                {item?.weather?.[0]?.icon ? (
                  <img
                    src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt={item.weather[0]?.description || 'Forecast Icon'}
                    className="w-16 h-16 mx-auto my-1"
                    data-testid={`hourly-weather-icon-${index}`}
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto my-1 bg-gray-200 flex items-center justify-center">No Icon</div>
                )}
                <Typography variant="body1">{item?.main?.temp ? Math.round(item.main.temp) : '--'} {temperatureState.unitSymbol}</Typography>
              </div>
            )) : (
              <Typography variant="body2">No Forecast Data Available</Typography>
            )}
          </div>
        </div>
  
        {/* Current Details */}
        <div className="mt-6 border-t pt-4">
          <Typography variant="subtitle1" className="font-semibold mb-2">CURRENT DETAILS</Typography>
          <div className="grid grid-cols-2 gap-y-2 text-gray-700 mx-auto w-[80%]">
            <div>Humidity</div><div>{currentWeather?.main?.humidity !== undefined ? `${currentWeather.main.humidity}%` : '--'}</div>
            <div>Wind</div><div>{currentWeather?.wind?.speed !== undefined ? `${currentWeather.wind.speed} km/h` : '--'}</div>
            <div>Pressure</div><div>{currentWeather?.main?.pressure !== undefined ? `${currentWeather.main.pressure} mBar` : '--'}</div>
            <div>Chance of rain</div><div>{currentWeather?.pop !== undefined ? `${Math.round(currentWeather.pop * 100)}%` : '--'}</div>
          </div>
        </div>
      </div>
    </div>
  );
  
}
