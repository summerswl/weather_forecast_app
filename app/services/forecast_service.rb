# app/services/forecast_service.rb
#
# == ForecastService
#
# A service class responsible for retrieving current weather conditions and a 5-day forecast
# for a United States location based on user-provided input that contains a ZIP code.
#
# The service accepts flexible user input (e.g., "My address is 90210" or simply "10001"),
# extracts the first valid 5-digit ZIP code, and queries the OpenWeatherMap API.
#
# Features:
# - Automatic extraction of the first 5-digit ZIP code from any input string
# - Aggressive caching (30 minutes) using Rails.cache to reduce API calls and improve performance
# - Returns a consistent hash structure suitable for direct use in controllers or views
# - Indicates whether the result was served from cache and when it was cached
#
# === Usage
#   result = ForecastService.for_address("90210")
#   # or
#   result = ForecastService.for_address("Weather for New York, NY 10001 please")
#
# === Returned Hash Structure
#   {
#     address:          String,   # e.g., "Beverly Hills, US"
#     current_temp:     Integer,  # current temperature in °F (rounded)
#     high_today:       Integer,  # today's high in °F (rounded)
#     low_today:        Integer,  # today's low in °F (rounded)
#     description:      String,   # current weather description (capitalized)
#     icon:             String,   # OpenWeatherMap icon code (e.g., "01d")
#     extended_forecast: Array,   # array of up to 5 daily forecast hashes
#     from_cache:       Boolean,  # true if served from cache
#     cached_at:        String    # ISO8601 timestamp of when data was cached
#   }
#
#   Each entry in +extended_forecast+ contains:
#     date:         String  # full weekday name (e.g., "Monday")
#     short_date:   String  # abbreviated date (e.g., "Oct 28")
#     temp:         Integer # temperature at noon (rounded)
#     high:         Integer # daily high (rounded)
#     low:          Integer # daily low (rounded)
#     description:  String  # weather description (capitalized)
#     icon:         String  # icon code
#
# === Error Responses
# If an error occurs, the method returns a hash with a single +error+ key:
#   { error: "Please enter a ZIP code" }
#   { error: "No valid ZIP code found" }
#   { error: "Invalid ZIP code: 00000" }
#   { error: "Weather service unavailable" }
#
# === Dependencies
# - HTTParty (included for API requests)
# - Rails.cache
# - OPENWEATHER_API_KEY environment variable
#
# @see https://openweathermap.org/api OpenWeatherMap API documentation

require 'digest/md5'

class ForecastService
  include HTTParty
  base_uri 'https://api.openweathermap.org/data/2.5'

  def self.for_address(user_input)
    return { error: 'Please enter a ZIP code' } if user_input.blank?

    # Extract the first 5-digit ZIP code from whatever the user typed
    zip_match = user_input.to_s.scan(/\b\d{5}\b/).first
    return { error: 'No valid ZIP code found' } unless zip_match

    zip = zip_match

    # Use ZIP as cache key
    cache_key = "forecast_zip_#{zip}"
    cached = Rails.cache.read(cache_key)

    if cached
      result = cached.dup
      result[:from_cache] = true
      result[:cached_at] ||= Time.current.iso8601
      return result
    end

    # Direct ZIP call — fastest, most reliable
    current_response = get('/weather', query: {
      zip: "#{zip},us",
      appid: ENV.fetch('OPENWEATHER_API_KEY'),
      units: 'imperial'
    })

    unless current_response.success?
      return { error: "Invalid ZIP code: #{zip}" }
    end

    data = current_response.parsed_response
    lat = data['coord']['lat']
    lon = data['coord']['lon']
    city_name = "#{data['name']}, #{data['sys']['country']}"

    # Get 5-day forecast
    forecast_response = get('/forecast', query: {
      lat: lat,
      lon: lon,
      appid: ENV.fetch('OPENWEATHER_API_KEY'),
      units: 'imperial'
    })

    return { error: 'Weather service unavailable' } unless forecast_response.success?

    result = build_forecast_result(forecast_response.parsed_response, city_name)
    Rails.cache.write(cache_key, result, expires_in: 30.minutes)
    result
  end

  private

  def self.build_forecast_result(forecast_data, city_name)
    current = forecast_data['list'].first

    daily = forecast_data['list']
      .select { |item| item['dt_txt'].include?('12:00:00') }
      .first(5)
      .map do |item|
        {
          date: Date.parse(item['dt_txt']).strftime('%A'),
          short_date: Date.parse(item['dt_txt']).strftime('%b %d'),
          temp: item['main']['temp'].round,
          high: item['main']['temp_max'].round,
          low: item['main']['temp_min'].round,
          description: item['weather'][0]['description'].capitalize,
          icon: item['weather'][0]['icon']
        }
      end

    {
      address: city_name,
      current_temp: current['main']['temp'].round,
      high_today: current['main']['temp_max'].round,
      low_today: current['main']['temp_min'].round,
      description: current['weather'][0]['description'].capitalize,
      icon: current['weather'][0]['icon'],
      extended_forecast: daily,
      from_cache: false,
      cached_at: Time.current.iso8601
    }
  end
end