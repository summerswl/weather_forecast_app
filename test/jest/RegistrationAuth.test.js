import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import RegistrationAuth from '../../src/components/auth/RegistrationAuth.js';

jest.mock('axios');
const mockedAxios = axios;

describe('RegistrationAuth Component', () => {
  const mockHandleSuccessfulAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required inputs', () => {
    render(<RegistrationAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password Confirmation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('updates state on input change', () => {
    render(<RegistrationAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('calls handleSuccessfulAuth on successful registration', async () => {
    const mockResponse = { data: { status: 'created', user: 'testUser' } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    render(<RegistrationAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Password Confirmation'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockHandleSuccessfulAuth).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  it('makes POST request with correct data', async () => {
    mockedAxios.post.mockResolvedValue({ data: { status: 'created' } });

    render(<RegistrationAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Password Confirmation'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/registrations',
      {
        user: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      },
      { withCredentials: true }
    );
  });

  it('handles registration error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockedAxios.post.mockRejectedValue(new Error('Registration failed'));

    render(<RegistrationAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Password Confirmation'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('registration error', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});