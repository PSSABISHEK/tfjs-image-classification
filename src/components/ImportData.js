import React, { Component } from "react";
import { Grid, Col, Row } from "react-bootstrap";
import FileDropZone from "./fileDropZone";

import { connect } from "react-redux";

class ImportData extends Component {
  previewCanvasArr = [];
  trainingCanvasArr = [];
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: [],
      className: "Class " + this.props.pKeyId,
    };
  }

  getFromChild = (previewCanvas, trainingCanvas) => {
    this.previewCanvasArr.push(previewCanvas);
    this.trainingCanvasArr.push(trainingCanvas);
    this.setState({});
  };

  render() {
    if (this.props.convertSignal)
      this.props.sendDataToTrain(this.trainingCanvasArr);

    this.previewList = document.getElementById("picArray" + this.props.pKeyId);
    return (
      <Grid>
        <div>
          <Row>
            <Col xs={12} md={12} lg={12}>
              <center>
                <FileDropZone dndCall={this.getFromChild} />
              </center>
            </Col>
          </Row>
          <Row>
            <Col xs={10}>
              <ul
                id={"picArray" + this.props.pKeyId}
                style={{
                  marginTop: "12.5px",
                  display: "flex",
                  flexDirection: "row",
                  listStyle: "none",
                }}
              >
                {(this.previewCanvasArr || []).map((canvas, index) => {
                  let listItem = document.createElement("li");
                  listItem.style.listStyle = "none";
                  listItem.appendChild(canvas);
                  this.previewList.appendChild(listItem);
                })}
              </ul>
            </Col>
          </Row>
        </div>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    convertSignal: state.convertSignal,
  };
};

export default connect(mapStateToProps, null)(ImportData);
