import React, { useState } from "react";

import Background from "./components/Background";
import FaceFilterDrawing from "./components/FaceFilterDrawing";


const App = () => {
  const [isBgMode, setIsBgMode] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsBgMode(!isBgMode)}>
        {isBgMode ? "Face Filter" : "Background"}
      </button>
      <br />
      <br />
     {isBgMode ? <Background /> : <FaceFilterDrawing />}
    </>
  );
}

export default App;
