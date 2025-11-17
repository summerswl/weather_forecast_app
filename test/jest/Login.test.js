import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../../src/components/Login.js';

// Mock the LoginAuth component
jest.mock('../../src/components/auth/LoginAuth', () => {
  return function MockLoginAuth({ handleSuccessfulAuth }) {
    return (
      <div data-testid="login-auth">
        <button onClick={() => handleSuccessfulAuth({ user: 'test' })}>
          Mock Login
        </button>
      </div>
    );
  };
});

describe('Login Component', () => {
  const mockProps = {
    handleLogin: jest.fn(),
    history: {
      push: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login heading and LoginAuth component', () => {
    render(<Login {...mockProps} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login:');
    expect(screen.getByTestId('login-auth')).toBeInTheDocument();
  });

  it('applies correct styling to container div', () => {
    const { container } = render(<Login {...mockProps} />);
    const divElement = container.firstChild;
    
    expect(divElement).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
  });

  it('calls handleLogin and redirects on successful auth', () => {
    render(<Login {...mockProps} />);
    
    const mockLoginButton = screen.getByText('Mock Login');
    mockLoginButton.click();
    
    expect(mockProps.handleLogin).toHaveBeenCalledWith({ user: 'test' });
    expect(mockProps.history.push).toHaveBeenCalledWith('/dashboard');
  });

  it('passes handleSuccessfulAuth prop to LoginAuth component', () => {
    const { container } = render(<Login {...mockProps} />);
    
    expect(container.querySelector('[data-testid="login-auth"]')).toBeInTheDocument();
  });
});