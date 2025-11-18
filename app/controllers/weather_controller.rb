#
# WeatherController
#
# Purpose:
#   Provides a single public endpoint (`GET /weather`) that accepts an address
#   parameter and returns current weather and forecast data for that location.
#
# Endpoint:
#   GET /weather?address=<location>
#
# Request Parameters:
#   address [String] - Required. The location (city, postcode, street address, etc.)
#                      for which weather data is requested.
#
# Implementation notes:
#   - Delegates all geocoding and weather retrieval logic to ForecastService.for_address
#   - Gracefully handles both symbol-keyed and string-keyed error hashes returned
#     by the service layer for maximum compatibility
#   - Does not require authentication; intended to be publicly accessible
#   - Designed to be consumed by the React frontend (Dashboard component)

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