"use client";
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Geocoding } from '../services/types';

type State = {
  selectedCities: Geocoding[];
};

type Action =
  | { type: 'ADD_CITY'; payload: Geocoding }
  | { type: 'REMOVE_CITY'; payload: string };

const initialState: State = {
  selectedCities: [],
};

function cityReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_CITY':
      if (state.selectedCities.find(city => city.name === action.payload.name)) {
        return state;
      }
      return { ...state, selectedCities: [...state.selectedCities, action.payload] };

    case 'REMOVE_CITY':
      return {
        ...state,
        selectedCities: state.selectedCities.filter(city => city.name !== action.payload),
      };

    default:
      return state;
  }
}

const CityContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cityReducer, initialState);
  return (
    <CityContext.Provider value={{ state, dispatch }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCityContext = () => useContext(CityContext);
