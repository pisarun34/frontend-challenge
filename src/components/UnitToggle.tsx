// src/components/UnitToggle.tsx
"use client";

import React from 'react';
import { useTemperatureContext , TemperatureUnit } from '../context/TemperatureContext';
import { IconButton  } from '@mui/material';

const UnitToggle = () => {
  const { state, dispatch } = useTemperatureContext();

  const units: TemperatureUnit[] = ['metric', 'imperial', 'kelvin'];
  const unitSymbols = { metric: '°C', imperial: '°F', kelvin: 'K' };

  const toggleUnit = () => {
    const currentIndex = units.indexOf(state.unit);
    const nextIndex = (currentIndex + 1) % units.length;
    dispatch({ type: 'SET_UNIT', payload: units[nextIndex] });
  };

  const unitColors = {
    metric: 'bg-blue-500 hover:bg-blue-600',
    imperial: 'bg-red-500 hover:bg-red-600',
    kelvin: 'bg-green-500 hover:bg-green-600',
  };

  return (

    <IconButton
      onClick={toggleUnit}
      disableRipple
      disableFocusRipple
      className={`w-8 h-8 rounded-full text-white text-sm shadow-md transition ${unitColors[state.unit]}`}
    >
      {unitSymbols[state.unit]}
    </IconButton>
  );
};

export default UnitToggle;
