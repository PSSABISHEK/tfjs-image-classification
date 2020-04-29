import React, { Component } from "react";
import ImportData from "./ImportData";
import { Grid, Col, Row, Button } from "react-bootstrap";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import { connect } from "react-redux";

import image_model from "../tfjs-model/script";

let trainingSession = null;

class Main extends Component {
  classArray = [];
  samplesJSON = new Object();
  ctr = 0;
  classNArr = [];
  epochs = 25; //CHANGE EPOCHS VALUE HERE
  batchSize = 16; //CHANGE BATCHSIZE VALUE HERE
  learningRate = 0.001;

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

  async startLearning(data, className) {
    if (this.classArray.length > 1) {
      if (data.length > 0) {
        if (this.classNArr.indexOf(className) < 0) {
          this.classNArr.push(className);
        }
        this.samplesJSON[className] = data;
      }
      if (this.classNArr.length === this.classArray.length) {
        this.props.globalTrainingStatus(false);
        console.log("TRAINING STARTED");

        if (trainingSession) {
          trainingSession.dispose_all();
          trainingSession = null;
        }
        trainingSession = new image_model();
        await trainingSession.train_model(
          this.samplesJSON,
          this.classNArr,
          this.epochs,
          this.batchSize,
          this.learningRate
        );
        console.log("MODEL TRAINED");
        this.samplesJSON = new Object();
        this.classNArr = [];
        this.classRecdToTrain = 0;
      }
    } else {
      alert("Atleast 2 class must exist to train");
    }
  }

  render() {
    return (
      <Grid>
        <Col xs={4} md={4} lg={4}>
          {this.classArray.map((classArray) => classArray)}
          <Row>
            <Fab size="small" color="secondary" aria-label="add">
              <AddIcon onClick={this.handleAddClass} />
            </Fab>
          </Row>
          <Row>
            <Col>
              <center>
                <Button onClick={this.enableLearning}>Start Learning</Button>
              </center>
            </Col>
          </Row>
        </Col>
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
