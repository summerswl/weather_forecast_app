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
