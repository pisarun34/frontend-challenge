"use client";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geocodingQueries } from '../../services/api';
import { Geocoding } from '../../services/types';
import { useDebounce } from '../../hooks/useDebounce';
import { Autocomplete, TextField} from '@mui/material';
import CityList from '../../components/CityList';
import { useCityContext } from '../../context/CityContext';

export default function CitySearch() {
    const { state, dispatch } = useCityContext();
    const [query, setQuery] = useState('');

    // Debounce query to prevent rapid API calls
    const debouncedQuery = useDebounce(query, 500);

    // zip code has 5 digits
    const isZipCode = /^\d{5}(?:[-\s]\d{4})?$/.test(debouncedQuery);

    // Query options for zip code and city search
    const zipQueryOptions = geocodingQueries.zip({ zip: debouncedQuery });
    // Limit city search to 3 characters
    const cityQueryOptions = geocodingQueries.list({ q: debouncedQuery, limit: 5 });

    const { data: zipSuggestions, isFetching: isFetchingZip } = useQuery({
      ...zipQueryOptions,
      enabled: isZipCode && debouncedQuery.length >= 5,
    });

    const { data: citySuggestions, isFetching: isFetchingCity } = useQuery({
      ...cityQueryOptions,
      enabled: !isZipCode && debouncedQuery.length >= 3,
    });

    const suggestions = isZipCode ? zipSuggestions : citySuggestions;
    const isFetching = isZipCode ? isFetchingZip : isFetchingCity;

    const handleAddCity = (city: Geocoding) => {
        dispatch({ type: 'ADD_CITY', payload: city });
    }

    // Normalize suggestions to have an id field
    const normalizedSuggestions = Array.isArray(suggestions)
    ? suggestions.map((item) => ({
        ...item,
        id: `${item.name}-${item.country}-${item.lat}-${item.lon}`,
      }))
    : suggestions
    ? [{ ...suggestions, id: `${suggestions.name}-${suggestions.country}-${suggestions.lat}-${suggestions.lon}` }]
    : [];


    return (
      <div className="w-full min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-md p-3 flex items-center justify-between rounded-md mb-4 w-full">
          <Autocomplete
            options={normalizedSuggestions}
            getOptionLabel={(option) => {
              return option.zip ? `${option.name}, ${option.country} (${option.zip})` : `${option.name}, ${option.country}`;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            inputValue={query}
            onInputChange={(event, newInputValue, reason) => {
              if (reason !== 'reset') {
                setQuery(newInputValue);
              }
            }}
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
                  value={query}
              />
              )}
          />
        </div>
        <CityList />
      </div>
    );
  }