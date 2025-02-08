"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { weatherQueries } from '../services/api';
import { ListItem , ListItemText} from '@mui/material';
import { CircularProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTemperatureContext } from '../context/TemperatureContext';

export default function CityItem({
    cityName,
    onRemove,
    onClick,
  }: {
    cityName: string;
    onRemove: () => void;
    onClick: () => void;
  }) {
    const { state } = useTemperatureContext();
    const { data: weatherData, isLoading, error } = useQuery({
        ...weatherQueries.detail({ q: cityName , units: state.unit }),
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
      onRemove()
      return null
    }
  
    // calculate local date time
    const temperature = weatherData.main.temp;
    const utcTimestamp = weatherData.dt;  
    const timezoneOffset = weatherData.timezone; 
    const localTimestamp = (utcTimestamp + timezoneOffset) * 1000; 
    const localDateTime = new Date(localTimestamp).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  
    return (
      
        <ListItem
          sx={{ backgroundColor: 'white', boxShadow: 1, borderRadius: 2, mb: 1 }}
          onClick={onClick} 
          style={{ cursor: 'pointer' }}
        >
          <ListItemText
            primary={cityName}
            secondary={localDateTime}
          />
          <span className="text-2xl text-gray-700">{Math.round(temperature)} {state.unitSymbol}</span>
      
          
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation(); 
              onRemove(); 
            }}
            aria-label={`Remove ${cityName}`}
          >
            <DeleteIcon />
          </IconButton>
        </ListItem>
      );
  }