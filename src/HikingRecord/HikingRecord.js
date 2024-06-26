import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from 'js-cookie';

const styles = {
  pageHeader: {
    height: '250px',
    position: 'relative',
    marginTop: '190px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundBlur: (imageUrl) => ({
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(5px)',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }),
  pageTitle: {
    position: 'relative',
    zIndex: 1,
    fontSize: '35pt',
    fontWeight: 'bolder',
    color: 'white',
  },
  card: {
    height: '100%',
    border: '1px solid lightgreen',
    position: 'relative',
    cursor: 'pointer',
  },
  hikingDate: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    fontSize: 'large',
    fontWeight: 'bold',
  },
  mountainName: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'font-size 0.3s ease',
  },
  mountainNameDivider: {
    margin: '10px 0',
  },
  backToTop: {
    position: 'fixed',
    right: '30px',
    bottom: '30px',
    display: 'flex',
    width: '45px',
    height: '45px',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.5s',
    zIndex: 99,
  },
  deleteButton: {
    marginRight: '10px',
  }
};

const HikingListRecord = () => {
  const [hikingList, setHikingList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [nickName, setNickName] = useState('');

  const imageUrl = 'https://kr.object.ncloudstorage.com/santabucket2/139_0_1';

  useEffect(() => {
    const userNo = Cookies.get('userNo');
    const nickNameFromCookie = Cookies.get('nickName');
    setNickName(nickNameFromCookie);
    console.log('userNo, nickName' + userNo + nickName);

    axios.post(`https://www.dearmysanta.site/hiking/react/getHikingListRecord/${userNo}`)
      .then(response => {
        console.log(response.data); // 서버로부터 받은 데이터를 콘솔에 출력
        setHikingList(response.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  console.log(nickName);

  const getSkyCondition = (code) => {
    const skyConditionCode = parseInt(code, 10);
    switch (skyConditionCode) {
      case 1:
        return '맑음 ☀️'; // Clear with sun emoticon
      case 3:
        return '구름많음 ☁️'; // Cloudy with cloud emoticon
      case 4:
        return '흐림 🌥️'; // Overcast with cloud emoticon
      default:
        return '알 수 없음 ❓'; // Unknown with question mark emoticon
    }
  };

  const getTrailDifficulty = (difficulty) => {
    switch (parseInt(difficulty, 10)) {
      case 2:
        return '쉬움 😊'; // Easy with smiling face emoticon
      case 1:
        return '보통 😐'; // Medium with neutral face emoticon
      case 0:
        return '어려움 😓'; // Hard with sweating face emoticon
      default:
        return '알 수 없음 ❓'; // Unknown with question mark emoticon
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) {
      return '0분';
    } else if (minutes < 60) {
      return `${minutes}분`;
    } else {
      return hours > 0 ? `${hours}시간 ${minutes % 60}분` : `${minutes % 60}분`;
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
    axios.post('https://www.dearmysanta.site/hiking/react/deleteHikingRecord', selectedItems)
      .then(() => {
        setHikingList(hikingList.filter(record => !selectedItems.includes(record.hrNo)));
        setSelectedItems([]);
      })
      .catch(error => console.error('Error deleting records:', error));
  };

  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.getElementById("back-to-top");
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = "block";
      } else {
        backToTopButton.style.display = "none";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="container-fluid page-header py-5 d-flex align-items-center justify-content-center" style={styles.pageHeader}>
        <div className="background-blur" style={styles.backgroundBlur(imageUrl)}></div>
        <h1 className="text-center text-white display-6" style={styles.pageTitle}>{nickName}의 등산 기록</h1>
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
                  style={styles.deleteButton}
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
                    <div className={`card h-100 fruite-item`} style={styles.card}>
                      <div className="card-body light-green-border position-relative">
                        <div className="hiking-date" style={styles.hikingDate}>{record.hikingDate}</div>
                        <h3 className="mountain-name" style={styles.mountainName}>{record.mountain?.mountainName}</h3>
                        <hr className="mountain-name-divider" style={styles.mountainNameDivider} />
                        <p className="card-text"><strong>날씨:</strong> {getSkyCondition(record.weather?.skyCondition)}</p>
                        <hr />
                        <p className="card-text"><strong>총 소요시간:</strong> {formatTime(record.totalTime)}</p>
                        <hr />
                        <p className="card-text"><strong>등산 이동 거리:</strong> {record.userDistance}m</p>
                        <hr />
                        <p className="card-text"><strong>등산 시간:</strong> {formatTime(record.ascentTime)}</p>
                        <hr />
                        <p className="card-text"><strong>하산 시간:</strong> {formatTime(record.descentTime)}</p>
                        <hr />
                        <p className="card-text"><strong>선택한 등산 난이도:</strong> {getTrailDifficulty(record.hikingDifficulty)}</p>

                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedItems.includes(record.hrNo)}
                          onChange={(e) => { e.stopPropagation(); handleSelect(record.hrNo); }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <button id="back-to-top" className="btn btn-primary border-3 border-primary rounded-circle" style={styles.backToTop} onClick={scrollToTop}>
        <i className="fa fa-arrow-up"></i>
      </button>
    </div>
  );
};

export default HikingListRecord;
