import React, { Component } from 'react';
import { withRouter } from 'react-router';
import './Home.scss';

class Home extends Component {
  constructor(props) {
    super(props);
  }

// handleHome = () => {
//   this.props.history.push("/home");
// }

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