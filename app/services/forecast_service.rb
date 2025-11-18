# app/services/forecast_service.rb
require 'digest/md5'

class ForecastService
  include HTTParty
  base_uri 'https://api.openweathermap.org/data/2.5'

  def self.for_address(address)
    cache_key = "forecast_address_#{Digest::MD5.hexdigest(address.downcase)}"
    cached = Rails.cache.read(cache_key)

    if cached
      cached[:from_cache] = true
      return cached
    end

    # Detect ZIP code
    if address.strip =~ /^\d{5}(-\d{4})?$/
      zip = address.strip.split('-').first

      # Get current weather (for lat/lon + resolved name)
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
      resolved_address = "#{data['name']}, #{data['sys']['country']}"

      # Now get the 5-day forecast using lat/lon
      forecast_response = get('/forecast', query: {
        lat: lat,
        lon: lon,
        appid: ENV.fetch('OPENWEATHER_API_KEY'),
        units: 'imperial'
      })

      unless forecast_response.success?
        return { error: 'Weather service unavailable' }
      end

      return build_forecast_result(forecast_response.parsed_response, resolved_address)
    end

    # Regular address path (unchanged)
    geo_response = get('/geo/1.0/direct', query: {
      q: address,
      limit: 1,
      appid: ENV.fetch('OPENWEATHER_API_KEY')
    })

    unless geo_response.success? && geo_response.parsed_response.any?
      return { error: "Location not found for '#{address}'" }
    end

    lat = geo_response.parsed_response[0]['lat']
    lon = geo_response.parsed_response[0]['lon']
    resolved_address = "#{geo_response.parsed_response[0]['name']}, #{geo_response.parsed_response[0]['state'] || ''} #{geo_response.parsed_response[0]['country']}".strip

    forecast_response = get('/forecast', query: {
      lat: lat,
      lon: lon,
      appid: ENV.fetch('OPENWEATHER_API_KEY'),
      units: 'imperial'
    })

    unless forecast_response.success?
      return { error: 'Weather service unavailable' }
    end

    build_forecast_result(forecast_response.parsed_response, resolved_address)
  end

  private

  def self.build_forecast_result(forecast_data, resolved_address)
    current = forecast_data['list'].first

    daily_forecasts = forecast_data['list']
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

    result = {
      address: resolved_address,
      current_temp: current['main']['temp'].round,
      high_today: current['main']['temp_max'].round,
      low_today: current['main']['temp_min'].round,
      description: current['weather'][0]['description'].capitalize,
      icon: current['weather'][0]['icon'],
      extended_forecast: daily_forecasts,
      from_cache: false,
      cached_at: Time.current.iso8601
    }

    cache_key = "forecast_address_#{Digest::MD5.hexdigest(resolved_address.downcase)}"
    Rails.cache.write(cache_key, result, expires_in: 30.minutes)
    result
  end
end