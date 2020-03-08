import React, { Component } from 'react';
import firebaseConfig, { auth, provider } from './firebase.js';

let log = console.log
export default class App extends Component {
  constructor() {
    super();
    this.state = {
      name: null,
      data: [],
      user: null
    }
  }
  componentDidMount = () => {
    /* Plug in google sign-in library */
    /* The ligrary is global, but nobody know about it, even react, so use global object 'window', which provides variables and functions to be accessible at any place of the app */
    window.gapi.load('auth2', function() {
    /* Make a call to gapi.auth2 (!!! obligatory before calling gapi.auth2.GoogleAuth's methods !!!) and initialize GoogleAuth object it with .init */
      window.gapi.auth2
        .init({
          /* Hide acces key to environment variables. With create-react-app, you need to  prefix REACT_APP_ to the variable name to be able to access it. */
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        })
        .then(() => log(`init OK`), () => log(`init ERROR`));
    });
    this.updateList();
  }

  updateList = () => {
    const data = firebaseConfig.database().ref();
    // console.log(data)
    data.on( 'child_added', ( snapshot ) => {
      /* snapshot.val() contains an object of objects from the Database:
      { {}, {}, ... , {} } */
      let obj = snapshot.val();
      // console.log( obj )
      for (let key in obj) {
         obj[ key ][ 'id' ] = key;
      }

      let data = [];
      for (let key in obj) {
          data.push( obj[ key ] )
      }
      // console.log( typeof data )
      // console.log( data )

      this.setState( {
         data: data
      })
      console.log( this.state.data )
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
      this.setState({
        name: user.getBasicProfile().getName()
      })
    }
    const authErr = () => log(`Auth ERROR`)
    GoogleAuth.signIn(
      /* Profile email is requested */
      {
        scope: 'profile email',
      }
    ).then(authOk, authErr);
  }

  signOut = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    GoogleAuth.signOut().then(
      () => {
        log(`signOut OK`);
        this.setState({
          name: null
        })
      },
      () => log(`signOut ERROR`))
  }

  render() {
    let { name } = this.state;
    let history = this.state.data.map( ( element ) => {
        return (
          <article key = { element.id }>
            <p>{ element.town }</p>
            <p>{ element.address }</p>
          </article>
        )
    })
    return (
      <div className="App">
        <h1>GAuth</h1>
        {name && <p>Hi, {name}!</p>}
        {!name ? <div id = 'g-signin2' onClick = { this.signIn }>Log in</div> : <button onClick = { this.signOut }>Log out</button>}
        {history}
      </div>
    );
  }
}
