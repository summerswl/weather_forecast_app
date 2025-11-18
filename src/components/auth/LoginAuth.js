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