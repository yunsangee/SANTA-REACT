import React from 'react';
import './App.css';
import NaverMap from './NaverMap/NaverMap';
import HikingRecord from './HikingRecord/HikingRecord';
import HikingAlert from './HikingRecord/HikingAlert';
import Footer from './HikingRecord/Footer';
import Top from './HikingRecord/Top';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const userNo = 21;
  return (
    <Router>
      <div className="App">
        <Top />
        <div className="content">
          <Routes>
            <Route path="/hikingguide" element={<NaverMap userNo={userNo} />} />
            <Route path="/hikingguide/hiking-alert" element={<HikingAlert userNo={userNo} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
