import axios from 'axios';
import {
    queryOptions,
  } from "@tanstack/react-query";
import {createQueryFn} from "./createQueryFn"
import {Geocoding , Weather , WeatherForecast} from "./types"


const api = axios.create({
  baseURL: 'https://api.openweathermap.org',
});

api.interceptors.request.use((config) => {
    const API_KEY = '457e7b6e29b2ecb1e2764d49aefaffdb';
  
    if (config.params) {
      config.params.appid = API_KEY;
    } else {
      config.params = { appid: API_KEY };
    }
  
    return config;
  });

type geocodingFilters = {
    q: string;
    limit: number;
};

type weatherFilters = {
    q: string;
    units: string;
};

type forecastFilters = {
    lat: number;
    lon: number;
    cnt: number;
    units: string;
};


export const geocodingQueries = {
    all: ["geo","1.0","direct"],
    list: (filters: geocodingFilters) =>
      queryOptions({
        queryKey: [...geocodingQueries.all,  filters ],
        queryFn: ({ queryKey }) =>
          createQueryFn<Geocoding[]>(api, queryKey),
      }),
  };



export const weatherQueries = {
    all: ["data","2.5","weather"],
    detail: (filters: weatherFilters) =>
        queryOptions({
            queryKey: [...weatherQueries.all,  filters ],
            queryFn: ({ queryKey }) =>
                createQueryFn<Weather>(api, queryKey),
            }),
};

export const forecastQueries = {
    all: ["data","2.5","forecast"],
    detail: (filters: forecastFilters) =>
        queryOptions({
            queryKey: [...forecastQueries.all,  filters ],
            queryFn: ({ queryKey }) =>
                createQueryFn<WeatherForecast>(api, queryKey),
            }),
};