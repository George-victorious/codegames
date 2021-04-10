import React from 'react'
import styled from 'styled-components';
import Menu from './Menu'
import HomeEasy from './HomeEasy'
import AddWords from './AddWords'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


function App() {
  return (
    <AppDiv>
      <Router>
          <Switch>
            <Route exact path="/">
              <Menu />
            </Route>
            <Route path="/codenames">
              <HomeEasy />
            </Route>
            <Route path="/add">
              <AddWords />
            </Route>
          </Switch>
      </Router>
    </AppDiv>
  );
}

export default App;

const AppDiv = styled.div`
  width: 100%;
  height: 100vh;
  max-width: 100%;
  user-select: none;
  cursor: url('curauto.png') , auto!important;
`
