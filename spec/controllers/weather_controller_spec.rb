require 'rails_helper'

RSpec.describe WeatherController do
  describe 'GET #show' do
    context 'when address is blank' do
      it 'returns bad request error' do
        get :show, params: { address: '' }
        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)['error']).to eq('Address is required')
      end
    end

    context 'when ZIP cannot be determined' do
      it 'returns unprocessable entity error' do
        allow(GeocodeService).to receive(:zip_from_address).and_return(nil)
        get :show, params: { address: 'invalid address' }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Could not determine ZIP code')
      end
    end

    context 'when valid address provided' do
      it 'returns forecast data' do
        allow(GeocodeService).to receive(:zip_from_address).and_return('12345')
        allow(ForecastService).to receive(:for_zip).and_return({ temp: 75 })
        
        get :show, params: { address: '123 Main St' }
        
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['address']).to eq('123 Main St')
        expect(json['resolved_zip']).to eq('12345')
        expect(json['temp']).to eq(75)
      end
    end
  end
end
