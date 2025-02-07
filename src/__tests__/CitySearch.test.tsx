import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CitySearch from '../app/weather/page';
import {CityProvider} from '../context/CityContext';
import { QueryClient, QueryClientProvider, useQuery  } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const queryClient = new QueryClient();

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
  }));

describe('CitySearchApp', () => {
    // Mock dependencies
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
          push: jest.fn(),
        });
      });
  it('renders the search input', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CityProvider>
          <CitySearch />
        </CityProvider>
      </QueryClientProvider>
    );
    const searchInput = screen.getByLabelText(/search city or zip/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows user to type in search box', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CityProvider>
          <CitySearch />
        </CityProvider>
      </QueryClientProvider>
    );

    const searchInput = screen.getByLabelText(/Search City or Zip/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Bangkok' } });
    expect(searchInput).toHaveValue('Bangkok');
  });

  it('displays suggestions when typing in search box', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CityProvider>
          <CitySearch />
        </CityProvider>
      </QueryClientProvider>
    );

    const searchInput = await screen.findByLabelText(/Search City or Zip/i);  // ✅ รอให้ input ปรากฏ
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } });

    await waitFor(() => {
        const suggestion = screen.getByText('Tokyo, JP') as HTMLLIElement;  
        expect(suggestion).toBeInTheDocument();
    });
  });

  it('adds a city to the list when selected from suggestions', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CityProvider>
          <CitySearch />
        </CityProvider>
      </QueryClientProvider>
    );

    const searchInput = screen.getByLabelText(/Search City or Zip/i);
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } });

    await waitFor(() => {
      const suggestion = screen.getByText(/Tokyo, JP/i);
      fireEvent.click(suggestion);
    });

    await waitFor(() => {
        expect(screen.getByText(/Tokyo/i)).toBeInTheDocument();
      });
  });

  it('clears input field after selecting a city', async () => {
    render(
        <QueryClientProvider client={queryClient}>
          <CityProvider>
            <CitySearch />
          </CityProvider>
        </QueryClientProvider>
      );
    const inputElement = screen.getByLabelText(/Search City or Zip/i) as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: 'Tokyo' } });

    await waitFor(() => {
      const suggestion = screen.getByText('Tokyo, JP');
      fireEvent.click(suggestion);
    });

    await waitFor(() => {
        expect(inputElement.value).toBe('');
    });
  });
  it('Searches for a city by zip code', async () => {
    render(
        <QueryClientProvider client={queryClient}>
          <CityProvider>
            <CitySearch />
          </CityProvider>
        </QueryClientProvider>
      );
    const inputElement = screen.getByLabelText(/Search City or Zip/i) as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: '10110' } });

    await waitFor(() => {
      const suggestion = screen.getByText('New York, US (10110)');
      expect(suggestion).toBeInTheDocument();
    });
  });
});
