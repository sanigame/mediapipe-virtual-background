import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import * as cam from "@mediapipe/camera_utils";
import * as StackBlur from "stackblur-canvas";

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageURL, setImageURL] = useState('');
  const [vbSelected, setvbSelected] = useState('');
  
  const virtualBgRef = useRef(vbSelected);

  

  const onResults = async (results) => {
    const img = document.getElementById('vbackground')
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if(virtualBgRef.current !== '') {
      // Only overwrite existing pixels.
      canvasCtx.globalCompositeOperation = 'destination-atop';
      canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

      if(virtualBgRef.current === 'blur') {
        canvasCtx.globalCompositeOperation = 'destination-atop';
        StackBlur.canvasRGB(canvasElement,0,0,canvasElement.width,canvasElement.height,15);
        // canvasCtx.filter = 'blur(15px)'
        canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
      } else {
        // Only overwrite missing pixels.
        canvasCtx.globalCompositeOperation = 'destination-over';
        canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
      }
    
    }

    
    
    canvasCtx.restore();
  }
  

  useEffect(() => {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
    });

    selfieSegmentation.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await selfieSegmentation.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720
      });

      camera.start();
    }
  }, []);

  useEffect(() => {
    virtualBgRef.current = vbSelected
    return () => {};
  }, [vbSelected]);
  

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        handleChangeBG('image', reader.result)
      }
    }
    reader.readAsDataURL(e.target.files[0])
  }

  const handleChangeBG = (type, file = "") => {
    switch (type) {
      case "blur":
        setvbSelected("blur")
        break;
      case "image":
        setvbSelected("image");
        setImageURL(file);
        break;
      default:
        setvbSelected('');
        break;
    }
  } 

  return (
    <>
      <div className="container">
        <div className="videoContainer">
          <div className="videoContent">
            <div className="video">
              <Webcam
                ref={webcamRef}
                style={{
                  display: "none",
                  width: "100%",
                  height: "100%",
                  transform: "scaleX(-1)"
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "100%",
                  transform: "scaleX(-1)",
                }}
              ></canvas>
            </div>
          </div>
        </div>

        <div className="backgroundContainer">
          <div className="backgrounds" style={{display:'none'}}>
            <img id="vbackground" src={imageURL} alt="The Screan" className="background" />
          </div>
          <button onClick={() => handleChangeBG('')}>Clear</button>
          <button onClick={() => handleChangeBG('blur')}>Blur</button>
          <button onClick={() => handleChangeBG('image','/bg/Picture_office_1.jpg')}>BG1</button>
          <button onClick={() => handleChangeBG('image','/bg/Picture_office_2.jpg')}>BG2</button>
          <button onClick={() => handleChangeBG('image','/bg/Picture_office_3.jpg')}>BG3</button>
          <button onClick={() => handleChangeBG('image','/bg/Picture_office_4.jpg')}>BG3</button>
          <label htmlFor="contained-button-file" className="file-upload">
            <input accept="image/*" id="contained-button-file" multiple type="file" onChange={imageHandler} />
            Choose Background
          </label>
        </div>
      </div>
    </>
  );
}

export default App;
