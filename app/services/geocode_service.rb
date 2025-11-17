# app/services/geocode_service.rb
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