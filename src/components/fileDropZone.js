import React, { Component } from "react";
import imgtobase from "image-to-base64";
import Dropzone from "react-dropzone";

class FileDropZone extends Component {
  onDrop = (files) => {
    let url
    files.map( async (src) => {
      if (src["type"] === "image/jpeg" || src["type"] === "image/png") {
        url = URL.createObjectURL(src);
        if(this.props.inf) {
          let imgSrc
          await imgtobase(url).then(response => {
            imgSrc = "data:image/png;base64," + response;
          })
          this.props.dndCall(imgSrc);
        } else {
          let previewCanvas = document.createElement("canvas");
          let previewCtx = previewCanvas.getContext("2d");
          previewCanvas.width = 50;
          previewCanvas.height = 50;
          previewCanvas.style.objectFit = "cover";
          previewCanvas.style.marginRight = "7px";
          previewCanvas.style.borderRadius = "4px";
          // load image from data url
          let imageObj = new Image();
          imageObj.onload = function () {
            previewCtx.drawImage(this, 0, 0, 50, 50);
          };
          imageObj.src = url;
          
          let trainingCanvas = document.createElement("canvas");
          let trainingCtx = trainingCanvas.getContext("2d");
          trainingCanvas.width = 224;
          trainingCanvas.height = 224;
          trainingCanvas.style.objectFit = "cover";
          // load image from data url
          let imageObj1 = new Image();
          imageObj1.onload = function () {
            trainingCtx.drawImage(this, 0, 0, 224, 224);
          };
          imageObj1.src = url;
          this.props.dndCall(previewCanvas, trainingCanvas);
        }

      }
    });
  };

  render() {    
    return (
      <Dropzone onDrop={this.onDrop}>
        {({ getRootProps, getInputProps }) => (
          <div style={{ position: "relative" }}>
            <div
              {...getRootProps()}
              style={{
                marginTop: "30px",
                marginLeft: "30px",
                marginRight: "25px",
                borderStyle: "dashed",
                borderWidth: "1px",
                height: "172px",
                width: '312px',
                padding: "50px",
                color: " #475A82",
              }}
            >
              <input {...getInputProps()} />
              <center>
                <p
                  style={{
                    fontFamily: "Helvetica",
                    fontSize: "12px",
                    color: " #475A82",
                    marginBottom: "10px",
                  }}
                >
                  Upload or drag and drop your files here
                </p>
              </center>
            </div>
          </div>
        )}
      </Dropzone>
    );
  }
}

export default FileDropZone;
