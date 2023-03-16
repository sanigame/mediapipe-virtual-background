import React, { useState } from "react";

import Background from "./components/Background";
import FaceFilter from "./components/FaceFilter";
import FaceFilterDrawing from "./components/FaceFilterDrawing";
import ScreenBackground from "./components/ScreenBackground";


const App = () => {
  const [bgComponent, setBgComponent] = useState('ScreenBackground');
  
  
  return (
    <>
      <button onClick={() => setBgComponent('Background')}>Background</button>
      <button onClick={() => setBgComponent('ScreenBackground')}>ScreenBackground</button>
      <button onClick={() => setBgComponent('FaceFilter')}>FaceFilter</button>
      <button onClick={() => setBgComponent('FaceFilterDrawing')}>FaceFilterDrawing</button> 
      <br />
      <br />
      {bgComponent === 'Background' ? <Background /> : null}
      {bgComponent === 'FaceFilter' ? <FaceFilter /> : null}
      {bgComponent === 'FaceFilterDrawing' ? <FaceFilterDrawing /> : null}
      {bgComponent === 'ScreenBackground' ? <ScreenBackground /> : null}
    </>
  );
}

export default App;
