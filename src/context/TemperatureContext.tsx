import React, { createContext, useContext, useReducer } from 'react';

export type TemperatureUnit = 'metric' | 'imperial' | 'kelvin';

interface TemperatureState {
  unit: TemperatureUnit;
  unitSymbol: string;
}

interface TemperatureAction {
  type: 'SET_UNIT';
  payload: TemperatureUnit;
}

const TemperatureContext = createContext<{
  state: TemperatureState;
  dispatch: React.Dispatch<TemperatureAction>;
}>({
  state: { unit: 'kelvin', unitSymbol: 'K' }, 
  dispatch: () => null,
});

const temperatureReducer = (state: TemperatureState, action: TemperatureAction): TemperatureState => {
  switch (action.type) {
    case 'SET_UNIT':
      if (action.payload === 'metric') return { unit: 'metric', unitSymbol: '°C' };
      if (action.payload === 'imperial') return { unit: 'imperial', unitSymbol: '°F' };
      if (action.payload === 'kelvin') return { unit: 'kelvin', unitSymbol: 'K' };
      return state;
    default:
      return state;
  }
};

export const TemperatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(temperatureReducer, { unit: 'kelvin' , unitSymbol: 'K' });

  return (
    <TemperatureContext.Provider value={{ state, dispatch }}>
      {children}
    </TemperatureContext.Provider>
  );
};

// สร้าง Hook สำหรับเรียกใช้ context
export const useTemperatureContext = () => useContext(TemperatureContext);
