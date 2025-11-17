import React, { Component } from 'react';
import LoginAuth from './auth/LoginAuth';
import './Login.scss';

export default class Login extends Component {
  constructor(props) {
    super(props);
  }

  handleSuccessfulAuth = (data) => {
    this.props.handleLogin(data);
    this.props.history.push("/dashboard");
  };

  render() {
    return (
      <div className="login">
        <h2>Login</h2>
        <div className="loginFormContainer">
          <LoginAuth handleSuccessfulAuth={this.handleSuccessfulAuth} />
        </div>
      </div>
    );
  }
}