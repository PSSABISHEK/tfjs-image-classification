import React, { Component } from "react";
import ImportData from "./ImportData";
import { Grid, Col, Row, Button } from "react-bootstrap";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import { connect } from "react-redux";
import imageNetData from "../image_net/imagenet_class_index.json";

import { infer_model } from "../tfjs-model/script";

class Main extends Component {
  classArray = [];
  samplesJSON = new Object();
  ctr = 0;
  classNArr = [];
  epochs = 25; //CHANGE EPOCHS VALUE HERE
  batchSize = 16; //CHANGE BATCHSIZE VALUE HERE
  learningRate = 0.001;
  className = null;

  constructor(props) {
    super(props);
    this.classArray.push(
      <ImportData
        pKeyId={this.ctr}
        sendDataToTrain={this.startLearning.bind(this)}
      />
    );
    this.state = {
      classNo: null,
    };
  }

  //Handles to add multiple ImportData Component
  handleAddClass = () => {
    this.ctr += 1;
    this.classArray.push(
      <ImportData
        pKeyId={this.ctr}
        sendDataToTrain={this.startLearning.bind(this)}
      />
    );
    this.setState({
      classNo: this.classArray,
    });
  };

  enableLearning = () => {
    this.props.globalTrainingStatus(true);
  };

  async startLearning(data) {
    let classIndex = await infer_model(data[0]);
    this.className = (
      <div>
        <h1>{imageNetData[classIndex]}</h1>
      </div>
    );
    this.setState({})
  }

  render() {
    return (
      <Grid>
        <Col xs={4} md={4} lg={4}>
          {this.classArray.map((classArray) => classArray)}
          <Row>
            <Col>
              <center>
                <Button onClick={this.enableLearning}>Predict</Button>
              </center>
            </Col>
          </Row>
        </Col>
        <Row>
          {this.className}
        </Row>
      </Grid>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    //changing store to stop training
    globalTrainingStatus: (sSignal) => {
      dispatch({
        type: "STOP_TRAINING",
        sSignal: sSignal,
      });
    },
  };
};

export default connect(null, mapDispatchToProps)(Main);
