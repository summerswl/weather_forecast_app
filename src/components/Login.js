/**
 * Login Component
 *
 * This class component serves as the presentation layer for the user login page.
 * It provides the page structure, heading, and layout container while delegating
 * the actual form rendering and authentication logic to the LoginAuth child component.
 *
 * Primary responsibilities:
 * - Render the login page UI with a title and form wrapper
 * - Supply a callback (handleSuccessfulAuth) that is triggered by LoginAuth
 *   when authentication succeeds
 * - Upon successful login:
 *     • Update the application-wide authentication state by calling the
 *       `handleLogin` function passed down from a parent component (typically App)
 *     • Programmatically navigate the user to the protected "/dashboard" route
 *       using React Router's history API
 *
 * Props:
 * @prop {Function} handleLogin - Required callback provided by the parent component
 *                                (usually the root App) to update global auth state
 *                                with the authenticated user data.
 * @prop {Object}   history     - React Router history object (injected automatically
 *                                when the component is rendered inside a <Route>)
 *                                used for programmatic navigation after login.
 *
 */

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