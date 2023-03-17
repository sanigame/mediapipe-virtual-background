import React, { useState } from "react";

import Background from "./components/Background";
import FaceFilter from "./components/FaceFilter";
import FaceFilterDrawing from "./components/FaceFilterDrawing";
import ScreenBackground from "./components/ScreenBackground";
import FaceFilter3d from "./components/FaceFilter3d";


const App = () => {
  const [bgComponent, setBgComponent] = useState('Background');
  
  
  return (
    <>
      <button onClick={() => setBgComponent('Background')}>Background</button>
      <button onClick={() => setBgComponent('ScreenBackground')}>ScreenBackground</button>
      <button onClick={() => setBgComponent('FaceFilter')}>FaceFilter</button>
      <button onClick={() => setBgComponent('FaceFilterDrawing')}>FaceFilterDrawing</button> 
      <button onClick={() => setBgComponent('FaceFilter3d')}>FaceFilter3d</button> 
      <br />
      <br />
      {bgComponent === 'Background' ? <Background /> : null}
      {bgComponent === 'FaceFilter' ? <FaceFilter /> : null}
      {bgComponent === 'FaceFilterDrawing' ? <FaceFilterDrawing /> : null}
      {bgComponent === 'ScreenBackground' ? <ScreenBackground /> : null}
      {bgComponent === 'FaceFilter3d' ? <FaceFilter3d /> : null}
    </>
  );
}

export default App;
