"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeatherProvider } from '../context/WeatherContext';
import { TemperatureProvider } from '../context/TemperatureContext';
import TopNavBar from '../components/TopNavBar';
import './globals.css';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Weather App</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <TemperatureProvider>
            <TopNavBar />
            <WeatherProvider>
              {children}
            </WeatherProvider>
          </TemperatureProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
