/**
 * Dashboard Component
 * 
 * The primary weather lookup interface for authenticated users. Provides a responsive,
 * fully cached, and visually polished experience that displays both current conditions
 * and a 5-day extended forecast for any U.S. address or ZIP code.
 *
 * Features:
 * - Client-side in-memory caching (30-minute TTL) for instant repeat lookups
 * - Server-side Rails caching with identical 30-minute expiration
 * - Live countdown timer showing remaining cache validity 
 * - Immediate visual feedback distinguishing cached vs fresh data
 * - Graceful error handling with consistent styling
 * - Now shows the exact user-entered address in the results header
 *
 * Data Flow:
 * 1. User enters address/ZIP → client checks in-memory cache
 * 2. Cache hit → instant render with "Retrieved from cache" badge
 * 3. Cache miss → GET /weather → Rails service performs lookup
 * 4. Response stored in both server-side and in React client cache
 * 5. Live timer counts down from 30:00 to 00:00
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.scss';

const API_URL = '/weather';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms

// Helper: detect if input is exactly a 5-digit ZIP code (with optional whitespace)
const isZipOnly = (input) => /^\s*\d{5}\s*$/.test(input);

export default function Dashboard() {
  const [address, setAddress] = useState('');
  const [userInput, setUserInput] = useState('');           // Exact text user typed
  const [displayAddress, setDisplayAddress] = useState(''); // What we show in header
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  const [clientCache, setClientCache] = useState({});

  // Countdown timer
  useEffect(() => {
    if (!forecast?.cached_at) {
      setTimeLeft(null);
      return;
    }

    const cachedAt = new Date(forecast.cached_at).getTime();
    const expiresAt = cachedAt + CACHE_DURATION;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [forecast]);

  const formatTimeLeft = (seconds) => {
    if (seconds === null) return '';
    if (seconds <= 0) return 'Cache expired';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `Expires in ${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const fetchWeather = async (e) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError('Please enter an address or ZIP code');
      return;
    }

    setUserInput(trimmed);

    // Client cache check
    const cached = clientCache[trimmed];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setForecast({ ...cached.data, from_cache: true });
      updateDisplayAddress(trimmed, cached.data);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    setForecast(null);

    try {
      const res = await axios.get(API_URL, { params: { address: trimmed } });
      const data = {
        ...res.data,
        cached_at: new Date().toISOString(),
      };

      // Update client cache
      setClientCache(prev => ({
        ...prev,
        [trimmed]: { data, timestamp: Date.now() }
      }));

      setForecast(data);
      updateDisplayAddress(trimmed, data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch forecast');
      setDisplayAddress('');
    } finally {
      setLoading(false);
    }
  };

  // Smart display logic
  const updateDisplayAddress = (originalInput, forecastData) => {
    if (isZipOnly(originalInput) && forecastData?.address) {
      // User typed only ZIP → show full resolved location with ZIP
      const zipMatch = originalInput.match(/\d{5}/);
      const zip = zipMatch ? zipMatch[0] : '';
      setDisplayAddress(`${forecastData.address} ${zip}`);
    } else {
      // Any other input → show exactly what they typed
      setDisplayAddress(originalInput);
    }
  };

  return (
    <div className="dashboard">
      <form onSubmit={fetchWeather} className="form">
        <div className="inputWithButton">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Get Forecast'}
          </button>
          <input
            type="text"
            placeholder="Enter address, city, or ZIP code..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError('');
              setForecast(null);
              setTimeLeft(null);
            }}
            className="addressInput"
            disabled={loading}
          />
        </div>
        {error && <div className="error">{error}</div>}
      </form>

      {forecast && !forecast.error && (
        <div className="result">
          <h2 className="resultHeader">
            Weather for:
            <span className="addressHighlight"> {displayAddress}</span>
          </h2>

          <div className="currentWeather">
            <img
              src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`}
              alt="Weather icon"
              className="weatherIcon"
            />
            <div>
              <div className="temperature">{forecast.current_temp}°F</div>
              <div className="range">{forecast.low_today}°F – {forecast.high_today}°F</div>
              <div className="description">{forecast.description}</div>
            </div>
          </div>

          <h3 className="extendedTitle">5-Day Forecast</h3>
          <div className="extendedForecast">
            {forecast.extended_forecast.map((day, index) => (
              <div key={index} className="forecastDay">
                <div className="dayName">{day.date}</div>
                <div className="dayDate">{day.short_date}</div>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                  alt={day.description}
                  className="dayIcon"
                />
                <div className="dayTemp">{day.temp}°</div>
                <div className="dayRange">{day.low}° – {day.high}°</div>
                <div className="dayDesc">{day.description}</div>
              </div>
            ))}
          </div>

          <div className="cacheInfo">
            <p className="cacheNote">
              {forecast.from_cache ? 'Retrieved from cache' : 'Fresh data'} • {formatTimeLeft(timeLeft)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}