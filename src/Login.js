import React, { Component } from 'react';
import firebaseConfig, { auth, provider } from './firebase.js';

let log = console.log

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      name: null,
      // fullname: null,
      id: null,
      usersDb: [],
      email: null,
      password: null
    }
  }
  componentDidMount = () => {
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
  }

  updateList = () => {
    const data = firebaseConfig.database().ref();
    // console.log(data)
    data.on( 'child_added', ( snapshot ) => {
      /* snapshot.val() contains an object of objects from the Database:
      { {}, {}, ... , {} } */
      let obj = snapshot.val();
      // console.log( obj )
      // for (let key in obj) {
      //    obj[ key ][''] = key;
      // }

      let usersDb = [];
      for (let key in obj) {
          usersDb.push( obj[ key ] )
      }
      // console.log( typeof usersDb )
      // console.log( usersDb )

      this.setState( {
         usersDb: usersDb
      })
      console.log( this.state.usersDb )
    });
  }

  /* After the initialization one has to receive GoogleAuth object with gapi.auth2.getAuthInstance() */
  signIn = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    /* It signs in the user with the options specified to gapi.auth2.init() */
    /* signIn() returns promise containing GoogleUser */
    /* GoogleUSer is the documented, one can use anyone: user, googleUser, guser and so on  */
    /* signIn() requires options. In these optiones one has to point what it is requested */
    const authOk = (user) => {
      log(`Auth OK`, user);
      log(user.getBasicProfile().getName());
      log(user.getBasicProfile().getId());
      this.setState({
        name: user.getBasicProfile().getName(),
        id: user.getBasicProfile().getId()
      })
    }
    const authErr = () => log(`Auth ERROR`)
    GoogleAuth.signIn(
      /* Profile email is requested */
      {
        scope: 'profile email',
      }
    ).then(authOk, authErr);
    this.updateList();
  }

  signOut = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    GoogleAuth.signOut()
    .then(
      () => {
        log(`signOut OK`);
        this.setState({
          name: null
        })
      },
      () => log(`signOut ERROR`))
  }

  onChangeHandler = event => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({
      [name]: value /* The ES6 computed property name syntax is used to update the state key corresponding to the given input name:*/
    });
    log(this.state.email)
  };

  login = (event) => {
    event.preventDefault();
    let password = this.state.password;
    let email = this.state.email;
    console.log(this.state.email)
    const loginOk = (user) => {
      log(`Auth OK`, user);
    }
    const loginErr = () => log(`Auth ERROR`)
    // const { email, password } = event.target.elements;
    firebaseConfig.auth()
            .signInWithEmailAndPassword(email, password)
            // .then(loginOk, loginErr);
            .then(
              firebaseConfig.auth().onAuthStateChanged((user) => {
                if (user) {
                  // User logged in already or has just logged in.
                  log(user.uid)
                  this.setState({
                    id: user.uid,
                    name: user.name
                  })
                } else {
                  // User not logged in or has just logged out.
                }
              })
            )
  }

  render() {
    let { name, id } = this.state;
    let userTodos = this.state.usersDb.filter( (element) => {
      return (
        element.id === this.state.id
      )
    })
    .map( (element) => {
        return (
          <article key = { element.id }>
            <p>{ element.name }</p>
            { element.todo.map( (element) => {
              return (
                <>
                  <p>{ element.todo }</p>
                  <date>{ element.date }</date>
                </>
              )
            } ) }
          </article>
        )
    })
    return (
      <div className='App'>
        {name &&
          <div>
            <p>Hi, {name}!</p>
            <div>{userTodos}</div>
            <button onClick = { this.signOut }>Log out</button>
          </div>
        }
        {!name &&
          <div>
            <button id = 'g-signin2' onClick = { this.signIn }>Log in with Google</button>
            <form onSubmit = {this.login}>
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
              <button type='submit'>Log In</button>
            </form>
          </div>
        }
      </div>
    );
  }
}
