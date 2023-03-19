/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useState } from 'react'

import * as cam from '@mediapipe/camera_utils'
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'
import * as StackBlur from 'stackblur-canvas'

const Background = () => {
  let webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const videoStreamRef = useRef(null)
  const [imageURL, setImageURL] = useState('')
  const [vbSelected, setvbSelected] = useState('')
  const virtualBgRef = useRef(vbSelected)

  const onResults = async (results) => {
    const img = document.getElementById('vbackground')
    const videoWidth = webcamRef.current.videoWidth
    const videoHeight = webcamRef.current.videoHeight

    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight

    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext('2d')

    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

    if (virtualBgRef.current !== '') {
      // Only overwrite existing pixels.
      // canvasCtx.globalCompositeOperation = 'destination-atop';
      // canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

      if (virtualBgRef.current === 'blur') {
        // Blur background
        canvasCtx.globalCompositeOperation = 'copy'
        // canvasCtx.filter = `blur(3px)`;
        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          canvasElement.width,
          canvasElement.height,
        )

        canvasCtx.globalCompositeOperation = 'source-out'
        canvasCtx.filter = 'none'
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

        canvasCtx.globalCompositeOperation = 'destination-over'
        StackBlur.canvasRGB(canvasElement, 0, 0, canvasElement.width, canvasElement.height, 15)
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)
      } else {
        // Image background
        canvasCtx.globalCompositeOperation = 'destination-atop'
        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          canvasElement.width,
          canvasElement.height,
        )

        canvasCtx.globalCompositeOperation = 'destination-over'
        canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height)
      }
    }

    canvasCtx.restore()
  }

  const imageHandler = (e) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.readyState === 2) {
        handleChangeBG('image', reader.result)
      }
    }
    reader.readAsDataURL(e.target.files[0])
  }

  const handleChangeBG = (type, file = '') => {
    switch (type) {
      case 'blur':
        setvbSelected('blur')
        break
      case 'image':
        setvbSelected('image')
        setImageURL(file)
        break
      default:
        setvbSelected('')
        break
    }
  }

  useEffect(() => {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      },
    })

    selfieSegmentation.setOptions({
      modelSelection: 1,
    })

    selfieSegmentation.onResults(onResults)

    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null) {
      const camera = new cam.Camera(webcamRef.current, {
        onFrame: async () => {
          await selfieSegmentation.send({ image: webcamRef.current })
        },
        width: 1280,
        height: 720,
      })

      camera.start()
    }
    return () => {}
  }, [])

  useEffect(() => {
    virtualBgRef.current = vbSelected
    return () => {}
  }, [vbSelected])

  useEffect(() => {
    if (canvasRef.current) {
      const stream = canvasRef.current.captureStream(25)
      videoStreamRef.current.srcObject = stream
    }
    return () => {}
  }, [canvasRef])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        document.getElementById('video-source').srcObject = stream
      })
      .catch((err) => {
        alert(`Following error occured: ${err}`)
      })

    return () => {}
  }, [])

  return (
    <>
      <div className="container">
        <div className="videoContainer">
          <div className="backgroundContainer">
            <div className="backgrounds" style={{ display: 'none' }}>
              <img id="vbackground" src={imageURL} alt="The Screan" className="background" />
            </div>
            <button onClick={() => handleChangeBG('')}>Clear</button>
            <button onClick={() => handleChangeBG('blur')}>Blur</button>
            <button onClick={() => handleChangeBG('image', '/bg/Picture_office_1.jpg')}>BG1</button>
            <button onClick={() => handleChangeBG('image', '/bg/Picture_office_2.jpg')}>BG2</button>
            <button onClick={() => handleChangeBG('image', '/bg/Picture_office_3.jpg')}>BG3</button>
            <button onClick={() => handleChangeBG('image', '/bg/Picture_office_4.jpg')}>BG4</button>
            <label htmlFor="contained-button-file" className="file-upload">
              <input
                accept="image/*"
                id="contained-button-file"
                multiple
                type="file"
                onChange={imageHandler}
              />
              Choose Background
            </label>
          </div>
          <div className="videoContent">
            <p>Local video</p>
            <div className="video">
              <video
                ref={webcamRef}
                id="video-source"
                autoPlay
                style={{
                  width: '100%',
                  height: '100%',
                }}></video>
              <p>Canvas video</p>
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                }}></canvas>
            </div>
          </div>
        </div>
        <div>
          <p>Stream video</p>
          <video
            ref={videoStreamRef}
            id="video-stream"
            autoPlay
            style={{
              width: '100%',
              height: '100%',
            }}></video>
        </div>
      </div>
    </>
  )
}

export default Background
