"use client";
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geocodingQueries } from '../../services/api';
import { Geocoding } from '../../services/types';
import { useDebounce } from '../../hooks/useDebounce';
import { Autocomplete, TextField , List , ListItem , ListItemText} from '@mui/material';
import CityList from '../../components/CityList';
import { useCityContext } from '../../context/CityContext';

export default function CitySearchApp() {
    const { state, dispatch } = useCityContext();
    const [query, setQuery] = useState('');
    const [selectedCities, setSelectedCities] = useState<Geocoding[]>([]);

    const debouncedQuery = useDebounce(query, 1000);

    const queryOptions = geocodingQueries.list({ q: debouncedQuery , limit: 5 });

    const { data: suggestions, isFetching } = useQuery({
        ...queryOptions,
        enabled: debouncedQuery.length >= 3,
    });

    const handleAddCity = (city: Geocoding) => {
        dispatch({ type: 'ADD_CITY', payload: city });
    }

    const mockSuggestions: Geocoding[] = [
        { name: 'Tokyo', country: 'Japan' , local_names: {en: 'Tokyo'}, lat: 35.6895, lon: 139.6917 , state: 'Tokyo'},
        { name: 'Bangkok', country: 'Thailand' , local_names: {en: 'Bangkok'}, lat: 13.7563, lon: 100.5018, state: 'Bangkok'},
        { name: 'London', country: 'United Kingdom', local_names: {en: 'London'}, lat: 51.5074, lon: 0.1278 , state: 'London'},
      ];

      return (
        <div className="w-full min-h-screen bg-gray-100 p-4">
          <div className="bg-white shadow-md p-3 flex items-center justify-between rounded-md mb-4 w-full">
            <Autocomplete
              options={suggestions || []}
              getOptionLabel={(option) => `${option.name}, ${option.country}`}
              onInputChange={(event, newInputValue) => setQuery(newInputValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleAddCity(newValue);
                  setQuery('');
                }
              }}
              loading={isFetching}
              fullWidth
                renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search City or Zip"
                    variant="outlined"
                    fullWidth
                    className="w-full"
                />
                )}
            />
          </div>
          <CityList />
        </div>
      );
  }