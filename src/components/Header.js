// src/components/Header.js
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