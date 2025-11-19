
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
    mockedAxios.post.mockReset();
  });

  it('renders form with email, password inputs and login button', () => {
    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('updates input values when user types', () => {
    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });

    // These now work because RTL + React 18 updates the DOM
    expect(emailInput).toHaveValue('user@example.com');
    expect(passwordInput).toHaveValue('secret123');
  });

  it('calls handleSuccessfulAuth on successful login', async () => {
    const mockResponse = {
      data: { status: 'created', user: { email: 'user@example.com' } }
    };
    mockedAxios.post.mockResolvedValue(mockResponse);

    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockHandleSuccessfulAuth).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  it('makes POST request to correct endpoint with correct data', async () => {
    mockedAxios.post.mockResolvedValue({ data: { status: 'created' } });

    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'mypassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/sessions',
      { user: { email: 'test@example.com', password: 'mypassword' } },
      { withCredentials: true }
    );
  });

  it('displays error message on failed login', async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: 'Login failed. Please try again.' } }
    });

    render(<LoginAuth handleSuccessfulAuth={mockHandleSuccessfulAuth} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Expect the message that is actually rendered
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });
});