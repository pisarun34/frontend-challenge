"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { weatherQueries } from '../services/api';
import { Autocomplete, TextField , List , ListItem , ListItemText} from '@mui/material';
import { CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CityItem({
    cityName,
    onRemove,
    onClick,
  }: {
    cityName: string;
    onRemove: () => void;
    onClick: () => void;
  }) {
    const { data: weatherData, isLoading, error } = useQuery({
        ...weatherQueries.detail({ q: cityName , units: 'metric' }),
        enabled: !!cityName,
        refetchInterval: 1000 * 60 * 5,
        staleTime: 1000 * 60 * 3,
    });
  
  
    if (isLoading) {
      return (
        <ListItem sx={{ backgroundColor: 'white', boxShadow: 1, borderRadius: 2, mb: 1 }}>
          <CircularProgress size={24} />
          <ListItemText primary={`Loading ${cityName}...`} />
        </ListItem>
      );
    }
  
    if (error || !weatherData) {
      return (
        <ListItem sx={{ backgroundColor: 'white', boxShadow: 1, borderRadius: 2, mb: 1 }}>
          <ListItemText primary={cityName} secondary="Failed to load weather data" />
          <IconButton edge="end" onClick={onRemove}>
            <DeleteIcon />
          </IconButton>
        </ListItem>
      );
    }
  
    // 🌡️ ดึงอุณหภูมิและเวลาท้องถิ่น
    const temperature = weatherData.main.temp;
    const utcTimestamp = weatherData.dt;  // เวลาปัจจุบัน (UTC) จาก OpenWeather API
    const timezoneOffset = weatherData.timezone;  // การชดเชยเวลาจาก UTC (เช่น +7 ชั่วโมง สำหรับไทย = 25200 วินาที)

    const localTimestamp = (utcTimestamp + timezoneOffset) * 1000;  // รวมเวลาและแปลงเป็นมิลลิวินาที

    const localTime = new Date(localTimestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,  // ✅ ใช้ hour12 เพื่อแสดง AM/PM
        timeZone: 'UTC'  // ใช้ 'UTC' เพื่อไม่ให้เบราว์เซอร์ชดเชยเวลาอีกครั้ง
    });
  
    return (
        <ListItem
          sx={{ backgroundColor: 'white', boxShadow: 1, borderRadius: 2, mb: 1 }}
          onClick={onClick}  // ✅ ทำงานเมื่อคลิกที่ ListItem ทั้งหมด (ยกเว้น IconButton)
          style={{ cursor: 'pointer' }}
        >
          <ListItemText
            primary={cityName}
            secondary={`Local Time: ${localTime}`}
          />
          <span className="text-2xl text-gray-700">{Math.round(temperature)}°C</span>
      
          {/* ✅ หยุด Event จากการ Bubble ด้วย event.stopPropagation() */}
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();  // หยุด Event ไม่ให้ Bubble ไปที่ ListItem
              onRemove();           // เรียกฟังก์ชันลบเมือง
            }}
          >
            <DeleteIcon />
          </IconButton>
        </ListItem>
      );
  }