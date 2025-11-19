
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Registration from '../../src/components/Registration.js';

// Mock the RegistrationAuth component
jest.mock('../../src/components/auth/RegistrationAuth', () => {
  return function MockRegistrationAuth({ handleSuccessfulAuth }) {
    return (
      <div data-testid="registration-auth">
        <button onClick={() => handleSuccessfulAuth({ user: 'new-user' })}>
          Mock Register Success
        </button>
      </div>
    );
  };
});

describe('Registration Component', () => {
  const mockHandleLogin = jest.fn();
  const mockHistory = { push: jest.fn() };

  const defaultProps = {
    handleLogin: mockHandleLogin,
    history: mockHistory
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the registration page with correct heading', () => {
    render(<Registration {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Registration' })).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
  });

  it('renders the RegistrationAuth child component', () => {
    render(<Registration {...defaultProps} />);

    expect(screen.getByTestId('registration-auth')).toBeInTheDocument();
  });

  it('calls handleLogin and redirects to dashboard on successful registration', () => {
    render(<Registration {...defaultProps} />);

    const registerButton = screen.getByText('Mock Register Success');
    fireEvent.click(registerButton);

    expect(mockHandleLogin).toHaveBeenCalledWith({ user: 'new-user' });
    expect(mockHistory.push).toHaveBeenCalledWith('/dashboard');
  });
});