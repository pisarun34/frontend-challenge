import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTemperatureContext } from '../context/TemperatureContext';
import { TemperatureProvider } from '../context/TemperatureContext';
import { useRouter } from 'next/navigation';
import WeatherSearch from '../app/weather/page';
import { useWeatherContext , WeatherProvider } from '../context/WeatherContext';
import TopNavBar from '../components/TopNavBar';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
  const actualReactQuery = jest.requireActual('@tanstack/react-query');
  return {
    ...actualReactQuery,
    useQuery: jest.fn()
  };
});

jest.mock('../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,  // คืนค่าทันที
}));

const queryClient = new QueryClient();


jest.mock('../services/api', () => ({
  geocodingQueries: {
    list: jest.fn().mockReturnValue({
      queryKey: ['geo', '1.0', 'direct', { q: "Bangkok", limit: 5 }],
      queryFn: jest.fn().mockResolvedValue([
        {
          name: "Bangkok",
          local_names: { en: "Bangkok" },
          lat: 13.7525,
          lon: 100.494,
          country: "TH",
          state: "Bangkok"
        }
      ])
    }),
    zip: jest.fn().mockReturnValue({
      queryKey: ['geo', '1.0', 'zip', { zip: "10110" }],
      queryFn: jest.fn().mockResolvedValue({
        name: "Bangkok",
        local_names: { en: "Bangkok" },
        lat: 13.7525,
        lon: 100.494,
        country: "TH",
        state: "Bangkok",
        zip: "10110"
      })
    })
  },
  weatherQueries: {
    detail: jest.fn().mockReturnValue({
      queryKey: ['data', '2.5', 'weather', { lat: 13.7525, lon: 100.494 }],
      queryFn: jest.fn().mockResolvedValue({
        main: {
          temp: 30,
          feels_like: 32,
          temp_min: 28,
          temp_max: 34,
          pressure: 1012,
          humidity: 60
        },
        dt: 1618317040,
        timezone: 25200
      })
    })
  }
}));


  

describe('WeatherSearchApp', () => {
    // Mock dependencies
    beforeEach(() => {
      (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

      (useQuery as jest.Mock)
        .mockImplementation(({ queryKey }) => {
          if (queryKey.includes('direct')) {
            return {
              data: [
                {
                  name: "Bangkok",
                  local_names: { en: "Bangkok" },
                  lat: 13.7525,
                  lon: 100.494,
                  country: "TH",
                  state: "Bangkok",
                },
                {
                  name: "Bangkok",
                  local_names: { en: "Bangkok" },
                  lat: 14.7525,
                  lon: 101.494,
                  country: "EU",
                  state: "Test",
                },
              ],
              isFetching: false,
            };
          }
          if (queryKey.includes('zip')) {
            return {
              data: {
                  name: "Bangkok",
                  local_names: { en: "Bangkok" },
                  lat: 13.7525,
                  lon: 100.494,
                  country: "TH",
                  state: "Bangkok",
                  zip: "10110",
                },
              isFetching: false,
            };
          }
          if (queryKey.includes('weather')) {
            return {
              data: {
                main: {
                  temp: 30,
                  feels_like: 32,
                  temp_min: 28,
                  temp_max: 34,
                  pressure: 1012,
                  humidity: 60,
                },
                dt: 1618317040,
                timezone: 25200,
              },
              isFetching: false,
            };
          }

          // Default return for unexpected queries
          return {
            data: null,
            isFetching: false,
          };
        });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
  it('renders the search input', () => {
    render(<WeatherSearch />);
    const searchInput = screen.getByLabelText(/search city or zip/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows user to type in search box', () => {
    render(<WeatherSearch />);
    const searchInput = screen.getByLabelText(/search city or zip/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
    expect(searchInput).toHaveValue('Bangkok');
  });

  it('displays suggestions when typing in search box', async () => {
    render(<WeatherSearch />);

    const searchInput = await screen.findByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });

    await waitFor(() => {
        const suggestion = screen.getByText('Bangkok, TH') as HTMLLIElement;  
        expect(suggestion).toBeInTheDocument();
    });
  });

  it('adds a city to the list when selected from suggestions', async () => {
    render(
      <WeatherProvider>
        <WeatherSearch />
      </WeatherProvider>
    );

    const searchInput = screen.getByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH');
      fireEvent.click(suggestion);
    });

    expect(screen.getByText(/Bangkok/i)).toBeInTheDocument();
    });

  it('clears input field after selecting a city', async () => {
    render(<WeatherSearch />);
    const inputElement = screen.getByLabelText(/Search City or Zip/i) as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: 'Bangkok' } });

    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH');
      fireEvent.click(suggestion);
    });

    await waitFor(() => {
        expect(inputElement.value).toBe('');
    });
  });
  it('Searches for a city by zip code', async () => {
    render(<WeatherSearch />);
    const inputElement = screen.getByLabelText(/Search City or Zip/i) as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: '10110' } });

    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH (10110)');
      expect(suggestion).toBeInTheDocument();
    });
  });
  it('Delete city when fetch data error', async () => {
    (useQuery as jest.Mock)
        .mockImplementation(({ queryKey }) => {
          if (queryKey.includes('direct')) {
            return {
              data: [
                {
                  name: "Bangkok",
                  local_names: { en: "Bangkok" },
                  lat: 13.7525,
                  lon: 100.494,
                  country: "TH",
                  state: "Bangkok",
                },
                {
                  name: "Bangkok",
                  local_names: { en: "Bangkok" },
                  lat: 14.7525,
                  lon: 101.494,
                  country: "EU",
                  state: "Test",
                },
              ],
              isFetching: false,
            };
          }
          if (queryKey.includes('zip')) {
            return {
              data: {
                  name: "Bangkok",
                  local_names: { en: "Bangkok" },
                  lat: 13.7525,
                  lon: 100.494,
                  country: "TH",
                  state: "Bangkok",
                  zip: "10110",
                },
              isFetching: false,
            };
          }
          if (queryKey.includes('weather')) {
            return {
              data: null,
              isFetching: false,
            };
          }

          return {
            data: null,
            isFetching: false,
          };
        });
    render(
      <WeatherProvider>
        <WeatherSearch />
      </WeatherProvider>
    );

    const searchInput = screen.getByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH');
      fireEvent.click(suggestion);
    });
    await waitFor(() => {
      expect(screen.queryByText('Bangkok')).toBeNull();
    });
  });
  it('updates temperature display after unit toggle', async () => {
    render(
      <TemperatureProvider>
        <WeatherProvider>
          <TopNavBar />
          <WeatherSearch />
        </WeatherProvider>
      </TemperatureProvider>
    );

    const searchInput = screen.getByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH');
      fireEvent.click(suggestion);
    });

    expect(screen.getByText('30 K')).toBeInTheDocument();

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: 'K' });
      fireEvent.click(toggleButton);
    });

    expect(screen.getByText('30 °C')).toBeInTheDocument();

    });
  it('remove citi from list', async () => {
    render(
      <WeatherProvider>
        <WeatherSearch />
      </WeatherProvider>
    );

    const searchInput = screen.getByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH');
      fireEvent.click(suggestion);
    });

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: 'Remove Bangkok' });
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Bangkok')).toBeNull();
    });
  });
  it('navigates to city detail page when a city is selected from suggestions', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush, 
    });

    render(
      <WeatherProvider>
        <WeatherSearch />
      </WeatherProvider>
    );
  
    const searchInput = screen.getByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
  
    await waitFor(() => {
      const suggestion = screen.getByText('Bangkok, TH');
      fireEvent.click(suggestion);
    });

    const cityInList = screen.getByText('Bangkok');
    fireEvent.click(cityInList);  

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/weather/Bangkok');
    });

  });
});
