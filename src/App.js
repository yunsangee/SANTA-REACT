import React from 'react';
import './App.css';
import NaverMap from './NaverMap/NaverMap'; 
import HikingRecord from './HikingRecord/HikingRecord';
import HikingAlert from './HikingRecord/HikingAlert';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router, Route, Routes

function App() {
  const userNo = 21;
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<NaverMap />} />
          <Route path="/hiking-alert" element={<HikingAlert userNo={userNo} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
