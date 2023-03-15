import React, { useRef, useEffect } from "react";
import { 
  FaceMesh,
  FACEMESH_TESSELATION,
  FACEMESH_RIGHT_EYE,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYEBROW,
  FACEMESH_LEFT_EYEBROW,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_LEFT_IRIS,
} from "@mediapipe/face_mesh"
import { Camera } from "@mediapipe/camera_utils"
import { drawConnectors } from "@mediapipe/drawing_utils"

const solutionOptions = {
  selfieMode: true,
  enableFaceGeometry: false,
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
};

const FaceFilterDrawing = () => {
  let webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null)

  const faceDrawing = (results) => {
    const videoWidth = webcamRef.current.videoWidth
    const videoHeight = webcamRef.current.videoHeight

    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight
    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext("2d")
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
      
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_TESSELATION,
              {color: '#C0C0C070', lineWidth: 1});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_RIGHT_EYE,
              {color: '#FF3030'});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW,
              {color: '#FF3030'});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_LEFT_EYE,
              {color: '#30FF30'});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW,
              {color: '#30FF30'});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_FACE_OVAL,
              {color: '#E0E0E0'});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
              if (solutionOptions.refineLandmarks) {
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_RIGHT_IRIS,
              {color: '#FF3030'});
          drawConnectors(
              canvasCtx, landmarks, FACEMESH_LEFT_IRIS,
              {color: '#30FF30'});
          }
        }
      }
      canvasCtx.restore();
  }

  const onResults = (results) => {
    faceDrawing(results)
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })
    faceMeshRef.current = faceMesh

    faceMesh.setOptions({
      enableFaceGeometry: false,
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults(onResults)

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new Camera(webcamRef.current, {
        onFrame: async () => {
          webcamRef.current &&
            (await faceMesh.send({ image: webcamRef.current }))
        },
        width: 1280,
        height: 720
      })
      camera.start()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        document.getElementById('video-source').srcObject = stream
      })
      .catch((err) => {
        alert(`Following error occured: ${err}`);
      });

    return () => {};
  }, []);

  return (
    <>
      <video
        ref={webcamRef}
        id="video-source"
        autoPlay 
        style={{
          width: "100%",
          height: "100%",
        }}></video>
      <canvas 
        ref={canvasRef}  style={{
          width: "100%",
          height: "100%",
        }}></canvas>
    </>
  );
};

export default FaceFilterDrawing;
