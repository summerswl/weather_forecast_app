
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../src/components/Home';

// Mock react-router's withRouter
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  withRouter: (Component) => Component,
}));

describe('Home Component', () => {
  const defaultProps = {
    loggedInStatus: 'not logged in',
    handleLogout: jest.fn(),
    history: { push: jest.fn() },
  };

  it('shows welcome message for unauthenticated users', () => {
    render(<Home {...defaultProps} loggedInStatus="not logged in" />);

    expect(
      screen.getByRole('heading', {
        name: /welcome, please login or create an account to see your forecast/i,
      })
    ).toBeInTheDocument();
  });

  it('shows welcome back message for authenticated users', () => {
    render(<Home {...defaultProps} loggedInStatus="logged in" />);

    expect(
      screen.getByRole('heading', {
        name: /welcome back! enter an address for today’s forecast/i,
      })
    ).toBeInTheDocument();
  });

  it('does not render any buttons (they are now in Header)', () => {
    const { container } = render(<Home {...defaultProps} loggedInStatus="not logged in" />);
    
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });
});