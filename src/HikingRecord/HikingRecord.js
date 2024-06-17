import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure you have Bootstrap CSS imported
import '../App.css'; // 추가한 CSS 파일을 임포트
import '../css/style.css'; // 추가한 CSS 파일을 임포트
import Top from './Top'; // Top 컴포넌트를 임포트

const HikingListRecord = ({ userNo }) => {
  const [hikingList, setHikingList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const NikcName = "아기킹콩"; // NickName을 여기서 정의

  useEffect(() => {
    userNo = 1;
    axios.post(`http://localhost:8001/hikingGuide/react/getHikingListRecord/${userNo}`)
      .then(response => {
        console.log(response.data); // 서버로부터 받은 데이터를 콘솔에 출력
        setHikingList(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [userNo]);

  const getSkyCondition = (code) => {
    const skyConditionCode = parseInt(code, 10);
    switch (skyConditionCode) {
      case 1:
        return '맑음';
      case 3:
        return '구름많음';
      case 4:
        return '흐림';
      default:
        return '알 수 없음';
    }
  };

  const getTrailDifficulty = (difficulty) => {
    switch (parseInt(difficulty, 10)) {
      case 2:
        return '쉬움';
      case 1:
        return '보통';
      case 0:
        return '어려움';
      default:
        return '알 수 없음';
    }
  };

  const handleSelect = (hrNo) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(hrNo)
        ? prevSelected.filter(item => item !== hrNo)
        : [...prevSelected, hrNo]
    );
  };

  const handleDeleteSelected = () => {
    axios.post('http://localhost:8001/hikingGuide/react/deleteHikingRecord', selectedItems)
      .then(() => {
        setHikingList(hikingList.filter(record => !selectedItems.includes(record.hrNo)));
        setSelectedItems([]);
      })
      .catch(error => console.error('Error deleting records:', error));
  };

  return (
    <div>
      <Top />
      <div className="container-fluid page-header py-5" style={{ backgroundImage: 'url(/images/header-background.png)', backgroundSize: 'cover' }}>
        <h1 className="text-center text-white display-6">{NikcName}의 등산 기록</h1>
        <ol className="breadcrumb justify-content-center mb-0">
        </ol>
      </div>
      <div className="container-fluid py-5">
        <div className="container py-5">
     
          {hikingList.length === 0 ? (
            <p>등산 기록이 없습니다</p>
          ) : (
            <>
              <div className="d-flex justify-content-end mb-3">
                <button 
                  className="btn btn-danger"
                  onClick={handleDeleteSelected}
                  disabled={selectedItems.length === 0}
                >
                  삭제하기
                </button>
              </div>
              <div className="row">
                {hikingList.map(record => (
                  <div 
                    className={`col-md-6 col-lg-4 mb-4`} 
                    key={record.hrNo} 
                    onClick={() => handleSelect(record.hrNo)}
                  >
                    <div className={`card h-100 fruite-item ${selectedItems.includes(record.hrNo) ? 'border-primary' : ''}`}>
                      <div className="card-body light-green-border position-relative">
                        <div className="hiking-date">{record.hikingDate}</div>
                        <h3 className="mountain-name">{record.mountain?.mountainName}</h3>
                        <hr className="mountain-name-divider" />
                        <p className="card-text"><strong>날씨 조건:</strong> {getSkyCondition(record.weather?.skyCondition)}</p>
                        <p className="card-text"><strong>총 소요시간:</strong> {record.totalTime}</p>
                        <p className="card-text"><strong>등산 이동 거리:</strong> {record.userDistance}</p>
                        <p className="card-text"><strong>등산 시간:</strong> {record.ascentTime}</p>
                        <p className="card-text"><strong>하산 시간:</strong> {record.descentTime}</p>
                        <p className="card-text"><strong>선택한 등산 난이도:</strong> {getTrailDifficulty(record.hikingDifficulty)}</p>
                        <div className="form-check">
                          <input 
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedItems.includes(record.hrNo)}
                            onChange={(e) => { e.stopPropagation(); handleSelect(record.hrNo); }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HikingListRecord;
