import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.scss';

const API_URL = '/weather';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms

export default function Dashboard() {
  const [address, setAddress] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null); 

  // Client-side cache: address → { data, timestamp }
  const [clientCache, setClientCache] = useState({});

  // Countdown timer — updates every second
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
      setError('Please enter an address');
      return;
    }

    // Check client cache first
    const cached = clientCache[trimmed];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setForecast({ ...cached.data, from_cache: true });
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
        cached_at: new Date().toISOString() 
      };

      // Save to client cache
      setClientCache(prev => ({
        ...prev,
        [trimmed]: { data, timestamp: Date.now() }
      }));

      setForecast(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <form onSubmit={fetchWeather} className="form">
        <div className="inputWithButton">
          <input
            type="text"
            placeholder="Enter address..."
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError('');
            }}
            className="addressInput"
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Loading...' : 'Get Forecast'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>

      {forecast && !forecast.error && (
        <div className="result">
          <h2 className="resultHeader">
            Weather for address:
            <span className="addressHighlight"> {forecast.address}</span>
          </h2>

          <div className="currentWeather">
            <img
              src={`https://openweathermap.org/img/wn/${forecast.icon}.png`}
              alt="Weather icon"
              className="weatherIcon"
            />
            <div>
              <div className="temperature">{forecast.current_temp}°F</div>
              <div className="range">{forecast.low}°F – {forecast.high}°F</div>
              <div className="description">{forecast.description}</div>
            </div>
          </div>

          <div className="cacheInfo">
            {forecast.from_cache ? (
              <p className="cacheNote">
                Retrieved from cache • {formatTimeLeft(timeLeft)}
              </p>
            ) : (
              <p className="cacheNote">
                Data cached for thirty minutes • {formatTimeLeft(timeLeft)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}