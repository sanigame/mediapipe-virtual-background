/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useState } from 'react'

import * as cam from '@mediapipe/camera_utils'
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'

const ScreenBackground = () => {
  let webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const foregroundCanvasRef = useRef(null)
  const videoStreamRef = useRef(null)
  const [isShareScreen, setIsShareScreen] = useState(false)
  const [isPresenter, setIsPresenter] = useState(true)
  const [presentOffset, setPresentOffset] = useState(0)

  const isSharescreenRef = useRef(null)
  const isPresenterRef = useRef(null)
  const presentOffsetRef = useRef(0)

  const onResults = async (results) => {
    const screenSource = document.getElementById('screen-source')
    const videoWidth = webcamRef.current.videoWidth
    const videoHeight = webcamRef.current.videoHeight

    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight

    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext('2d')

    const foregroundCanvasElement = foregroundCanvasRef.current
    const foregroundCanvasCtx = foregroundCanvasElement.getContext('2d')

    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

    if (isSharescreenRef.current) {
      if (isPresenterRef.current) {
        foregroundCanvasCtx.save()
        foregroundCanvasCtx.clearRect(
          0,
          0,
          foregroundCanvasElement.width,
          foregroundCanvasElement.height,
        )
        foregroundCanvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          foregroundCanvasElement.width,
          foregroundCanvasElement.height,
        )
        foregroundCanvasCtx.globalCompositeOperation = 'source-in'
        foregroundCanvasCtx.drawImage(
          results.image,
          0,
          0,
          foregroundCanvasElement.width,
          foregroundCanvasElement.height,
        )

        foregroundCanvasCtx.restore()

        canvasCtx.drawImage(screenSource, 0, 0, canvasElement.width, canvasElement.height)
        canvasCtx.drawImage(
          foregroundCanvasElement,
          canvasElement.width * 0.5 - presentOffsetRef.current,
          canvasElement.height * 0.5,
          canvasElement.width * 0.5,
          canvasElement.height * 0.5,
        )
      } else {
        canvasCtx.globalCompositeOperation = 'destination-atop'
        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          canvasElement.width,
          canvasElement.height,
        )

        canvasCtx.globalCompositeOperation = 'destination-over'
        canvasCtx.drawImage(screenSource, 0, 0, canvasElement.width, canvasElement.height)
      }
    }

    canvasCtx.restore()
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
    isSharescreenRef.current = isShareScreen
    return () => {}
  }, [isShareScreen])

  useEffect(() => {
    isPresenterRef.current = isPresenter
    return () => {}
  }, [isPresenter])

  useEffect(() => {
    presentOffsetRef.current = presentOffset
    return () => {}
  }, [presentOffset])

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

  const handleShareScreen = () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: true })
      .then((stream) => {
        document.getElementById('screen-source').srcObject = stream
        setIsShareScreen(true)
      })
      .catch((err) => {
        alert(`Following error occured: ${err}`)
        setIsShareScreen(false)
      })
  }

  return (
    <>
      <div>
        <div className="videoContainer">
          <div className="videoContent">
            <button onClick={() => handleShareScreen()}>Sharescreen</button>
            <button onClick={() => setIsPresenter(true)}>Presenter</button>
            <button onClick={() => setIsPresenter(false)}>Screen Background</button>
            <div>
              <span id="presenterOffsetContainer">
                Offset:
                <input
                  type="range"
                  id="offset"
                  name="offset"
                  min="-500"
                  max="500"
                  value={presentOffset}
                  onChange={(e) => setPresentOffset(e.target.value)}
                />
              </span>
            </div>
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
              <video
                id="screen-source"
                autoPlay
                style={{
                  display: 'none',
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
              <canvas
                ref={foregroundCanvasRef}
                style={{
                  display: 'none',
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

export default ScreenBackground
