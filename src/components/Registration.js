/**
 * Registration Component
 *
 * Serves as the main presentation layer for the user registration page.
 * It renders the page title and wraps the RegistrationAuth component, which contains the actual
 * registration form and authentication logic.
 *
 * Responsibilities:
 * - Display the registration page heading and layout structure
 * - Provide a callback (handleSuccessfulAuth) that is invoked by RegistrationAuth upon
 *   successful user registration and authentication
 * - Upon successful authentication, update the application state with the logged-in user
 *   data (via the handleLogin prop passed from a parent component, typically App.js) and
 *   programmatically redirect the user to the protected "/dashboard" route using React Router's
 *   history API
 *
 * Props:
 * @prop {Function} handleLogin      - Callback function received from the parent (usually App)
 *                                    to update global authentication state with the user object.
 * @prop {Object}   history          - React Router history object (injected by withRouter or
 *                                    Route component) used for programmatic navigation.
 */

import React, { Component } from 'react';
import RegistrationAuth from './auth/RegistrationAuth';
import './Registration.scss';   

export default class Registration extends Component {
  constructor(props) {
    super(props);
  }  

  handleSuccessfulAuth = (data) => {
    const { handleLogin, history } = this.props;
    handleLogin(data);
    history.push("/dashboard");
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