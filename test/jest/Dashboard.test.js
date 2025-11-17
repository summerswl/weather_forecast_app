import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Dashboard from '../../src/components/Dashboard';

jest.mock('axios');
const mockedAxios = axios;

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter address/)).toBeInTheDocument();
    expect(screen.getByText('Get Forecast')).toBeInTheDocument();
  });

  it('updates address input value', () => {
    render(<Dashboard />);
    const input = screen.getByPlaceholderText(/Enter address/);
    
    fireEvent.change(input, { target: { value: 'New York' } });
    expect(input.value).toBe('New York');
  });

  it('does not submit with empty address', async () => {
    render(<Dashboard />);
    const button = screen.getByRole('button', { name: 'Get Forecast' });
    
    fireEvent.click(button);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('shows loading state during API call', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    const button = screen.getByRole('button', { name: 'Get Forecast' });
    
    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });
  });

  it('displays forecast data on successful API call', async () => {
    const mockForecast = {
      address: '123 Main St, New York, NY',
      resolved_zip: '10001',
      current_temp: 72,
      low: 65,
      high: 78,
      description: 'Sunny',
      icon: '01d',
      from_cache: false
    };

    mockedAxios.get.mockResolvedValue({ data: mockForecast });
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText('123 Main St, New York, NY')).toBeInTheDocument();
      expect(screen.getByText('10001')).toBeInTheDocument();
      expect(screen.getByText('72°F')).toBeInTheDocument();
      expect(screen.getByText('65°F – 78°F')).toBeInTheDocument();
      expect(screen.getByText('Sunny')).toBeInTheDocument();
      expect(screen.getByAltText('Weather icon')).toHaveAttribute('src', expect.stringContaining('01d'));
    });
  });

  it('displays error on failed API call', async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { error: 'Address not found' } } });
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    fireEvent.change(input, { target: { value: 'Invalid' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Address not found')).toBeInTheDocument();
    });
  });

  it('displays unknown error message on API error without response data', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Unknown error')).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters', async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/weather', {
        params: { address: 'New York' }
      });
    });
  });

  it('clears previous forecast when making new request', async () => {
    const mockForecast = {
      address: '123 Main St',
      resolved_zip: '10001',
      current_temp: 72,
      low: 65,
      high: 78,
      description: 'Sunny',
      icon: '01d'
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockForecast });
    render(<Dashboard />);
    
    const input = screen.getByPlaceholderText(/Enter address/);
    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });

    mockedAxios.get.mockImplementation(() => new Promise(() => {}));
    fireEvent.change(input, { target: { value: 'Boston' } });
    fireEvent.submit(input.closest('form'));
    
    await waitFor(() => {
      expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
    });
  });
});