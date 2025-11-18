/**
 * Header Component
 *
 * A persistent application header that displays the site title and authentication-aware
 * navigation controls. It conditionally renders either "Login / Create Account" buttons
 * when the user is not authenticated, or a single "Logout" button when the user is logged in.
 *
 * Responsibilities:
 * - Render the application branding/title ("Weather Forecast App")
 * - Display appropriate authentication buttons based on the current login state
 * - Handle navigation to the login, registration, and home routes
 * - Trigger the parent's `handleLogout` callback and redirect to the root route ("/")
 *   upon logout
 *
 * Props:
 * @prop {string}   loggedInStatus - Current authentication state. Expected values:
 *                                   "not logged in" | "logged in" (or similar string).
 *                                   Determines which set of buttons to display.
 * @prop {Function} handleLogout   - Callback provided by the parent (typically App)
 *                                   to clear authentication state and user data.
 * @prop {Object}   history        - Injected by `withRouter`. Used for programmatic
 *                                   navigation via `history.push()`.
 *
 */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './Header.scss';

class Header extends Component {
  handleLogin = () => this.props.history.push('/login');
  handleRegistration = () => this.props.history.push('/registration');
  handleLogout = () => {
    this.props.handleLogout();
    this.props.history.push('/');
  };

  renderAuthButtons = () => {
    const { loggedInStatus } = this.props;

    if (loggedInStatus === 'not logged in') {
      return (
        <>
          <button className="btn-primary headerBtn" onClick={this.handleLogin}>
            Login
          </button>
          <button className="btn-primary headerBtn" onClick={this.handleRegistration}>
            Create Account
          </button>
        </>
      );
    }

    return (
      <button className="btn-primary headerBtn" onClick={this.handleLogout}>
        Logout
      </button>
    );
  };

  render() {
    return (
      <header className="header">
        <div className="headerContent">
          <h1>Weather Forecast App</h1>
          <nav className="authNav">{this.renderAuthButtons()}</nav>
        </div>
      </header>
    );
  }
}

export default withRouter(Header);