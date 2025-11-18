/**
 * RegistrationAuth Component
 *
 * A class-based form component that handles new user registration. It manages local
 * form state for email, password, and password confirmation, submits the data to the
 * backend registration endpoint, and notifies its parent component upon successful
 * account creation and authentication.
 *
 * Key responsibilities:
 * - Maintain controlled inputs for email, password, and password confirmation
 * - POST registration data to the Rails backend API at `/registrations`
 *  [](http://localhost:3001/registrations) with credentials included to establish
 *   a session cookie immediately after successful signup
 * - On successful registration (response status 'created'), invoke the parent-provided
 *   `handleSuccessfulAuth` callback with the full response payload (typically containing
 *   the newly created user object and logged-in status)
 * - On error, log the failure to the console (current implementation does not surface
 *   user-facing error messages)
 *
 * Props:
 * @prop {Function} handleSuccessfulAuth - Required callback passed from the parent
 *                                         (Registration component). Invoked with the
 *                                         server response data when registration
 *                                         and immediate login succeed.
 *
 * State:
 * @state {string} email                  - Email address entered by the user
 * @state {string} password               - Chosen password
 * @state {string} password_confirmation  - Password confirmation field
 * @state {string} registrationErrors      - Currently unused; reserved for future
 *                                           user-facing error display
 *
 * Note: This component assumes a Rails backend using Devise or similar, where the
 * registration endpoint returns a JSON response with a `status: 'created'` field
 * on success and automatically logs the user in via session cookie.
 */

import React, { Component } from 'react';
import axios from 'axios';
import '../Registration.scss'; 

export default class RegistrationAuth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      password_confirmation: '',
      registrationErrors: ''
    };
  }

  handleSubmit = (event) => {
    const { email, password, password_confirmation } = this.state;

    axios.post("http://localhost:3001/registrations", {
      user: { email, password, password_confirmation }
    }, { withCredentials: true })
      .then(response => {
        if (response.data.status === 'created') {
          this.props.handleSuccessfulAuth(response.data);
        }
      })
      .catch(error => {
        console.log("registration error", error);
      });

    event.preventDefault();
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className="authForm">
        <input type="text" style={{ display: 'none' }} />
        <input type="password" style={{ display: 'none' }} />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={this.state.email}
          onChange={this.handleChange}
          className="authInput"
          autoComplete="off"                
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={this.state.password}
          onChange={this.handleChange}
          className="authInput"
          autoComplete="new-password"        
          required
        />

        <input
          type="password"
          name="password_confirmation"
          placeholder="Password Confirmation"
          value={this.state.password_confirmation}
          onChange={this.handleChange}
          className="authInput"
          autoComplete="new-password"        
          required
        />

        <button type="submit" className="btn-primary">
          Register
        </button>
      </form>
    );
  }
}