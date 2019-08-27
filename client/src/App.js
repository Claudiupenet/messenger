import React from 'react';
import './App.css';
import { Spinner, Row, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import Forgot from './components/Forgot';
import Reset from './components/Reset';
import Messenger from './components/Messenger';
import Profile from './components/Profile';
import axios from 'axios';

class App extends React.Component {
  
  constructor() {
    super();
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      rpassword: '',
      alertVisible: false,
      alertMessage: '',
      alertType: '',
      loading: true,
      profile_modal: false
    }
  }

   componentDidMount() {
    const token = localStorage.getItem("token");
    if(token) {
      axios.post('/user/login_using_token', {}, {headers: {token: token}})
      .then(res => {
        this.setState({isAuth: true, user: res.data.userData, loading: false})
      })
      .catch(err => {
        if(err.response && err.response.status === 403) {
          localStorage.removeItem('token');
          this.setState({alertVisible: true, alertMessage: "Token expired. Please login again!", alertType: "danger", loading: false})
        }
        else{
          console.log("Error at logging in using token " + err)
          localStorage.removeItem('token');
          this.setState({alertVisible: true, alertMessage: "Token error. Please login again!", alertType: "danger", loading: false})
        }
      })
    } else {
      this.setState({loading: false})
    }
  }
  
  updateData = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  updateUserData = (e) => {
    this.setState({
      user: {...this.state.user,
        [e.target.name]: e.target.value
      }
    })
  }

  dismissAlert = () => {
    this.setState({alertVisible: false, alertMessage: '', alertType: ''})
  }
  
  changeForm = (form) => {
    this.setState({form})
  }

  toggle_profile_modal = () => {
    this.setState(prevState => ({
        profile_modal: !prevState.profile_modal
    }));
}

  tryLogin = (e, history) => {
    e.preventDefault();
    if(this.state.email && this.state.password) {
      axios.post('/login', {email: this.state.email, password: this.state.password})
      .then(res => {  
        localStorage.setItem('token', res.data.token)
        this.setState({isAuth: true, user: res.data.userData})
        history.push('/');
      })
      .catch(error => {
        if(error.response && error.response.status === 404) {
          this.setState({alertVisible: true, alertMessage: "Wrong email address", alertType: "danger"})
        } else if(error.response && error.response.status === 401) {
          this.setState({alertVisible: true, alertMessage: "Wrong password", alertType: "danger"})
        } else {
          console.log(error)
          this.setState({alertVisible: true, alertMessage: "Error at login", alertType: "danger"})
        }
      })
    } else {
      this.setState({alertVisible: true, alertMessage: "Please provide email and password!", alertType: "danger"})
    }
  }

  tryRegister = (e, history) => {
    e.preventDefault();
    if(this.state.email && this.state.password && this.state.firstName && this.state.lastName) {
      if(!(this.state.password === this.state.rpassword)) {
        this.setState({alertVisible: true, alertMessage: "Passwords don't match!", alertType: "danger"})
      } else {
        axios.post('/register', {firstName: this.state.firstName, lastName: this.state.lastName, password: this.state.password, email: this.state.email})
        .then(res => {
          this.setState({alertVisible: true, alertMessage: "Registered with success. Please login.", alertType: "success"})
          history.push('/login');
        })
        .catch(error => {
          if(error.response && (error.response.status === 409)) {
            this.setState({alertVisible: true, alertMessage: "Email already in use", alertType: "danger"})
          } else {
            console.log(error)
          }
        })
      }
    }
  }

  tryReset = (e,token, history) => {
    e.preventDefault();
    if(this.state.password !== this.state.rpassword) {
      this.setState({alertVisible: true, alertMessage: "Passwords don't match!", alertType: "danger"})
    } else {
      axios.post('/reset_password', {password: this.state.password, token})
      .then(res => {
        if(res.status === 200) {
          this.setState({alertVisible: true, alertMessage: "Password was reset. Please login.", alertType: "success"})
          history.push('/login');
        }
      })
      .catch(err => {
        console.log("Error when trying to reset password " + err)
      })
    }
  }

  logout = () => {
    localStorage.removeItem('token');
    this.setState({isAuth: false, user: null})
  }
  
  render() {
    if (this.state.loading) {
      return (
        <Row className="d-flex align-items-center h-100 justify-content-center" style={{margin: "auto"}}>
             <Spinner color="primary" />
        </Row>
      )}

    return (
      <Router>
        {this.state.isAuth && <div className="user-menu d-none d-md-block">
              <UncontrolledDropdown>
                  <DropdownToggle className="p-0 btn-light" caret>
                  <img className="user-avatar" src={this.state.user.picture || '/img/avatar.png'} alt="User avatar" onError={(e)=>{e.target.onerror = null; e.target.src="/img/avatar.png"}}/> {this.state.user.firstName}
                  </DropdownToggle>
                  <DropdownMenu right>
                      <DropdownItem header>User Menu</DropdownItem>
                      <DropdownItem onClick={this.toggle_profile_modal}>Profile</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={this.logout}><img src="/img/logout.png" width="35" height="35" alt="Logout icon"/>  Log Out</DropdownItem>
                  </DropdownMenu>
              </UncontrolledDropdown>
          </div>}
        {this.state.isAuth && <Redirect to="/" />}
        {this.state.profile_modal && <Profile user={this.state.user} toggle={this.toggle_profile_modal} updateData={this.updateUserData} logout={this.logout} />}

        <Switch>
          <Route path="/login" render={(props) => 
            <Login {...props} changeForm={this.changeForm} 
            updateData={this.updateData} tryLogin={this.tryLogin} 
            dismissAlert={this.dismissAlert} alertMessage={this.state.alertMessage} 
            alertType={this.state.alertType} alertVisible={this.state.alertVisible} 
            />
          }
          />
          <Route path="/register" render={(props) => 
            <Register {...props} changeForm={this.changeForm} 
            updateData={this.updateData} tryRegister={this.tryRegister} 
            dismissAlert={this.dismissAlert} alertMessage={this.state.alertMessage} 
            alertType={this.state.alertType} alertVisible={this.state.alertVisible} 
            />} 
          />
          <Route path="/forgot" render={() =>
            <Forgot setAlert={(message) => this.setState({alertVisible: true, alertMessage: message, alertType: "danger"})} 
              dismissAlert={this.dismissAlert} alertMessage={this.state.alertMessage} 
              alertType={this.state.alertType} alertVisible={this.state.alertVisible} />} />
          <Route path="/reset/:token" render={(props) => 
          <Reset tryReset={(e,token, history) => this.tryReset(e,token, history)} 
            password={this.state.password} rpassword={this.state.rpassword} 
            updateData={this.updateData} {...props} 
            dismissAlert={this.dismissAlert} alertMessage={this.state.alertMessage} 
            alertType={this.state.alertType} alertVisible={this.state.alertVisible}/>} />
          <Route path="/" render={() => this.state.isAuth ? <Messenger appData={this.state} updateData={this.updateData} toggle_profile_modal={this.toggle_profile_modal} /> : <Redirect to="/login" />} />
        </Switch>
      </Router>
    );
  }
}

export default App;
