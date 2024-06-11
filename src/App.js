import React from 'react';
import './App.css';
import NaverMap from './NaverMap/NaverMap'; 
import HikingRecord from './HikingRecord/HikingRecord';
import HikingAlert from './HikingRecord/HikingAlert';

function App() {
  const userNo=1;
  return (
    <div className="App">
      <NaverMap />
      {/* <HikingRecord/>
      <HikingAlert userNo={userNo}/> */}
    </div>
  );
}

export default App;
