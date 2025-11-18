# config/initializers/geocoder.rb
Geocoder.configure(
  lookup: :nominatim,
  use_https: true,
  timeout: 10,
  nominatim: {
    email: "you@example.com",  # Required by Nominatim policy
    user_agent: "WeatherForecastApp App[](https://github.com/yourname/weather_forecast_app)"
  }
)
