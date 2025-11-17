# app/controllers/weather_controller.rb
class WeatherController < ApplicationController
  def show
    address = params[:address].to_s.strip
    if address.blank?
      return render json: { error: 'Address is required' }, status: :bad_request
    end

    zip = GeocodeService.zip_from_address(address)
    if zip.nil?
      return render json: { error: 'Could not determine ZIP code' }, status: :unprocessable_entity
    end

    forecast = ForecastService.for_zip(zip)
    render json: forecast.merge(address: address, resolved_zip: zip)
  end
end