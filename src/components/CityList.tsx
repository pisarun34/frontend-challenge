"use client";
import React from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { useCityContext } from '../context/CityContext';
import CityItem from './CityItem';

export default function CityList() {
  const { state, dispatch } = useCityContext();
  const router = useRouter();

  // 🔥 ฟังก์ชันสำหรับลบเมืองจาก List
  const handleRemoveCity = (cityName: string) => {
    dispatch({ type: 'REMOVE_CITY', payload: cityName });
  };

  // 🔥 เมื่อคลิกเมือง จะไปหน้า Detail
  const handleCityClick = (cityName: string) => {
    router.push(`/weather/${cityName}`);  // ไปที่หน้ารายละเอียดเมือง
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


