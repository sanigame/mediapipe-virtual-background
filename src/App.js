import React, { useState } from "react";

import Background from "./components/Background";
import FaceFilter from "./components/FaceFilter";
import FaceFilterDrawing from "./components/FaceFilterDrawing";


const App = () => {
  const [bgComponent, setBgComponent] = useState('Background');
  
  
  return (
    <>
      <button onClick={() => setBgComponent('Background')}>Background</button>
      <button onClick={() => setBgComponent('FaceFilter')}>FaceFilter</button>
      <button onClick={() => setBgComponent('FaceFilterDrawing')}>FaceFilterDrawing</button>
      <br />
      <br />
      {bgComponent === 'Background' ? <Background /> : null}
      {bgComponent === 'FaceFilter' ? <FaceFilter /> : null}
      {bgComponent === 'FaceFilterDrawing' ? <FaceFilterDrawing /> : null}
    </>
  );
}

export default App;
