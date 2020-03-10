import React, { Component } from 'react';
import firebaseConfig from './firebase.js';
import styled from 'styled-components';


let log = console.log

const Wrapper = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-itens: center;
  & h3, form, button {
    margin: 1rem 0;
  }
  & button, input {
    width: 50vw;
    max-width: 21rem;
  }
`;

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      email: '',
      name: '',
      id: null,
      usersDb: [],
    }
  }

  componentDidMount = () => {
    // log(this.state.email)
    /* Plug in google sign-in library */
    /* The library is global, but nobody know about it, even react, so use global object 'window', which provides variables and functions to be accessible at any place of the app */
    window.gapi.load('auth2', function() {
    /* Make a call to gapi.auth2 (!!! obligatory before calling gapi.auth2.GoogleAuth's methods !!!) and initialize GoogleAuth object it with .init */
      window.gapi.auth2
      .init({
        /* Hide acces key to environment variables. With create-react-app, you need to  prefix REACT_APP_ to the variable name to be able to access it. */
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      })
      .then(
        // () => log(`init OK`),
        // () => log(`init ERROR`)
      );
    });
  };

  updateList = () => {
    const data = firebaseConfig.database().ref();
    // log(data)
    data.on( 'child_added', ( snapshot ) => {
      /* snapshot.val() contains an object of objects from the Database:
      { {}, {}, ... , {} } */
      let obj = snapshot.val();
      // log( obj )
      // for (let key in obj) {
      //    obj[ key ][''] = key;
      // }
      let usersDb = [];
      for (let key in obj) {
          usersDb.push( obj[ key ] )
      }
      // log( typeof usersDb )
      // log( usersDb )

      this.setState( {
         usersDb: usersDb
      })
      // log( this.state.usersDb )
      // log( this.state.name )
    });
  }

  onChangeHandler = event => {
    let key = event.target.name;
    let value = event.target.value;
    this.setState({
      [key]: value /* The ES6 computed property name syntax is used to update the state key corresponding to the given input name:*/
    });
    // log(this.state.email)
  };

  signUpWithEmail = (event) => {
    event.preventDefault();
    let password = this.state.password;
    let email = this.state.email;
    // const signUpWithEmailOk = (user) => {
    //   log(`Auth OK`, user);
    // }
    // const signUpWithEmailErr = () => log(`Auth ERROR`);
    firebaseConfig.auth()
      .createUserWithEmailAndPassword(email, password)
      // .then(signUpWithEmailOk, signUpWithEmailErr);
      .then( () => {
        let uid = firebaseConfig.auth().currentUser.uid;
        firebaseConfig.database().ref().child('users').child(uid).set({
          email: this.state.email,
          id: uid,
          name: this.state.name
        })
        this.resetForm();
      })
  }

  signInWithEmail = (event) => {
    event.preventDefault();
    let password = this.state.password;
    let email = this.state.email;
    // log(this.state.email)
    // const signInWithEmailOk = (user) => {
    //   log(`Auth OK`, user);
    // }
    // const signInWithEmailErr = () => log(`Auth ERROR`)
    firebaseConfig.auth()
      .signInWithEmailAndPassword(email, password)
      // .then(signInWithEmailOk, signInWithEmailErr);
      .then(() => {
        let uid = firebaseConfig.auth().currentUser.uid;
        firebaseConfig.auth().onAuthStateChanged((user) => {
          // log(`user.uid: ${user.uid}`)
          // log('Auth OK')
          this.setState({
            id: user.uid
          })
        })}
      )
      this.updateList();
  }

  resetForm = () => {
    this.setState({
      password: '',
      email: '',
      name: ''
    });
  };


  signInWithGoogle = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    /* It signs in the user with the options specified to gapi.auth2.init() */
    /* signIn() returns promise containing GoogleUser */
    /* GoogleUSer is the documented, one can use anyone: user, googleUser, guser and so on  */
    /* signIn() requires options. In these optiones one has to point what it is requested */
    const authOk = (user) => {
      // log(`Auth OK`, user);
      // log(user.getBasicProfile().getName());
      // log(user.getBasicProfile().getId());
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
        // log(`signOut OK`);
        this.setState({
          password: '',
          email: '',
          name: '',
          id: null,
          usersDb: [],
        })
      },
      // () => log(`signOut ERROR`)
    )
  }

  render() {
    let { id } = this.state;
    let userTodos = this.state.usersDb.filter( (element) => {
      return (
        element.id === this.state.id
      )
    })
    .map( (element) => {
        return (
          <article key = { element.id }>
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
      <>
        {id &&
          <Wrapper className = 'wrapper'>
            <p>Hi, {id}!</p>
            <div>{userTodos}</div>
            <button onClick = { this.signOut }>Log out</button>
          </Wrapper>
        }
        {!id &&
          <Wrapper>
            <h3>Sign up with email and password</h3>
            <form onSubmit = {this.signUpWithEmail}>
              <label>
                <p>Email</p>
                <input
                  name='email'
                  type='email'
                  onChange={this.onChangeHandler}
                  required
                />
              </label>
              <label>
                <p>Password</p>
                <input
                  name='password'
                  type='password'
                  onChange={this.onChangeHandler}
                  required
                />
              </label>
              <label>
                <p>Name</p>
                <input
                  name='name'
                  type='text'
                  onChange={this.onChangeHandler}
                  required
                />
              </label><br />
              <button type='submit'>Sign Up</button>
            </form>
            <h3>Do already have an account?</h3>
            <p>Sign in with Google...</p>
            <button id = 'g-signin2' onClick = { this.signInWithGoogle }>Log in with Google</button>
            <p>...or email and password</p>
            <form onSubmit = {this.signInWithEmail}>
              <label>
                <p>Email</p>
                <input
                  name='email'
                  type='email'
                  onChange={this.onChangeHandler}
                  required
                />
              </label>
              <label>
                <p>Password</p>
                <input
                  name='password'
                  type='password'
                  onChange={this.onChangeHandler}
                  required
                />
              </label>
              <br />
              <button type='submit'>Log In</button>
            </form>
          </Wrapper>
        }
      </>
    )
  }
};
