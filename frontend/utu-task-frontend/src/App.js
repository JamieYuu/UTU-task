import React, {Component} from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testAPIres: "",
    };
  }

  // test case for backend API initialization
  testAPI() {
    fetch("http://localhost:3001/testAPI")
            .then(res => res.text())
            .then(res => this.setState({ testAPIres: res }))
            .catch(err => err);
    // axios.get('localhost:3001/testAPI')
    //   .then(res => {
    //     this.setState({ testAPIres: res });
    //   })
    //   .catch(err => {
    //     console.log('Error when calling /testAPI: ', err);
    //   })
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
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
