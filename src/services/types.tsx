export type Geocoding = {
    name: string;
    local_names: LocationNames;
    lat: number;
    lon: number;
    country: string;
    state: string;
    zip?: string;
};


export type LocationNames = {
    en: string;
};

export type Weather = {
    main: WeatherMain;
    dt: number;
    timezone: number;
};

export type WeatherMain = {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
};


export type WeatherForecast = {
    list: ForecastList[];
    city: {
        name: string;
        country: string;
        timezone: number;
    };
};

export type ForecastList = {
    dt: number;
    main: WeatherMain;
    weather: WeatherDescription[];
    wind: Wind;
    pop: number;
};

export type Wind = {
    speed: number;
    deg: number;
    gust: number;
};

export type WeatherDescription = {
    id: number;
    main: string;
    description: string;
    icon: string;
};