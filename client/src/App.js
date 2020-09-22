import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import withAuth from './helpers/withAuth';
import Home from './Home';
import Secret from './Secret';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Navbar from './components/navbar/Navbar';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Register from './components/auth/Register';
import Project from './components/project/Project';
import UserProjects from './components/project/UserProjectsList';
import AllProjects from './components/project/AllProjects';
import Guide from './components/guide/Guide';


class App extends Component {
  render() {
    return (
      <div className="page-container">
        <body>
        <div>
        <Navbar></Navbar>
        <Header></Header>
        
        
        <div className="content-wrap">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/secret" component={withAuth(Secret)} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/project" component={withAuth(Project)} />
          <Route path="/user-projects" component={withAuth(UserProjects)} />
          <Route path="/all-projects" component={AllProjects} />
          <Route path="/guide" component={Guide} />
        </Switch>
        
       
        </div>
        <Footer></Footer>
        </div>
        </body>
      </div>
      
    );
  }
}

export default App;
