import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../src/components/Login.js';

// Mock the LoginAuth component
jest.mock('../../src/components/auth/LoginAuth', () => {
  return function MockLoginAuth({ handleSuccessfulAuth }) {
    return (
      <div data-testid="login-auth">
        <button onClick={() => handleSuccessfulAuth({ user: 'test-user' })}>
          Mock Login Success
        </button>
      </div>
    );
  };
});

describe('Login Component', () => {
  const mockHandleLogin = jest.fn();
  const mockHistory = { push: jest.fn() };

  const defaultProps = {
    handleLogin: mockHandleLogin,
    history: mockHistory
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login page with correct heading', () => {
    render(<Login {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders the LoginAuth child component', () => {
    render(<Login {...defaultProps} />);

    expect(screen.getByTestId('login-auth')).toBeInTheDocument();
  });

  it('calls handleLogin and redirects to dashboard on successful auth', () => {
    render(<Login {...defaultProps} />);

    const loginButton = screen.getByText('Mock Login Success');
    fireEvent.click(loginButton);

    expect(mockHandleLogin).toHaveBeenCalledWith({ user: 'test-user' });
    expect(mockHistory.push).toHaveBeenCalledWith('/dashboard');
  });

  it('passes handleSuccessfulAuth callback to LoginAuth', () => {
    render(<Login {...defaultProps} />);

    const mockComponent = screen.getByTestId('login-auth');
    expect(mockComponent).toBeInTheDocument();
  });
})