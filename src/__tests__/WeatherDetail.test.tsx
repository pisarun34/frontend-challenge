import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useParams } from 'next/navigation';
import { useWeatherContext } from '../context/WeatherContext';
import { useTemperatureContext } from '../context/TemperatureContext';
import { useQuery } from '@tanstack/react-query';
import WeatherDetail from '../app/weather/[cityName]/page';
import TopNavBar from '../components/TopNavBar';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

jest.mock('../context/WeatherContext', () => ({
  useWeatherContext: jest.fn()
}));

jest.mock('../context/TemperatureContext', () => ({
  useTemperatureContext: jest.fn()
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('../services/api', () => ({
    forecastQueries: {
      detail: jest.fn().mockReturnValue({
        queryKey: ['forecast', { lat: 13.75, lon: 100.5 }],
        queryFn: jest.fn().mockResolvedValue({
          city: {
            name: 'Bangkok',
            country: 'TH',
            timezone: 25200,
          },
          list: [
            {
              dt: 1618317040,
              main: {
                temp: 30,
                temp_min: 25,
                temp_max: 35,
                humidity: 60,
                pressure: 1012,
              },
              weather: [
                {
                  id: 800,
                  main: 'Clear',
                  description: 'clear sky',
                  icon: '01d',
                },
              ],
              wind: {
                speed: 5,
                deg: 100,
                gust: 7,
              },
              pop: 0.1,
            },
          ],
        }),
      }),
    }
  }));

describe('WeatherDetail Component', () => {
    const mockRouterBack = jest.fn();
  
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({ back: mockRouterBack });
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    const mockWeatherData = {
      city: {
        name: 'Bangkok',
        country: 'TH',
        timezone: 25200,
      },
      list: [
        {
          dt: 1618317040,
          main: {
            temp: 30,
            temp_min: 25,
            temp_max: 35,
            humidity: 60,
            pressure: 1012,
          },
          weather: [
            {
              id: 800,
              main: 'Clear',
              description: 'clear sky',
              icon: '01d',
            },
          ],
          wind: {
            speed: 5,
            deg: 100,
            gust: 7,
          },
          pop: 0.1,
        },
      ],
    };
  
    test('renders error message if city is not found', () => {
      (useParams as jest.Mock).mockReturnValue({ cityName: 'NonExistentCity' });
      (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [] } });
      (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
      render(<WeatherDetail />);
  
      expect(screen.getByText('City not found. Please go back and select a city.')).toBeInTheDocument();
      const backButton = screen.getByText('Back to List');
      fireEvent.click(backButton);
      expect(mockRouterBack).toHaveBeenCalled();
    });
  
    test('displays loading spinner while fetching data', () => {
      (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
      (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } });
      (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
      (useQuery as jest.Mock).mockReturnValue({
        isFetching: true,
        data: null
      });
  
      render(<WeatherDetail />);
  
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  
    test('displays error message if forecast data cannot be fetched', () => {
      (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
      (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } });
      (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
      (useQuery as jest.Mock).mockReturnValue({ isFetching: false, data: null });
  
      render(<WeatherDetail />);
  
      expect(screen.getByText('Unable to fetch forecast data. Please try again later.')).toBeInTheDocument();
    });
  
    test('renders city details in metric correctly when data is fetched', async () => {
      (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
      (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } });
      (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
      (useQuery as jest.Mock).mockReturnValue({
        isFetching: false,
        data: mockWeatherData
      });
  
      render(<WeatherDetail />);

      const temperatureElements = screen.getAllByText('30 °C');
      expect(temperatureElements).toHaveLength(2);
      expect(screen.getByText('Bangkok')).toBeInTheDocument();
      expect(screen.getByText('MIN 25 °C, MAX 35 °C')).toBeInTheDocument();
      expect(screen.getByText('clear sky')).toBeInTheDocument();
      expect(screen.getByText('Humidity')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Wind')).toBeInTheDocument();
      expect(screen.getByText('5 km/h')).toBeInTheDocument();
      expect(screen.getByText('Pressure')).toBeInTheDocument();
      expect(screen.getByText('1012 mBar')).toBeInTheDocument();
      expect(screen.getByText('Chance of rain')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    test('renders city details in kelvin correctly when data is fetched', async () => {
      (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
      (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } });
      (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'kelvin', unitSymbol: 'K' } });
      (useQuery as jest.Mock).mockReturnValue({
        isFetching: false,
        data: mockWeatherData
      });
  
      render(<WeatherDetail />);

      const temperatureElements = screen.getAllByText('30 K');
      expect(temperatureElements).toHaveLength(2);
      expect(screen.getByText('Bangkok')).toBeInTheDocument();
      expect(screen.getByText('MIN 25 K, MAX 35 K')).toBeInTheDocument();
      expect(screen.getByText('clear sky')).toBeInTheDocument();
      expect(screen.getByText('Humidity')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Wind')).toBeInTheDocument();
      expect(screen.getByText('5 km/h')).toBeInTheDocument();
      expect(screen.getByText('Pressure')).toBeInTheDocument();
      expect(screen.getByText('1012 mBar')).toBeInTheDocument();
      expect(screen.getByText('Chance of rain')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    test('renders correct weather icon when data is fetched', async () => {
        (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
        (useWeatherContext as jest.Mock).mockReturnValue({ 
          state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } 
        });
        (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
        (useQuery as jest.Mock).mockReturnValue({ isFetching: false, data: mockWeatherData });
      
        render(<WeatherDetail />);
      
        const currentWeatherIcon = screen.getByTestId('current-weather-icon');
        expect(currentWeatherIcon).toHaveAttribute('src', 'http://openweathermap.org/img/wn/01d@2x.png');

        const hourlyWeatherIcon = screen.getByTestId('hourly-weather-icon-0');
        expect(hourlyWeatherIcon).toHaveAttribute('src', 'http://openweathermap.org/img/wn/01d@2x.png');
      });

      test('handles missing weather data gracefully', async () => {
        const incompleteData = {
          city: {
            name: 'Bangkok',
            country: 'TH',
            timezone: 25200,
          },
          list: [
            {
              dt: 1618317040,
              main: {
                temp: 30,
                temp_min: 25,
                temp_max: 35,
              },
              weather: [{icon: '01d'}],
              wind: null,
              pop: 0.1,
            },
          ],
        };
      
        (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
        (useWeatherContext as jest.Mock).mockReturnValue({ 
          state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } 
        });
        (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
        (useQuery as jest.Mock).mockReturnValue({ isFetching: false, data: incompleteData });
      
        render(<WeatherDetail />);
      
        expect(screen.getByText('Bangkok')).toBeInTheDocument();
        expect(screen.queryByText('clear sky')).not.toBeInTheDocument();
      });

      test('renders 24-hour forecast correctly when data is fetched', async () => {
        (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
        (useWeatherContext as jest.Mock).mockReturnValue({ 
          state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } 
        });
        (useTemperatureContext as jest.Mock).mockReturnValue({ state: { unit: 'metric', unitSymbol: '°C' } });
        (useQuery as jest.Mock).mockReturnValue({ isFetching: false, data: mockWeatherData });
      
        render(<WeatherDetail />);
      
        expect(screen.getByText('24 HOURS FORECAST')).toBeInTheDocument();
      
        const hourlyForecast = screen.getAllByText('30 °C');
        expect(hourlyForecast).toHaveLength(2);
      });
      test('toggles temperature unit when clicked', () => {
        const mockDispatch = jest.fn();
        
        (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
        (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } });
        (useTemperatureContext as jest.Mock).mockReturnValue({
          state: { unit: 'metric', unitSymbol: '°C' },
          dispatch: mockDispatch
        });
        (useQuery as jest.Mock).mockReturnValue({ isFetching: false, data: mockWeatherData });
      
        render(
          <>
            <TopNavBar />
            <WeatherDetail />
          </>
        );
      
        const toggleButton = screen.getByRole('button', { name: '°C' });
      
        fireEvent.click(toggleButton);
      
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_UNIT', payload: 'imperial' });
      });
      test('updates temperature display after unit toggle', () => {
        const mockDispatch = jest.fn();
      
        (useParams as jest.Mock).mockReturnValue({ cityName: 'Bangkok' });
        (useWeatherContext as jest.Mock).mockReturnValue({ state: { selectedCities: [{ name: 'Bangkok', lat: 13.75, lon: 100.5 }] } });
        (useTemperatureContext as jest.Mock).mockReturnValue({
          state: { unit: 'metric', unitSymbol: '°C' },
          dispatch: mockDispatch
        });
        (useQuery as jest.Mock).mockReturnValue({ isFetching: false, data: mockWeatherData });
      
        render(
          <>
            <TopNavBar />
            <WeatherDetail />
          </>
        );
      
        const temperatureElementsMetric = screen.getAllByText('30 °C');
        expect(temperatureElementsMetric).toHaveLength(2);
      
        const toggleButton = screen.getByRole('button', { name: '°C' });
      
        fireEvent.click(toggleButton);
      
        (useTemperatureContext as jest.Mock).mockReturnValue({
          state: { unit: 'imperial', unitSymbol: '°F' },
          dispatch: mockDispatch
        });
      
        render(
          <>
            <TopNavBar />
            <WeatherDetail />
          </>
        );
      
        const temperatureElementsImperial = screen.getAllByText('30 °F');
        expect(temperatureElementsImperial).toHaveLength(2);
      });
  });
  
