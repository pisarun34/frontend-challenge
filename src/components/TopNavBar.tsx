"use client";

import React from 'react';
import UnitToggle from './UnitToggle';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const TopNavBar = () => {
  return (
    <AppBar position="static" color="default" elevation={2}>
      <Toolbar className="flex justify-between">
        <Typography variant="h6" component="div" className="text-gray-800">
          Weather App
        </Typography>
        <Box className="flex items-center space-x-4">
          <UnitToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
