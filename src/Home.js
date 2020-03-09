import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebaseConfig from './firebase.js';

let log = console.log

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      email: '',
      fullname: ''
    }
  }
  componentDidMount = () => {
    console.log(this.state.email)
    /* Plug in google sign-in library */
    /* The library is global, but nobody know about it, even react, so use global object 'window', which provides variables and functions to be accessible at any place of the app */
    window.gapi.load('auth2', function() {
    /* Make a call to gapi.auth2 (!!! obligatory before calling gapi.auth2.GoogleAuth's methods !!!) and initialize GoogleAuth object it with .init */
      window.gapi.auth2
        .init({
          /* Hide acces key to environment variables. With create-react-app, you need to  prefix REACT_APP_ to the variable name to be able to access it. */
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        })
        .then(() => log(`init OK`), () => log(`init ERROR`));
    });
  };

  onChangeHandler = event => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({
      [name]: value /* The ES6 computed property name syntax is used to update the state key corresponding to the given input name:*/
    });
    log(this.state.email)
  };

  signUp = (event) => {
    event.preventDefault();
    let password = this.state.password;
    let email = this.state.email;
    console.log(this.state.email)
    const signUpOk = (user) => {
      log(`Auth OK`, user);
    }
    const signUpErr = () => log(`Auth ERROR`)
    // const { email, password } = event.target.elements;
    firebaseConfig.auth()
            .createUserWithEmailAndPassword(email, password)
            // .then(signUpOk, signUpErr);
            .then( () => {
              let uid = firebaseConfig.auth().currentUser.uid;
              firebaseConfig.database().ref().child('users').child(uid).set({
                email: this.state.email,
                id: uid,
                name: this.state.fullname
              })
              this.resetForm();
        })
  }

  resetForm = () => {
    this.setState({
      password: '',
      email: '',
      fullname: ''
    });
  };

  render() {
    return (
      <>
        <Link exact to = '/login'>
          <p>Login</p>
        </Link>
        <form onSubmit = {this.signUp}>
          <label>
            Email
            <input
              name='email'
              type='email'
              onChange={this.onChangeHandler}
              required
            />
          </label>
          <label>
            Password
            <input
              name='password'
              type='password'
              onChange={this.onChangeHandler}
              required
            />
          </label>
          <label>
            Name
            <input
              name='fullname'
              type='text'
              onChange={this.onChangeHandler}
              required
            />
          </label>
          <button type='submit'>Sign Up</button>
        </form>
      </>
    )
  }
};
