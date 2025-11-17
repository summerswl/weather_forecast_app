require 'rails_helper'

RSpec.describe Forecast do
  describe '.for_zip' do
    let(:zip) { '12345' }
    let(:cache_key) { "forecast/zip/#{zip}" }
    let(:api_response) {
      {
        'main' => {
          'temp' => 72.5,
          'temp_max' => 78.3,
          'temp_min' => 65.1
        },
        'weather' => [
          { 'description' => 'clear sky' }
        ]
      }
    }

    before do
      Rails.cache.clear
    end

    context 'when data is cached' do
      let(:cached_data) {
        {
          zip: zip,
          current_temp: 73,
          high: 78,
          low: 65,
          description: 'Clear sky',
          from_cache: false
        }
      }

      before do
        Rails.cache.write(cache_key, cached_data)
      end

      it 'returns cached data with from_cache flag set to true' do
        result = Forecast.for_zip(zip)
        
        expect(result[:from_cache]).to be true
        expect(result[:zip]).to eq zip
        expect(result[:current_temp]).to eq 73
      end
    end

    context 'when data is not cached' do
      let(:successful_response) { double('response', success?: true, parsed_response: api_response) }

      before do
        allow(Forecast).to receive(:get).and_return(successful_response)
      end

      it 'makes API call and returns formatted data' do
        result = Forecast.for_zip(zip)

        expect(Forecast).to have_received(:get).with('/weather', query: {
          zip: zip,
          appid: WEATHER_API_KEY,
          units: 'imperial'
        })
        
        expect(result).to eq({
          zip: zip,
          current_temp: 73,
          high: 78,
          low: 65,
          description: 'Clear sky',
          from_cache: false
        })
      end

      it 'caches the result for 30 minutes' do
        expect(Rails.cache).to receive(:write).with(cache_key, anything, expires_in: 30.minutes)
        
        Forecast.for_zip(zip)
      end
    end

    context 'when API call fails' do
      let(:failed_response) {
        double('response', 
          success?: false, 
          parsed_response: { 'message' => 'Invalid API key' }
        )
      }

      before do
        allow(Forecast).to receive(:get).and_return(failed_response)
      end

      it 'returns error message' do
        result = Forecast.for_zip(zip)
        
        expect(result).to eq({ error: 'Invalid API key' })
      end

      it 'does not cache the error result' do
        expect(Rails.cache).not_to receive(:write)
        
        Forecast.for_zip(zip)
      end
    end
  end
end
