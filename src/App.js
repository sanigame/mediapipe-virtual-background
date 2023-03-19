import React, { useState } from 'react'
import './App.css'

import Background from './components/Background'
import FaceFilter from './components/FaceFilter'
import FaceFilterAr from './components/FaceFilterAr'
import FaceFilterDrawing from './components/FaceFilterDrawing'
import ScreenBackground from './components/ScreenBackground'

function App() {
  const [bgComponent, setBgComponent] = useState('FaceFilterAr')

  return (
    <div className="App">
      <button onClick={() => setBgComponent('Background')}>Background</button>
      <button onClick={() => setBgComponent('ScreenBackground')}>ScreenBackground</button>
      <button onClick={() => setBgComponent('FaceFilter')}>FaceFilter</button>
      <button onClick={() => setBgComponent('FaceFilterDrawing')}>FaceFilterDrawing</button>
      <button onClick={() => setBgComponent('FaceFilterAr')}>FaceFilterAr</button>

      {/* <FaceFilterAr /> */}
      {bgComponent === 'Background' ? <Background /> : null}
      {bgComponent === 'FaceFilter' ? <FaceFilter /> : null}
      {bgComponent === 'FaceFilterDrawing' ? <FaceFilterDrawing /> : null}
      {bgComponent === 'ScreenBackground' ? <ScreenBackground /> : null}
      {bgComponent === 'FaceFilterAr' ? <FaceFilterAr /> : null}
    </div>
  )
}

export default App
