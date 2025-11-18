# app/services/forecast_service.rb
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

    # Use original input as cache key 
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
