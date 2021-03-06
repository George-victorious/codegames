import React from 'react'
import styled from 'styled-components';
import Menu from './Menu'
import Codenames from './Codenames'
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
            <Route exact path="/" component={Menu} />
            <Route path="/codenames" component={Codenames} />
            <Route path="/add" component={AddWords} />
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
`
