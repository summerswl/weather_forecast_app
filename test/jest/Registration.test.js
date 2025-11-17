import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Registration from '../../src/components/Registration.js';

// Mock the RegistrationAuth component
jest.mock('../../src/components/auth/RegistrationAuth', () => {
  return function MockRegistrationAuth({ handleSuccessfulAuth }) {
    return (
      <div data-testid="registration-auth">
        <button onClick={() => handleSuccessfulAuth({ user: 'test' })}>
          Mock Register
        </button>
      </div>
    );
  };
});

describe('Registration Component', () => {
  const mockProps = {
    handleLogin: jest.fn(),
    handleLogout: jest.fn(),
    history: {
      push: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration heading and RegistrationAuth component', () => {
    render(<Registration {...mockProps} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Registration:');
    expect(screen.getByTestId('registration-auth')).toBeInTheDocument();
  });

  it('applies correct styling to container div', () => {
    const { container } = render(<Registration {...mockProps} />);
    const divElement = container.firstChild;
    
    expect(divElement).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
  });

  it('calls handleLogin and redirects on successful auth', () => {
    render(<Registration {...mockProps} />);
    
    const mockRegisterButton = screen.getByText('Mock Register');
    mockRegisterButton.click();
    
    expect(mockProps.handleLogin).toHaveBeenCalledWith({ user: 'test' });
    expect(mockProps.history.push).toHaveBeenCalledWith('/dashboard');
  });

  it('calls handleLogout when handleLogout method is invoked', () => {
    // Use ref to access instance
    const ref = React.createRef();
    render(<Registration ref={ref} {...mockProps} />);
    
    // Call method directly
    ref.current.handleLogout();
    
    expect(mockProps.handleLogout).toHaveBeenCalled();
  });
});