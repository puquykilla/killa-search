import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, browserHistory } from 'react-router';
var App = React.createClass({
  render: function(){
    return (
      <div>
        <header>
          <ul>
            <li><Link to="/search">Search</Link></li>
            <li><Link to="/results">results</Link></li>
          </ul>
        </header>
        { this.props.children }
      </div>
    );
  }
});

var Search = React.createClass({
  render: function(){
    return (
      <div>
        <p>Search</p>
      </div>
    )
  }
});

var Results = React.createClass({
  render: function(){
    return (
      <div>
        <p>Results</p>
      </div>
    )
  }
});

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Search}/>
      <Route path="search" component={Search} />
      <Route path="results" component={Results} />
      <Route path="*" component={Search} />
    </Route>
  </Router>
), document.getElementById('app'));
