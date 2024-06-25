import React, { useEffect, useState } from 'react';
import './App.css';
import NaverMap from './NaverMap/NaverMap';
import HikingRecord from './HikingRecord/HikingRecord';
import HikingAlert from './HikingRecord/HikingAlert';
import Footer from './HikingRecord/Footer';
import Top from './HikingRecord/Top';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Cookies from 'js-cookie';

function App() {
  const [userNo, setUserNo] = useState(null);

  useEffect(() => {
    const userNoFromCookie = Cookies.get('userNo');
    setUserNo(userNoFromCookie);
  }, []);

  console.log(userNo);

  if (userNo === null) {
    return <div>Loading...</div>; // 로딩 상태 표시
  }

  return (
    <Router>
      <div className="App">
        <Top />
        <div className="content">
          <Routes>
            <Route path="/hikingguide" element={<NaverMap userNo={userNo} />} />
            <Route path="/hikingguide/hiking-alert" element={<HikingAlert userNo={userNo} />} />
            <Route path="/hikingguide/hikingRecord" element={<HikingRecord userNo={userNo} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
