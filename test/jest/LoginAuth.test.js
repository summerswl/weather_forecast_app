import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import LoginAuth from '../../src/components/auth/LoginAuth.js';

jest.mock('axios');
const mockedAxios = axios;

describe('LoginAuth Component', () => {
  const mockHandleSuccessfulAuth = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with email, password inputs and login button', () => {
    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates state on input change', () => {
    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('calls handleSuccessfulAuth on successful login', async () => {
    const mockResponse = { data: { status: 'created', user: 'testUser' } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockHandleSuccessfulAuth).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  it('makes POST request with correct data', async () => {
    mockedAxios.post.mockResolvedValue({ data: { status: 'created' } });

    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/sessions',
      {
        user: {
          email: 'test@example.com',
          password: 'password123'
        }
      },
      { withCredentials: true }
    );
  });

  it('handles login error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockedAxios.post.mockRejectedValue(new Error('Login failed'));

    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('login error', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});