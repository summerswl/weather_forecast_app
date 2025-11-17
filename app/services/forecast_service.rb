# app/services/forecast_service.rb
class ForecastService
  include HTTParty
  base_uri 'https://api.openweathermap.org/data/2.5'

  def self.for_zip(zip)
    cache_key = "forecast_zip_#{zip}"
    cached = Rails.cache.read(cache_key)

    if cached
      cached[:from_cache] = true
      return cached
    end

    response = get('/weather', query: {
      zip: "#{zip},us",
      appid: ENV.fetch('OPENWEATHER_API_KEY'),
      units: 'imperial'
    })

    unless response.success?
      return { error: response.parsed_response['message'] || 'Weather service unavailable' }
    end

    data = response.parsed_response
    result = {
      zip: zip,
      current_temp: data['main']['temp'].round,
      high: data['main']['temp_max'].round,
      low: data['main']['temp_min'].round,
      description: data['weather'].first['description'].capitalize,
      icon: data['weather'].first['icon'],
      from_cache: false
    }

    Rails.cache.write(cache_key, result, expires_in: 30.minutes)
    result
  end
end