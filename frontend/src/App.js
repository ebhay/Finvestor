import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import { Login, Register } from './components/Auth';
import { StockList, StockDetail } from './components/Stock';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/stocks" exact component={StockList} />
        <Route path="/stocks/:id" component={StockDetail} />
      </Switch>
    </Router>
  );
}

export default App;