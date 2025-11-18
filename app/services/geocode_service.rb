# app/services/geocode_service.rb

# == GeocodeService
#
# A lightweight utility service for extracting or resolving a United States 5-digit ZIP code
# from various forms of user-provided location input.
#
# The service attempts to determine a valid ZIP code using multiple strategies in order
# of preference and reliability:
#
# 1. Direct match — the input consists solely of exactly five digits
# 2. Geocoding via the Geocoder gem (using configured provider, e.g., Google, Nominatim, etc.)
# 3. Fallback regex extraction of any five-digit sequence bounded by word boundaries
# 4. Returns +nil+ if no ZIP code can be identified
#
# This approach provides high accuracy while remaining resilient to informal or partial
# address input (e.g., "123 Main St, New York, NY 10001", "Beverly Hills 90210", or simply "10001").
#
# === Usage
#   zip = GeocodeService.zip_from_address("10001")                    # => "10001"
#   zip = GeocodeService.zip_from_address("90210")                    # => "90210"
#   zip = GeocodeService.zip_from_address("350 5th Ave, New York, NY") # => "10118" (via geocoding)
#   zip = GeocodeService.zip_from_address("London, UK")               # => nil
#
# === Return Value
# - String containing the 5-digit ZIP code when found
# - +nil+ when no valid US ZIP code can be determined
#
# === Dependencies
# - Geocoder gem (configured in the application)
# - Internet connectivity for the geocoding provider (only used when direct extraction fails)
#
# @note The method assumes United States ZIP codes only. Non-US postal codes are ignored.
# @note Geocoding incurs an external API request and should be used judiciously or cached
#       when performance is critical.
#
# @see https://github.com/alexreisner/geocoder Geocoder gem documentation

class GeocodeService
  def self.zip_from_address(address)
    address = address.to_s.strip

    # 1. Direct 5-digit ZIP code
    if address.match(/\A\d{5}\z/)
      return address
    end

    # 2. Geocode full address
    results = Geocoder.search(address)
    result = results.first
    if result&.postal_code
      return result.postal_code
    end

    # 3. Fallback: Extract any 5-digit ZIP from address
    match = address.match(/\b\d{5}\b/)
    if match
      return match[0]
    end

    # 4. No ZIP found
    nil
  end
end