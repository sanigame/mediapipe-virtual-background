import React, { useState } from "react";

import Background from "./components/Background";
import FaceFilter from "./components/FaceFilter";


const App = () => {
  const [isBgMode, setIsBgMode] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsBgMode(!isBgMode)}>
        {isBgMode ? "Face Filter" : "Background"}
      </button>
      <br />
      <br />
     {isBgMode ? <Background /> : <FaceFilter />}
    </>
  );
}

export default App;
