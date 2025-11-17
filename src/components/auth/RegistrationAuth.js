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