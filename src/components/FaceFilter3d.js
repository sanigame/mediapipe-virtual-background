import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { 
  FaceMesh,
} from "@mediapipe/face_mesh"
import { Camera } from "@mediapipe/camera_utils"

const smoothingFactor = (te, cutoff) => {
  const r = 2 * Math.PI * cutoff * te;
  return r / (r+1);
}

const exponentialSmoothing = (a, x, xPrev) => {
  return a * x + (1 - a) * xPrev;
}

class OneEuroFilter {
  constructor({minCutOff, beta}) {
    this.minCutOff = minCutOff;
    this.beta = beta;
    this.dCutOff = 0.001; // period in milliseconds, so default to 0.001 = 1Hz

    this.xPrev = null;
    this.dxPrev = null;
    this.tPrev = null;
    this.initialized = false;
  }

  reset() {
    this.initialized = false;
  }

  filter(t, x) {
    if (!this.initialized) {
      this.initialized = true;
      this.xPrev = x;
      this.dxPrev = x.map(() => 0);
      this.tPrev = t;
      return x;
    }

    const {xPrev, tPrev, dxPrev} = this;

    //console.log("filter", x, xPrev, x.map((xx, i) => x[i] - xPrev[i]));

    const te = t - tPrev;

    const ad = smoothingFactor(te, this.dCutOff);

    const dx = [];
    const dxHat = [];
    const xHat = [];
    for (let i = 0; i < x.length; i++) {
      // The filtered derivative of the signal.
      dx[i] = (x[i] - xPrev[i]) / te;
      dxHat[i] = exponentialSmoothing(ad, dx[i], dxPrev[i]);

      // The filtered signal
      const cutOff = this.minCutOff + this.beta * Math.abs(dxHat[i]);
      const a = smoothingFactor(te, cutOff);
      xHat[i] = exponentialSmoothing(a, x[i], xPrev[i]);
    }

    // update prev
    this.xPrev = xHat; 
    this.dxPrev = dxHat;
    this.tPrev = t;

    return xHat;
  }
}

class EffectRenderer {
  VIDEO_DEPTH = 500;
  FOV_DEGREES = 63;
  NEAR = 1;
  FAR = 10000;

  scene
  renderer
  faceGroup

  camera
  matrixX = [];
  filters;

  constructor() {
    this.scene = new THREE.Scene();
    this.filters = new OneEuroFilter({minCutOff: 0.001, beta: 1});

    const canvasElement = document.getElementsByClassName("output_canvas")[0];
     

    this.renderer = new THREE.WebGLRenderer({
       alpha: true,
            antialias: true,
            stencilBuffer: true,
            canvas: canvasElement,
            context: canvasElement.getContext('webgl2')
    });

    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = false;
    this.renderer.gammaFactor = 0;
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, 0, -1);
    this.scene.add(targetObject);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.castShadow = true;
    directionalLight.position.set(0, 0.25, 0);
    directionalLight.target = targetObject;
    this.scene.add(directionalLight);
    const bounceLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    this.scene.add(bounceLight);

    this.faceGroup = new THREE.Group();
    this.faceGroup.matrixAutoUpdate = false;
    this.scene.add(this.faceGroup);

    const loader = new GLTFLoader();
    loader.setPath(
      "https://s-allright-io.s3.eu-central-1.amazonaws.com/files/models/BearHead_OBJ/"
    );
    loader.load("bear2.gltf", (gltf) => {
      
      
      const scene = gltf.scene;
     scene.traverse((node) => {
          if (node.isMesh) {
            node.renderOrder = 3;
          }
        });
      gltf.scene.position.set(0, -2, 0);
      gltf.scene.scale.set(20, 20, 15);
      loader.setPath(
        "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.5/examples/face-tracking/assets/sparkar/"
      );
      loader.load("headOccluder.glb", (glt2f) => {
        console.log(glt2f);
        const scene2 = glt2f.scene;
        scene2.position.set(0, 0, 7);
        scene2.scale.set(1, 1.05, 1);
        const oc1 = scene2.children[0];

        // const oc1 = scene2.getObjectByName('canonical-face-model');

        glt2f.scene.traverse((node) => {
          if (node.isMesh) {
            node.renderOrder = 1;
            const mat = new THREE.MeshPhongMaterial();
            mat.color.set( 0x0000ff );
            mat.colorWrite = false;
            node.material = mat;
          }
        });
        
        
        this.faceGroup.add(gltf.scene);
        this.faceGroup.add(scene2);
      });
    });
  }

  async render(results) {
    this.onCanvasDimsUpdate();
    
    console.log()
const image = await createImageBitmap(results.image);
    const imagePlane = this.createGpuBufferPlane(results.image);
    this.scene.add(imagePlane);

    if (results.multiFaceGeometry.length > 0) {
      const faceGeometry = results.multiFaceGeometry[0];

      const poseTransformMatrixData = faceGeometry.getPoseTransformMatrix();
      this.faceGroup.matrix.fromArray(
        this.filters.filter(Date.now(), poseTransformMatrixData.getPackedDataList())
      );
      this.faceGroup.visible = true;
    } else {
      this.filters.reset();
      this.faceGroup.visible = false;
    }

    this.renderer.render(this.scene, this.camera);

    this.scene.remove(imagePlane);
  }

  createGpuBufferPlane(gpuBuffer) {
    const depth = this.VIDEO_DEPTH;
    const fov = this.camera.fov;
    const canvasElement = document.getElementsByClassName("output_canvas")[0];
    const width = canvasElement.width;
    const height = canvasElement.height;
    const aspect = width / height;

    const viewportHeightAtDepth =
      2 * depth * Math.tan(THREE.MathUtils.degToRad(0.5 * fov));
    const viewportWidthAtDepth = viewportHeightAtDepth * aspect;
    
    // console.log(viewportHeightAtDepth, viewportWidthAtDepth)

    const texture = new THREE.CanvasTexture(gpuBuffer);
    texture.minFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: texture })
    );

    plane.scale.set(viewportWidthAtDepth, viewportHeightAtDepth, 1);
    plane.position.set(0, 0, -depth);

    return plane;
  }

  onCanvasDimsUpdate() {
    const canvasElement = document.getElementsByClassName("output_canvas")[0];
    this.camera = new THREE.PerspectiveCamera(
      this.FOV_DEGREES,
      canvasElement.width / canvasElement.height,
      this.NEAR,
      this.FAR
    );

    this.renderer.setSize(canvasElement.width, canvasElement.height);
  }
}

const FaceFilter3d = () => {
  let webcamRef = useRef(null);
  
  const solutionOptions = {
    selfieMode: true,
    enableFaceGeometry: true,
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8
  };

  useEffect(() => {
    const effectRenderer = new EffectRenderer();
    console.log('effectRenderer', effectRenderer);
    

    function onResults(results) {
      // Render the effect.
      effectRenderer.render(results);
    }

    // const faceMesh = new mpFaceMesh.FaceMesh(config);
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })
    faceMesh.setOptions(solutionOptions);
    faceMesh.onResults(onResults);

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
  
    return () => {};
  }, []);
  
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
  <div>
    <div className="container">
    <video
        ref={webcamRef}
        id="video-source"
        autoPlay 
        style={{
          width: "100%",
          height: "100%",
        }}></video>
     <canvas className="output_canvas" width="640px" height="480px">
        </canvas>
    </div>
  </div>
  );
};

export default FaceFilter3d;
