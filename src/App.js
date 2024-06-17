import React from 'react';
import './App.css';
import NaverMap from './NaverMap/NaverMap';
import HikingRecord from './HikingRecord/HikingRecord';
import HikingAlert from './HikingRecord/HikingAlert';
import Footer from './HikingRecord/Footer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Router, Route, Routes

function App() {
  const userNo = 21;
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HikingRecord userNo={userNo} />} />
          <Route path="/hiking-alert" element={<HikingAlert userNo={userNo} />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
