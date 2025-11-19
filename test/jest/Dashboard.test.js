import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Dashboard from '../../src/components/Dashboard';

jest.mock('axios');
const mockedAxios = axios;

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() for consistent cache timing in tests if needed
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2025-04-01T12:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<Dashboard />);
    
    expect(screen.getByPlaceholderText(/Enter address/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get Forecast' })).toBeInTheDocument();
  });

  it('updates address input value', () => {
    render(<Dashboard />);
    const input = screen.getByPlaceholderText(/Enter address/);
    
    fireEvent.change(input, { target: { value: '90210' } });
    expect(input).toHaveValue('90210');
  });

  it('shows error when submitting empty address', async () => {
  render(<Dashboard />);

  const input = screen.getByPlaceholderText(/Enter address/i);
  const submitButton = screen.getByRole('button', { name: /Get Forecast/i });

  expect(input).toHaveValue('');

  fireEvent.click(submitButton);

  expect(await screen.findByText('Please enter an address or ZIP code')).toBeInTheDocument();

  expect(mockedAxios.get).not.toHaveBeenCalled();
});

  it('shows loading state during API call', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    const button = screen.getByRole('button', { name: 'Get Forecast' });
    
    fireEvent.change(input, { target: { value: 'Miami, FL' } });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading...');
    expect(input).toBeDisabled();
  });

  it('displays forecast data on successful API call', async () => {
  const mockResponse = {
    address: 'Beverly Hills, CA',
    current_temp: 78,
    low_today: 62,
    high_today: 84,
    description: 'Clear sky',
    icon: '01d',
    cached_at: new Date().toISOString(),
    extended_forecast: [
      {
        date: 'Monday',
        short_date: 'Apr 1',
        icon: '02d',
        temp: 81,
        low: 63,
        high: 85,
        description: 'Few clouds',
      },
    ],
  };

  mockedAxios.get.mockResolvedValue({ data: mockResponse });

  render(<Dashboard />);

  const input = screen.getByPlaceholderText(/Enter address/i);
  const submitButton = screen.getByRole('button', { name: /Get Forecast/i });

  fireEvent.change(input, { target: { value: '90210' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    // User typed "90210" → ZIP-only → component shows resolved address + ZIP
    expect(screen.getByText('Beverly Hills, CA 90210')).toBeInTheDocument();
    expect(screen.getByText('78°F')).toBeInTheDocument();
    expect(screen.getByText('62°F – 84°F')).toBeInTheDocument();
    expect(screen.getByText('Clear sky')).toBeInTheDocument();

    expect(screen.getByAltText('Weather icon')).toHaveAttribute(
      'src',
      expect.stringContaining('01d@2x.png')
    );

    expect(screen.getByText(/Fresh data/i)).toBeInTheDocument();
    expect(screen.getByText(/Expires in/)).toBeInTheDocument();
  });

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('/weather', {
      params: { address: '90210' },
    });
  });

  it('displays error message from API', async () => {
    mockedAxios.get.mockRejectedValue({
      response: { data: { error: 'Unable to geocode address' } },
    });

    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/Enter address/i);
    const submitButton = screen.getByRole('button', { name: /Get Forecast/i });

    fireEvent.change(input, { target: { value: 'xyz' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Unable to geocode address')).toBeInTheDocument();

    expect(screen.queryByText(/Fresh data|Retrieved from cache/)).not.toBeInTheDocument();
  });

  it('displays fallback error message when no response data', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network failure'));

    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/Enter address/i);
    const submitButton = screen.getByRole('button', { name: /Get Forecast/i });

    fireEvent.change(input, { target: { value: 'Chicago' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText('Unable to fetch forecast')).toBeInTheDocument();
  });

  it('uses client cache on repeated identical request', async () => {
    const mockData = {
      address: 'Austin, TX',
      current_temp: 88,
      low_today: 70,
      high_today: 92,
      description: 'Partly cloudy',
      icon: '02d',
      cached_at: new Date().toISOString(),
      extended_forecast: [],
    };

    mockedAxios.get.mockResolvedValue({ data: mockData });

    render(<Dashboard />);

    const input = screen.getByPlaceholderText(/Enter address/i);
    const submitButton = screen.getByRole('button', { name: /Get Forecast/i });

    // First search
    fireEvent.change(input, { target: { value: 'Austin' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // User typed "Austin" → component shows exactly "Austin"
      expect(screen.getByText('Austin')).toBeInTheDocument();
      expect(screen.getByText('88°F')).toBeInTheDocument();
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Clear input and search again with same term
    fireEvent.change(input, { target: { value: '' } });
    await waitFor(() => expect(screen.queryByText('Austin')).not.toBeInTheDocument());

    fireEvent.change(input, { target: { value: 'Austin' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Austin')).toBeInTheDocument();
      expect(screen.getByText(/Retrieved from cache/i)).toBeInTheDocument();
    });

    // API was called only once → cache worked
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('clears previous forecast when new search begins', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        address: 'Seattle, WA',
        current_temp: 55,
        low_today: 48,
        high_today: 60,
        description: 'Rainy',
        icon: '10d',
        cached_at: new Date().toISOString(),
        extended_forecast: []
      }
    });

    render(<Dashboard />);
    const input = screen.getByPlaceholderText(/Enter address/);

    fireEvent.change(input, { target: { value: 'Seattle' } });
    fireEvent.submit(input.closest('form'));
    // User typed "Seattle" → not ZIP-only → shows exactly "Seattle"
    await waitFor(() => expect(screen.getByText('Seattle')).toBeInTheDocument());

    fireEvent.change(input, { target: { value: 'Denver' } });

    expect(screen.queryByText('Seattle')).not.toBeInTheDocument();
  });
});