# app/controllers/weather_controller.rb
class WeatherController < ApplicationController
  def show
    if params[:address].blank?
      render json: { error: 'Please enter an address' }, status: :bad_request
      return
    end

    result = ForecastService.for_address(params[:address])

    # Check for error using ANY key type (symbol or string)
    if result.is_a?(Hash) && (result[:error].present? || result['error'].present?)
      error_message = result[:error] || result['error']
      render json: { error: error_message }, status: :unprocessable_entity
    else
      render json: result, status: :ok
    end
  end
end