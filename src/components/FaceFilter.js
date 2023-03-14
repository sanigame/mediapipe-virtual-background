import React, { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh"
import { Camera } from "@mediapipe/camera_utils"

const FaceFilter = () => {
  let webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null)
  const filterImgRef = useRef({ current: null })

  function onResults(results) {
    const videoWidth = webcamRef.current.videoWidth
    const videoHeight = webcamRef.current.videoHeight

    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight
    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext("2d")
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    )
    
    if (results.multiFaceLandmarks.length > 0) {
      const keypoints = results.multiFaceLandmarks[0]

      const maskWidth = Math.abs(
        keypoints[234].x * videoWidth - keypoints[454].x * videoWidth
      )
      const maskHeight =
        Math.abs(
          keypoints[234].y * videoHeight - keypoints[152].y * videoHeight
        ) + 10
      filterImgRef.current.width = `${maskWidth}`
      filterImgRef.current.height = `${maskHeight}`

      canvasCtx.drawImage(
        filterImgRef.current,
        keypoints[234].x * videoWidth,
        keypoints[234].y * videoHeight - 10,
        maskWidth,
        maskHeight
      )
    }
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })
    faceMeshRef.current = faceMesh

    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults(onResults)

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const maskFilterImage = document.createElement("img", {
        ref: filterImgRef,
      })
      maskFilterImage.objectFit = "contain"
      maskFilterImage.onload = function () {
        filterImgRef.current = maskFilterImage
        webcamRef.current.crossOrigin = "anonymous"

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
      maskFilterImage.src = "filter/mask.png"
    }
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

export default FaceFilter;
