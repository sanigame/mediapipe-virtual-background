import React, { useEffect, useRef, useState } from "react";
import { MindARThree } from "mind-ar/dist/mindar-face-three.prod.js";
import * as THREE from "three";

const FaceFilterAr = () => {
  const containerRef = useRef(null);
  const [imageURL, setImageURL] = useState(
    "/filter/canonical_face_model_uv_visualization.png"
  );

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImageURL(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  useEffect(() => {
    const mindarThree = new MindARThree({
      container: containerRef.current,
    });

    const { renderer, scene, camera } = mindarThree;
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
    const faceMesh = mindarThree.addFaceMesh();
    const texture = new THREE.TextureLoader().load(imageURL);
    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;
    scene.add(faceMesh);

    mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      mindarThree.stop();
    };
  }, []);

  return (
    <>
      <div>
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
        <div className="backgrounds" style={{ display: "none" }}>
          <img
            id="vbackground"
            src={imageURL}
            alt="The Screan"
            className="background"
          />
        </div>
      </div>

      <div className="container">
        <div style={{ width: "100%", height: "100%" }} ref={containerRef}></div>
      </div>
    </>
  );
};

export default FaceFilterAr;
