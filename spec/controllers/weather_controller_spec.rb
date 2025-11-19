# spec/controllers/weather_controller_spec.rb
require 'rails_helper'

RSpec.describe WeatherController, type: :controller do
  describe 'GET #show' do
    context 'when address is blank' do
      it 'returns bad request with correct error message' do
        get :show, params: { address: '' }

        expect(response).to have_http_status(:bad_request)
        json = response.parsed_body
        expect(json['error']).to eq('Please enter an address')
      end
    end

    context 'when ForecastService returns an error' do
      it 'returns unprocessable_entity with the service error' do
        allow(ForecastService).to receive(:for_address)
          .with('invalid place')
          .and_return({ error: 'Unable to geocode address' })

        get :show, params: { address: 'invalid place' }

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['error']).to eq('Unable to geocode address')
      end

      it 'handles string-keyed errors from the service' do
        allow(ForecastService).to receive(:for_address)
          .and_return('error' => 'Location not found')

        get :show, params: { address: 'xyz' }

        expect(response).to have_http_status(:unprocessable_entity)
        json = response.parsed_body
        expect(json['error']).to eq('Location not found')
      end
    end

    context 'when valid address is provided' do
      it 'returns the forecast data from ForecastService' do
        mock_forecast = {
          current_temp: 72,
          description: 'Sunny',
          icon: '01d',
          address: 'Austin, TX',
          cached_at: Time.current.iso8601,
          extended_forecast: []
        }

        allow(ForecastService).to receive(:for_address)
          .with('Austin')
          .and_return(mock_forecast)

        get :show, params: { address: 'Austin' }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to eq(mock_forecast.as_json)
      end
    end
  end
end