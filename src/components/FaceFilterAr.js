import React, { useEffect, useRef } from "react";
import {MindARThree} from 'mind-ar/dist/mindar-face-three.prod.js';
import * as THREE from 'three';

const FaceFilterAr = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const mindarThree = new MindARThree({
      container: containerRef.current,
    });

    const { renderer, scene, camera } = mindarThree;
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);
    const faceMesh = mindarThree.addFaceMesh();
    const texture = new THREE.TextureLoader().load(
      "/filter/face-mask.png"
    );
    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;
    scene.add(faceMesh);

    mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {}
  }, []);

  return (
    <>
      <p>upload</p>
      <div className="container">
        <div style={{width: "100%", height: "100%"}} ref={containerRef}></div>
      </div>
    </>
  );
};

export default FaceFilterAr;
