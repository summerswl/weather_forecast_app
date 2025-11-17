# app/models/forecast.rb
class Forecast
  include HTTParty
  base_uri WEATHER_BASE_URL

  def self.for_zip(zip)
    cache_key = "forecast/zip/#{zip}"
    cached = Rails.cache.read(cache_key)

    if cached
      cached[:from_cache] = true
      return cached
    end

    response = get('/weather', query: { zip: zip, appid: WEATHER_API_KEY, units: 'imperial' })
    return { error: response.parsed_response['message'] } unless response.success?

    data = response.parsed_response
    result = {
      zip: zip,
      current_temp: data['main']['temp'].round,
      high: data['main']['temp_max'].round,
      low: data['main']['temp_min'].round,
      description: data['weather'].first['description'].capitalize,
      from_cache: false
    }

    Rails.cache.write(cache_key, result, expires_in: 30.minutes)
    result
  end
end
