/**
 * LoginAuth Component
 *
 * A class-based form component responsible for handling user login functionality.
 * It manages local form state (email, password, and error messages), performs an
 * HTTP POST request to the backend authentication endpoint, and communicates the
 * result back to its parent component (Login.js) via a callback.
 *
 * Key responsibilities:
 * - Maintain controlled inputs for email and password
 * - Clear any previous login errors when the user starts typing
 * - Submit credentials to the Rails backend API at `/sessions`[](http://localhost:3001/sessions)
 * - Include credentials in the request (withCredentials: true) to support session cookies
 * - On successful authentication (response status 'created'), invoke the parent-provided
 *   `handleSuccessfulAuth` callback with the full response data (which typically includes
 *   the user object and logged-in status)
 * - On failure, display an appropriate error message derived from the server response
 *   or a generic fallback
 *
 * Props:
 * @prop {Function} handleSuccessfulAuth - Required callback passed from the parent
 *                                         (Login component). Called with the server
 *                                         response data upon successful login.
 *
 * State:
 * @state {string} email        - Current value of the email input field
 * @state {string} password     - Current value of the password input field
 * @state {string} loginErrors  - Error message to display after a failed login attempt
 *
 * Note: This component is tightly coupled to a Rails backend using cookie-based
 * session authentication. It assumes the server responds with a JSON payload
 * containing at least a `status` field ('created' on success).
 */
import React, { Component } from 'react';
import axios from 'axios';
import '../Login.scss';

export default class LoginAuth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      loginErrors: ''
    };
  }

  componentDidMount() {
    this.setState({ email: '', password: '', loginErrors: '' });
  }

  handleSubmit = (event) => {
    const { email, password } = this.state;

    axios.post("http://localhost:3001/sessions", {
      user: { email, password }
    }, { withCredentials: true })
      .then(response => {
        if (response.data.status === 'created') {
          this.props.handleSuccessfulAuth(response.data);
        } else {
          this.setState({ loginErrors: 'Invalid email or password' });
        }
      })
      .catch(error => {
        this.setState({
          loginErrors: error.response?.data?.error || 'Login failed. Please try again.'
        });
      });

    event.preventDefault();
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      loginErrors: ''   
    });
  };

  render() {
    const { loginErrors } = this.state;

    return (
      <div>
        <form onSubmit={this.handleSubmit} autoComplete="on">

          <input type="text" style={{ display: 'none' }} />
          <input type="password" style={{ display: 'none' }} />

          <input
            type="email"
            name="email"                  
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleChange}
            className="loginInput"
            autoComplete="username"       
            required
          />

          <input
            type="password"
            name="password"               
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange}
            className="loginInput"
            autoComplete="current-password"  
            required
          />

          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
      </div>
    );
  }
}