import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return <>
  <Link exact to = '/signup'>
    <p>SignUp</p>
  </Link>
  <Link exact to = '/signup'>
    <p>Login</p>
  </Link>
  </>;
};

export default Home;
