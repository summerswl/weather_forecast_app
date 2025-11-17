// src/components/Registration.js
import React, { Component } from 'react';
import RegistrationAuth from './auth/RegistrationAuth';
import './Registration.scss';   // ← Import the new styles

export default class Registration extends Component {
  constructor(props) {
    super(props);
  }  

  handleSuccessfulAuth = (data) => {
    const { handleLogin, history } = this.props;
    handleLogin(data);
    history.push("/dashboard");
  };

  handleLogout = () => {
    this.props.handleLogout(); 
  };

  render() {
    return (
      <div className="registration">
        <h1>Registration</h1>
        <div className="registrationFormContainer">
          <RegistrationAuth handleSuccessfulAuth={this.handleSuccessfulAuth} />
        </div>
      </div>
    );
  }
}