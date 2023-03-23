import React, { useRef, useState } from 'react'

import * as THREE from 'three'

import { VroomARThree } from '../libs/face-target/three'

const FaceFilterAr = () => {
  const containerRef = useRef(null)
  const vroomThreeRef = useRef({ current: null })
  const rendererRef = useRef({ current: null })

  const [imageURL, setImageURL] = useState('/filter/canonical_face_model_uv_visualization.png')
  const [isStart, setIsStart] = useState(false)

  const init = (filterImg) => {
    setIsStart(true)
    const vroomArThree = new VroomARThree({
      container: containerRef.current,
    })
    vroomThreeRef.current = vroomArThree

    const { renderer, scene, camera } = vroomArThree
    rendererRef.current = renderer

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
    scene.add(light)
    const faceMesh = vroomArThree.addFaceMesh()
    const texture = new THREE.TextureLoader().load(filterImg)
    faceMesh.material.map = texture
    faceMesh.material.transparent = true
    faceMesh.material.needsUpdate = true
    scene.add(faceMesh)

    vroomArThree.start()
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera)
    })
  }

  const imageHandler = (e) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImageURL(reader.result)
      }
    }
    reader.readAsDataURL(e.target.files[0])
  }

  const startAr = () => {
    setIsStart(true)
    setTimeout(() => {
      init(imageURL)
    }, 1000)
  }

  const stopAr = () => {
    setIsStart(false)
    vroomThreeRef.current.stop()
    vroomThreeRef.current.renderer.setAnimationLoop(null)
  }

  return (
    <>
      <div>
        <button onClick={() => startAr(imageURL)}>start</button>
        <button onClick={() => stopAr()}>stop</button>
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
        <div className="backgrounds" style={{ display: 'none' }}>
          <img id="vbackground" src={imageURL} alt="The Screan" className="background" />
        </div>
      </div>

      <div className="container">
        {isStart ? <div style={{ width: '100%', height: '100%' }} ref={containerRef}></div> : null}
      </div>
    </>
  )
}

export default FaceFilterAr
