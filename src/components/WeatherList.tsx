"use client";
import React from 'react';
import { List } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useWeatherContext } from '../context/WeatherContext';
import CityItem from './WeatherItem';

export default function CityList() {
  const { state, dispatch } = useWeatherContext();
  const router = useRouter();
  const handleRemoveCity = (cityName: string) => {
    dispatch({ type: 'REMOVE_CITY', payload: cityName });
  };

  const handleCityClick = (cityName: string) => {
    router.push(`/weather/${cityName}`);
  };

  return (
    <List>
      {state.selectedCities.map((city, index) => (
        <CityItem
          key={index}
          cityName={city.name}
          onRemove={() => handleRemoveCity(city.name)}
          onClick={() => handleCityClick(city.name)}
        />
      ))}
    </List>
  );
}


