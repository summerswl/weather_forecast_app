/**
 * App Component
 *
 * The root component of the React frontend application. It serves as the central
 * authentication state manager and primary router for the entire app.
 *
 * Key responsibilities:
 * - Maintain global authentication state (`loggedInStatus` and `user`)
 * - Check the current session status against the Rails backend on initial mount
 *   via the `/logged_in` endpoint (cookie-based authentication)
 * - Provide `handleLogin` and `handleLogout` callbacks to child components
 *   (Login, Registration, Header, Dashboard, Home) to synchronize auth state
 * - Render the persistent Header and conditionally display routes using
 *   React Router v4/v5 <Switch> and <Route>
 * - Control visibility of the Home component via the `showHome` flag
 *   (used to briefly display Home after logout before potential redirect)
 *
 * Authentication flow:
 * - On mount: automatically checks if a valid session cookie exists
 * - On successful login/registration: child components call `handleLogin(data)`
 *   → updates state with user object and sets `loggedInStatus = "logged in"`
 * - On logout: `handleLogout()` clears user data and forces redirect to root
 *
 * State:
 * @state {string}  loggedInStatus - Current auth status: "logged in" | "not logged in"
 * @state {Object}  user           - User object when authenticated; empty object when not
 * @state {boolean} showHome       - Controls whether the Home component is visible
 *                                   (used primarily after logout)
 *
 * Routes:
 * - /home         → Home (public, but conditionally rendered)
 * - /login        → Login page
 * - /registration → Registration page
 * - /dashboard    → Protected user dashboard
 *
 * Notes:
 * - Uses React Router v4/v5 syntax with render props to pass auth handlers
 *   and state down to route components
 * - Relies on a Rails API backend at http://localhost:3001 with cookie-based
 *   session authentication and JSON responses
 * - The Home component is rendered outside the <Switch> to allow overlay/persistent
 *   visibility in certain states (e.g., welcome message after logout)
 *
 * This component is the single source of truth for authentication state in the
 * frontend application.
 */
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Home from './Home';
import Dashboard from './Dashboard';
import Header from './Header'
import Registration from './Registration';

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      loggedInStatus: "not logged in",
      showHome: false
    };
  }

  checkLoginStatus = () => {
    axios
      .get("http://localhost:3001/logged_in", { withCredentials: true})
      .then(response => {
        if (response.data.logged_in && this.state.loggedInStatus === "not logged in") {
          this.setState({
            loggedInStatus: "logged in",
            user: response.data.user
          })
        } else if (!response.data.logged_in && this.state.loggedInStatus === "logged in") {
          this.setState({
            loggedInStatus: "not logged in",
            user: {}
          })
        }
      }).catch(error => {
        console.log("check login error", error);
      });
  }

  componentDidMount() {
    this.checkLoginStatus();
  }

  handleLogout = () => {
    this.setState({
      loggedInStatus: "not logged in",
      user: {},
      showHome: true
    })
  }

  handleLogin = (data) => {
    this.setState({
      loggedInStatus: "logged in",
      user: data.user,
      showHome: false
    })
  }

  render() {
    return (
      <div className='app'>
        <div>
          <Header
            loggedInStatus={this.state.loggedInStatus}
            handleLogin={this.handleLogin}
            handleLogout={this.handleLogout}
          />
        <Home
            loggedInStatus={this.state.loggedInStatus}
            handleLogout={this.handleLogout}
          />
        </div>
        <Switch>
          <Route 
            exact
            path={'/home'} 
            component={props => (
              <Home 
                {...props} 
                handleLogin={this.handleLogin}
                handleLogout={this.handleLogout} 
                loggedInStatus={this.state.loggedInStatus} />
            )}   
          />
          <Route 
            exact 
            path={'/login'} 
            component={props => (
              <Login 
                {...props} 
                handleLogin={this.handleLogin}
                handleLogout={this.handleLogout} 
                loggedInStatus={this.state.loggedInStatus} />
            )} 
          />
          <Route 
            exact 
            path={'/registration'} 
            component={props => (
              <Registration 
                {...props} 
                handleLogin={this.handleLogin}
                handleLogout={this.handleLogout} 
                loggedInStatus={this.state.loggedInStatus} />
            )} 
          />
          <Route 
            exact 
            path={'/dashboard'} 
            component={props => (
              <Dashboard {...props} loggedInStatus={this.state.loggedInStatus} />
            )}
          /> 
        </Switch>         
      </div>
    );
  }
}
