import React, {Component} from 'react';

import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSVReader } from 'react-papaparse';

import axios from "axios"

const buttonRef = React.createRef()

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testAPIres: "",
      tableData: [],
      insertData: null,
      filter: 0, // 0: latest 1day; 1: week; 2: month
      show: false,
    };
  }

  // Function handle the open dialog situation
  handleOpenDialog = (e) => {
    if (buttonRef.current) {
      buttonRef.current.open(e)
    }
  }

  // Function handle the file load situation
  handleOnFileLoad = (data) => {
    var currencyType = [];
    var dataSets = [];

    for (var i=1; i<data.length-1; i++) {
      var targetData = data[i].data
      targetData[1] = new Date(targetData[1])

      // Convert string into integer or float
      for (var a=2; a<6; a++) {
        targetData[a] = parseFloat(targetData[a].replaceAll(',', ''))
      }
      targetData[6] = targetData[6].replaceAll(',', '')
      targetData[7] = targetData[7].replaceAll(',', '')

      const index = currencyType.indexOf(targetData[0])

      if (index > -1) {
        dataSets[index].push(targetData)
      } else {
        currencyType.push(targetData[0])
        dataSets.push([targetData])
      }
    }

    const udpateData = { currencyType: currencyType, dataSets: dataSets }
    this.setState({ insertData: udpateData});
  };

  // Function handles error when load file
  handleOnError = (err, file, inputElem, reason) => {
    console.log('Error occurs: ', err);
  };

  // Function handles remove file
  handleOnRemoveFile = (data) => {
    console.log('File removed');
  };

  // Function handles remove file
  handleRemoveFile = (e) => {
    if (buttonRef.current) {
      buttonRef.current.removeFile(e);
      this.setState({ insertData: null })
    }
  };

  // Function handles click update Button event
  handleinsertData = () => {
    if (this.state.insertData == null) {
      this.setState({ show: true })
    } else {
      try {
        axios({
          method: "post",
          url: 'http://' + window.location.hostname + ':3001/insertData',
          data: {
            data: this.state.insertData,
          },
        })
          .then((result) => {
            if (result.status === 200) {
              window.location.reload()
            }
          })
          .catch(function (err) {
            console.log(err)
          })
      } catch (error) {
        alert(error)
      }
    }
  };

  // Function handles calling backend API to read data event
  handleGetData = () => {
    try {
      axios({
        method: "get",
        url: 'http://' +window.location.hostname + ':3001/getDataByFilter',
        params: {
          filter: this.state.filter,
        },
      })
        .then((result) => {
          var orderedData = result.data
          orderedData.sort((a, b) => (parseInt(a.mktCap) > parseInt(b.mktCap)) ? -1 : 1);
          console.log(orderedData)

          this.setState({ tableData: orderedData })
        })
        .catch(function (err) {
          console.log(err)
        })
    } catch (error) {
      alert(error)
    }
  }

  // Function handles filter change event
  handleFilterChange = (e) => {
    if (e !== this.state.filter) {
      this.setState({ filter: e}, () => {
        this.handleGetData()
      })
    }
  }

  // Test case for backend API initialization
  testAPI() {
    fetch('http://' +window.location.hostname + ":3001/testAPIConnection")
            .then(res => res.text())
            .then(res => this.setState({ testAPIres: res }))
            .catch(err => console.log('err', err));
  }

  // clickBtn() {
  //   console.log('clicked')
  //   fetch("http://localhost:3001/testMongoDBConnection")
  //           .then(res => res.text())
  //           .then(res => console.log('DBconnect result: ', res))
  //           .catch(err => err);
  // }

  componentDidMount() {
    this.handleGetData();

    this.testAPI();

    // Dummy data for testing the performance of table component
    // const testTableData = [
    //   { currencyName: 'tezos', currencyPrice: '1.25', curDayChange: '1%', curWeekChange: '-2%', curDayVolume: '1234', curMarketCap: '4321'},
    //   { currencyName: 'eos', currencyPrice: '1.33', curDayChange: '-1.2%', curWeekChange: '3.5%', curDayVolume: '7890', curMarketCap: '6789'}
    // ]
    // this.setState({ tableData: testTableData })
  }

  // Convert date format
  getDateFormate(dateStr) {
    var date = new Date(dateStr)
    return date.toDateString()
  }

  // Convert float formate
  getPercentFormate(value) {
    return parseFloat(value).toFixed(2);
  }

  // Convert integer to pretty string
  getNumberWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

  render() {
    return (
      <div>
        <h2> UTU-Interview task </h2>
        {/*<p>
          API result: {this.state.testAPIres}
        </p>*/}

        <CSVReader
          noProgressBar
          ref={buttonRef}
          onFileLoad={this.handleOnFileLoad}
          onError={this.handleOnError}
          noClick
          noDrag
          onRemoveFile={this.handleOnRemoveFile}
        >
          {({ file }) => (
            <aside
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 10,
              }}
            >
              <Button
                variant="primary"
                onClick={this.handleOpenDialog}
              >
                Browse file
              </Button>
              <div
                style={{
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#ccc',
                  height: 35,
                  lineHeight: 2.5,
                  marginTop: 5,
                  marginBottom: 5,
                  paddingLeft: 13,
                  paddingTop: 3,
                  width: '30%',
                }}
              >
                {file && file.name}
              </div>
              <Button
                variant="danger"
                onClick={this.handleRemoveFile}
              >
                Remove
              </Button>
              <Button
                variant="success"
                onClick={this.handleinsertData}
              >
                Update
              </Button>
            </aside>
          )}
        </CSVReader>

        {this.state.show===false ? (<div></div>) : (
          <Alert variant='danger'>
            No CSV file selected!
          </Alert>
        )}

        <Dropdown onSelect={this.handleFilterChange}>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            Filter
          </Dropdown.Toggle>

          <Dropdown.Menu >
            <Dropdown.Item eventKey={0}>24 hours</Dropdown.Item>
            <Dropdown.Item eventKey={1}>7 days</Dropdown.Item>
            <Dropdown.Item eventKey={2}>30 days</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Table striped bordered hover size="sm" style={{ textAlign:"center"}}>
          <thead>
            <tr>
              <th>#</th>
              <th>Currency</th>
              <th>Date</th>
              <th>Price</th>
              <th>24h</th>
              <th>7d</th>
              <th>30d</th>
              <th>24h Volume</th>
              <th>MarketCap</th>
            </tr>
          </thead>
          <tbody>
            {this.state.tableData.length === 0 ? (
              <tr><td>No data fetched</td></tr>
            ) : (
              this.state.tableData.map((curData, index) => {
                return (
                  <tr key={index}>
                    <td>{index+1}</td>
                    <td>{curData.currencyType}</td>
                    <td>{this.getDateFormate(curData.date)}</td>
                    <td>{curData.price}</td>
                    <td style={parseFloat(curData.dayDif) > 0 ? { color:"green"} : { color:"red"}}>{parseFloat(curData.dayDif).toFixed(2)}%</td>
                    <td style={parseFloat(curData.weekDif) > 0 ? { color:"green"} : { color:"red"}}>{parseFloat(curData.weekDif).toFixed(2)}%</td>
                    <td style={parseFloat(curData.monthDif) > 0 ? { color:"green"} : { color:"red"}}>{parseFloat(curData.monthDif).toFixed(2)}%</td>
                    <td>${this.getNumberWithCommas(curData.volume)}</td>
                    <td>${this.getNumberWithCommas(curData.mktCap)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>

        {/*<Button variant="light" onClick={this.clickBtn}> Click me! </Button>*/}
      </div>
    );
  }
}

export default App;
