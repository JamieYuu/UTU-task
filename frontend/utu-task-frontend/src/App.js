import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testAPIres: "",
    };
  }

  // test case for backend API initialization
  testAPI() {
    fetch("http://localhost:3001/testAPIConnection")
            .then(res => res.text())
            .then(res => this.setState({ testAPIres: res }))
            .catch(err => err);
  }

  clickBtn() {
    console.log('clicked')
    fetch("http://localhost:3001/testMongoDBConnection")
            .then(res => res.text())
            .then(res => console.log('DBconnect result: ', res))
            .catch(err => err);
  }

  componentDidMount() {
    this.testAPI();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            API result: {this.state.testAPIres}
          </p>
          <Button variant="light" onClick={this.clickBtn}> Click me! </Button>
        </header>
      </div>
    );
  }
}

export default App;
