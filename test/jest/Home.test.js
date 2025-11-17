import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../../src/components/Home';

// Helper to render with a mocked history
const renderWithHistory = (props = {}) => {
  const history = { push: jest.fn() };
  const defaultProps = {
    loggedInStatus: 'not logged in',
    handleLogout: jest.fn(),
    history,
    ...props,
  };
  const utils = render(<Home.WrappedComponent {...defaultProps} />);
  return { ...utils, history, props: defaultProps };
};

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome heading and status text', () => {
    renderWithHistory({ loggedInStatus: 'not logged in' });

    expect(
      screen.getByText('Welcome, please login or create an account')
    ).toBeInTheDocument();
    expect(screen.getByText('Status: You are not logged in')).toBeInTheDocument();
  });

  it('shows Login and Create Account buttons when not logged in', () => {
    renderWithHistory({ loggedInStatus: 'not logged in' });

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create Account' })
    ).toBeInTheDocument();
  });

  it('shows Logout button and hides Create Account when logged in', () => {
    renderWithHistory({ loggedInStatus: 'logged in' });

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create Account' })
    ).not.toBeInTheDocument();
  });

  it('navigates to /login when Login clicked', () => {
    const { history } = renderWithHistory({ loggedInStatus: 'not logged in' });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(history.push).toHaveBeenCalledWith('/login');
  });

  it('navigates to /registration when Create Account clicked', () => {
    const { history } = renderWithHistory({ loggedInStatus: 'not logged in' });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(history.push).toHaveBeenCalledWith('/registration');
  });

  it('calls handleLogout and navigates to / on Logout clicked', () => {
    const handleLogout = jest.fn();
    const { history } = renderWithHistory({ loggedInStatus: 'logged in', handleLogout });

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(handleLogout).toHaveBeenCalled();
    expect(history.push).toHaveBeenCalledWith('/');
  });

  it('navigates to /dashboard when handleDashboard is invoked', () => {
    // Access class instance via ref to call method directly
    const history = { push: jest.fn() };
    const ref = React.createRef();
    render(
      <Home.WrappedComponent
        ref={ref}
        history={history}
        loggedInStatus="logged in"
        handleLogout={jest.fn()}
      />
    );

    // Call method directly
    ref.current.handleDashboard();
    expect(history.push).toHaveBeenCalledWith('/dashboard');
  });
});
