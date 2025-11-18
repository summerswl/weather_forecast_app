/**
 * Home Component
 *
 * Serves as the primary entry point for both authenticated and unauthenticated users
 *
 * Key Responsibilities:
 * - Displays a personalized greeting based on authentication state
 * - Informs unauthenticated users that login/registration is required to access forecasts
 * - Welcomes returning users and gently directs them to the Dashboard
 * - Previously rendered inline Login/Logout/Create Account buttons (now moved to Header)
 * - Maintains full visual consistency with the rest of the app via shared design system
 * 
 * The component is intentionally lightweight and declarative, relying on props passed from
 * App.js for authentication state and routing capabilities.
 *
 * @param {Object} props
 * @param {string} props.loggedInStatus - Current authentication state ("logged in" or "not logged in")
 * @param {Function} props.handleLogout - Callback to log the user out and clear session
 * @param {Object} props.history - React Router history object (injected via withRouter)
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import './Home.scss';

class Home extends Component {
  constructor(props) {
    super(props);
  }

handleLogin = () => {
  this.props.history.push('/login');
}

handleRegistration = () => {
  this.props.history.push("/registration");
}

handleDashboard = () => {
  this.props.history.push("/dashboard");
}

handleLogout = () => {
  this.props.handleLogout();
  this.props.history.push("/"); 
}

showLoginLogout = () => {
  if (this.props.loggedInStatus === "not logged in") {
    return <button className="btn-primary" onClick={this.handleLogin}>Login</button>;
  } else {
    return <button className="btn-primary" onClick={this.handleLogout}>Logout</button>;
  }
}

showRegistration = () => {
  if (this.props.loggedInStatus === "not logged in") {
    return <button className="btn-primary" onClick={this.handleRegistration}>Create Account</button>;
  } else {
    '';
  }
}


  render() {
    const { loggedInStatus } = this.props;

    return (
      <div className="home">
        <h1>
          {loggedInStatus === 'not logged in'
            ? 'Welcome, please login or create an account to see your forecast'
            : 'Welcome back! Enter an address for today’s forecast?'}
        </h1>
      </div>
    );
  }
};

export default withRouter(Home);