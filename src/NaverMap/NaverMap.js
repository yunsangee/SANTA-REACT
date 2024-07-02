import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import WeatherComponent from '../Weather/WeatherComponent';
import Mountain from '../Mountain/Mountain';
import UserInformation from '../UserInformation/UserInformation';
import HikingAlert from '../Mountain/HikingAlert';
import { displayTrailInfo, clearTrailInfo } from '../Mountain/TrailDisplay';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

const styles = {
  mapContainer: {
    marginTop: '110px',
    position: 'relative',
  },
  buttonStyle: {
    position: 'absolute',
    bottom: '0px',
    left: '10px',
    zIndex: '1000',
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  settingButtonStyle: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    zIndex: '1000',
    padding: '10px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
  },
  locateButtonStyle: {
    position: 'absolute',
    bottom: '140px',
    right: '10px',
    zIndex: '1000',
    padding: '10px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
  },
  hamburgerMenuStyle: {
    position: 'absolute',
    bottom: '170px',
    right: '10px',
    zIndex: '1000',
    padding: '13px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '28px',
    cursor: 'pointer',
  },
  toggleButtonStyle: {
    padding: '4px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '6px',
  },
  menuContainer: {
    position: 'absolute',
    bottom: '400px',
    right: '10px',
    zIndex: '1000',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '4px',
    display: 'flex',
    flexDirection: 'column',
  },
};

const NaverMap = () => {
  const [socket, setSocket] = useState(null);
  const [map, setMap] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [mountainMarkers, setMountainMarkers] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [mountains, setMountains] = useState([]);
  const [visibleTrails, setVisibleTrails] = useState(null);
  const [hikingStatus, setHikingStatus] = useState('notStarted');
  const [ascentTime, setAscentTime] = useState(0);
  const [descentStartTime, setDescentStartTime] = useState(0);
  const [descentTime, setDescentTime] = useState(0);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [selectedMountainName, setSelectedMountainName] = useState('');
  const [selectedTrailDifficulty, setSelectedTrailDifficulty] = useState('');
  const [distance, setDistance] = useState(0);
  const [skyCondition, setSkyCondition] = useState('');
  const [sunsetTime, setSunsetTime] = useState('');
  const [selectedTrailEnd, setSelectedTrailEnd] = useState({ latitude: 0, longitude: 0 });
  const [trailCoordinates, setTrailCoordinates] = useState([]);
  const [trailLength, setTrailLength] = useState(0);
  const [trailAscent, setTrailAscent] = useState(0);
  const [trailDescent, setTrailDescent] = useState(0);
  const [userNo, setUserNo] = useState(null);
  const [locationUpdate, setLocationUpdate] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [showWeather, setShowWeather] = useState(true);
  const [showHikingInfo, setShowHikingInfo] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const zoomLevelThreshold = 13;

  useEffect(() => {
    const userNoFromCookie = parseInt(Cookies.get('userNo'), 10);
    setUserNo(userNoFromCookie);
    console.log('userNo:' + userNoFromCookie);

    const script = document.createElement('script');
    script.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ch1xa6ojlq";
    script.async = true;
    script.onload = () => {
      if (window.naver && window.naver.maps) {
        const naver = window.naver;
        const initializeMap = (lat, lon) => {
          const mapOptions = {
            center: new naver.maps.LatLng(lat, lon),
            zoom: 15,
            mapTypeControl: true
          };
          const mapInstance = new naver.maps.Map('map', mapOptions);
          setMap(mapInstance);
          window.map = mapInstance;

          naver.maps.Event.addListener(mapInstance, 'zoom_changed', () => {
            const currentZoom = mapInstance.getZoom();
            setZoomLevel(currentZoom);
            console.log('Zoom level changed:', currentZoom);

            // 오버레이 visibility 업데이트
            if (visibleTrails) {
              visibleTrails.trails.forEach(({ customOverlay }) => {
                if (customOverlay && typeof customOverlay.setVisible === 'function') {
                  customOverlay.setVisible(currentZoom >= zoomLevelThreshold);
                }
              });
            }
          });
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLatitude(lat);
            setLongitude(lon);
            initializeMap(lat, lon);
          }, (error) => {
            console.error('Geolocation failed!', error);
            initializeMap(37.5666805, 126.9784147); // Default to Seoul if geolocation fails
          });
        } else {
          console.error('Geolocation not supported');
          initializeMap(37.5666805, 126.9784147); // Default to Seoul if geolocation is not supported
        }

        const socketInstance = io('https://www.dearmysanta.site', {
          path: '/hikingAssist',
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 2000,
        });

        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('Connected to server');
        });

        socketInstance.on('locationUpdate', (locations) => {
          console.log('Location update received:', locations);
          setLocationUpdate(locations);
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from server');
        });

        const logGeolocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };

              socketInstance.emit('location', location);

              if (map) {
                const newLocation = new naver.maps.LatLng(location.latitude, location.longitude);
                map.setCenter(newLocation);

                if (currentMarker) {
                  currentMarker.setMap(null);
                }

                const marker = new naver.maps.Marker({
                  position: newLocation,
                  map: map,
                  title: 'Your Location',
                  icon: {
                    url: 'https://kr.object.ncloudstorage.com/santabucket2/free-icon-location-7987463.png',
                    scaledSize: new naver.maps.Size(30, 30)
                  }
                });
                setCurrentMarker(marker);
              }

              setLatitude(location.latitude);
              setLongitude(location.longitude);

            }, (error) => {
              console.error('Geolocation failed!', error);
            });
          }
        };

        const geolocationInterval = setInterval(logGeolocation, 5000);

        return () => {
          clearInterval(geolocationInterval);
          if (socketInstance) {
            socketInstance.disconnect();
          }
        };
      } else {
        console.error("Failed to load Naver Maps API.");
      }
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (map && latitude !== null && longitude !== null) {
      const newLocation = new window.naver.maps.LatLng(latitude, longitude);
      map.setCenter(newLocation);

      if (currentMarker) {
        currentMarker.setMap(null);
      }

      const marker = new window.naver.maps.Marker({
        position: newLocation,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'https://kr.object.ncloudstorage.com/santabucket2/free-icon-location-7987463.png',
          scaledSize: new window.naver.maps.Size(30, 30)
        }
      });
      setCurrentMarker(marker);

      console.log('Updated location: ' + newLocation.lat() + ', ' + newLocation.lng());
    }
  }, [latitude, longitude, map]);

  useEffect(() => {
    if (mountains.length > 0 && map) {
      // 기존 마커 제거
      mountainMarkers.forEach(marker => marker.setMap(null));

      // 새 마커 생성
      const newMarkers = mountains.map(mountain => {
        if (!window.naver || !window.naver.maps) {
          return null;
        }

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(mountain.mountainLatitude, mountain.mountainLongitude),
          map: map,
          title: mountain.mountainName,
          icon: {
            url: 'https://kr.object.ncloudstorage.com/santabucket2/Flag_6.png',
            scaledSize: new window.naver.maps.Size(50, 50)
          }
        });

        // 마커 클릭 이벤트 리스너 추가
        window.naver.maps.Event.addListener(marker, 'click', () => {
          console.log('Marker clicked:', mountain.mountainName);
          console.log('Mountain trails:', mountain.mountainTrail);

          setSelectedMountainName(mountain.mountainName);

          // 마커 위치로 지도를 이동하고 줌 레벨 설정
          map.setCenter(marker.getPosition());
          map.setZoom(15);  // 줌 레벨을 15로 설정

          if (visibleTrails && visibleTrails.mountainNo === mountain.mountainNo) {
            clearTrailInfo(visibleTrails.trails);
            setVisibleTrails(null);
          } else {
            if (visibleTrails) {
              clearTrailInfo(visibleTrails.trails);
            }

            if (map.getZoom() >= zoomLevelThreshold) {
              const newTrails = displayTrailInfo(map, mountain.mountainTrail, window.naver, map.getZoom());
              setVisibleTrails({ mountainNo: mountain.mountainNo, trails: newTrails });
            }
          }
        });

        return marker;
      });

      setMountainMarkers(newMarkers);
    }
  }, [mountains, map, visibleTrails]);

  useEffect(() => {
    if (zoomLevel >= zoomLevelThreshold) {
      window.setSelectedTrailDifficulty = setSelectedTrailDifficulty;
      window.setSelectedTrailEndCoord = setSelectedTrailEnd;
      window.setSelectedTrailCoordinates = setTrailCoordinates;
      window.setSelectedTrailLength = setTrailLength;
      window.setSelectedTrailAscent = setTrailAscent;
      window.setSelectedTrailDescent = setTrailDescent;
    } else {
      window.setSelectedTrailDifficulty = () => {};
      window.setSelectedTrailEndCoord = () => {};
      window.setSelectedTrailCoordinates = () => {};
      window.setSelectedTrailLength = () => {};
      window.setSelectedTrailAscent = () => {};
      window.setSelectedTrailDescent = () => {};
    }

    // 오버레이 visibility 업데이트
    if (visibleTrails) {
      console.log('Updating overlays visibility based on zoom level:', zoomLevel);
      visibleTrails.trails.forEach(({ customOverlay }) => {
        const isVisible = zoomLevel >= zoomLevelThreshold;
        if (customOverlay && typeof customOverlay.setVisible === 'function') {
          console.log(`Setting visibility of overlay to ${isVisible}`);
          customOverlay.setVisible(isVisible);
        }
      });
    }
  }, [zoomLevel, visibleTrails]);

  const handleHikingStatusChange = () => {
    if (typeof window.stopBlinkingPolyline === 'function') {
      window.stopBlinkingPolyline();
    } else {
      Swal.fire({
        icon: 'error',
        title: '산과 등산코스를 먼저 선택해주세요',
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    if (hikingStatus === 'notStarted') {
      setHikingStatus('hiking');
      startTimer();
    } else if (hikingStatus === 'hiking') {
      setAscentTime(time);
      setHikingStatus('hikingCompleted');
    } else if (hikingStatus === 'hikingCompleted') {
      setDescentStartTime(time);
      setHikingStatus('descending');
    } else if (hikingStatus === 'descending') {
      const calculatedDescentTime = time - descentStartTime;
      setDescentTime(calculatedDescentTime);
      setHikingStatus('notStarted');
      stopTimer();
      saveHikingData(calculatedDescentTime);
    }
  };

  const startTimer = () => {
    const id = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const saveHikingData = async (calculatedDescentTime) => {
    const hikingData = {
      userNo: userNo,
      totalTime: time.toString(),
      userDistance: distance,
      ascentTime: ascentTime.toString(),
      descentTime: calculatedDescentTime.toString(),
      hikingDifficulty: parseInt(selectedTrailDifficulty, 10),
      mountain: {
        mountainName: selectedMountainName
      },
      weather: {
        skyCondition: parseInt(skyCondition, 10)
      }
    };

    console.log(hikingData);
    try {
      await axios.post('https://www.dearmysanta.site/hiking/react/addHikingRecord', hikingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      Swal.fire({
        icon: 'success',
        title: '등산 정보가 기록되었습니다.',
        showConfirmButton: false,
        timer: 1500
      });
      console.log('Hiking data saved successfully.');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '기록에 실패하였습니다.',
      });
      console.error('Error saving hiking data:', error.message);
    }
  };

  const getButtonText = () => {
    let text = '';
    let altText = '';

    if (hikingStatus === 'notStarted') {
      text = '등산 시작';
      altText = '등산 시작';
    } else if (hikingStatus === 'hiking') {
      text = '등산 완료';
      altText = '등산 완료';
    } else if (hikingStatus === 'hikingCompleted') {
      text = '하산 시작';
      altText = '하산 시작';
    } else if (hikingStatus === 'descending') {
      text = '하산 완료';
      altText = '하산 완료';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img 
          src="https://kr.object.ncloudstorage.com/santabucket2/%EB%8B%AC%EB%A6%AC%EA%B8%B0.png" 
          alt={altText} 
          style={{ width: '50px', height: '50px' }}
        />
        <span style={{ fontSize: '10px', marginTop: '0px', color: 'black' }}>{text}</span>
      </div>
    );
  };

  const getButtonClass = () => {
    if (hikingStatus === 'notStarted' || hikingStatus === 'hikingCompleted') {
      return 'hiking-button hiking-start';
    }
    if (hikingStatus === 'hiking' || hikingStatus === 'descending') {
      return 'hiking-button hiking-finish';
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newLocation = new window.naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(newLocation);

        if (currentMarker) {
          currentMarker.setMap(null);
        }

        const marker = new window.naver.maps.Marker({
          position: newLocation,
          map: map,
          title: 'Your Location',
          icon: {
            url: 'https://kr.object.ncloudstorage.com/santabucket2/free-icon-location-7987463.png',
            scaledSize: new window.naver.maps.Size(30, 30)
          }
        });
        setCurrentMarker(marker);

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      }, (error) => {
        console.error('Geolocation failed!', error);
      });
    }
  };

  let trailDifficultyText = '';
  if (selectedTrailDifficulty === '0') {
    trailDifficultyText = '쉬움';
  } else if (selectedTrailDifficulty === '1') {
    trailDifficultyText = '보통';
  } else if (selectedTrailDifficulty === '2') {
    trailDifficultyText = '어려움';
  }

  return (
    <>
      <div className="map-container" style={styles.mapContainer}>
        <div className="top-border-line" style={styles.topBorderLine}></div>
        <div id="map" style={{ width: '100%', height: '900px', position: 'relative' }}>
          <div style={styles.locateButtonStyle}>
            <button
              onClick={handleLocateMe}
              style={styles.locateButtonStyle}
            >
              📍
            </button>
          </div>
          <div style={styles.hamburgerMenuStyle}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={styles.hamburgerMenuStyle}
            >
              ☰
            </button>
          </div>
          {menuOpen && (
            <div style={styles.menuContainer}>
              <button
                onClick={() => setShowWeather(!showWeather)}
                style={styles.toggleButtonStyle}
              >
                {showWeather ? '날씨 정보 숨기기' : '날씨 정보 보기'}
              </button>
              <button
                onClick={() => setShowHikingInfo(!showHikingInfo)}
                style={styles.toggleButtonStyle}
              >
                {showHikingInfo ? '등산 정보 숨기기' : '등산 정보 보기'}
              </button>
              <button
                onClick={() => setNotificationsEnabled(prev => !prev)}
                style={styles.toggleButtonStyle}
              >
                {notificationsEnabled ? '🔕 알림 끄기' : '🔔 알림 켜기'}
              </button>
              <button
                onClick={() => navigate('./hiking-alert')}
                style={styles.toggleButtonStyle}
              >
                ⚙️ 설정
              </button>
            </div>
          )}
        </div>
        <div className="bottom-border-line" style={styles.bottomBorderLine}></div>
      </div>
      <div style={styles.buttonStyle}>
        <button className={getButtonClass()} onClick={handleHikingStatusChange}>
          {getButtonText()}
        </button>
      </div>
      {showWeather && (
        <div className="weather">
          <WeatherComponent latitude={latitude} longitude={longitude} setSkyCondition={setSkyCondition} setSunsetTime={setSunsetTime} />
        </div>
      )}
      {showHikingInfo && (
        <div className="mountain">
          <Mountain setMountains={setMountains} />
        </div>
      )}
      {showHikingInfo && (
        <UserInformation
          isHiking={hikingStatus === 'hiking' || hikingStatus === 'descending'}
          ascentTime={ascentTime}
          totalTime={time}
          descentTime={descentTime}
          resetHiking={hikingStatus === 'notStarted'}
          mountainName={selectedMountainName}
          trailDifficulty={trailDifficultyText}
          distance={distance}
          setDistance={setDistance}
          trailLength={trailLength}
          trailAscent={trailAscent}
          trailDescent={trailDescent}
        />
      )}
      {showHikingInfo && (
        <HikingAlert
          userNo={userNo}  // userNo를 전달합니다
          currentLocation={{ latitude, longitude }}
          selectedTrailEnd={selectedTrailEnd}
          sunsetTime={sunsetTime}
          trailCoordinates={trailCoordinates}
          hikingStatus={hikingStatus}
          notificationsEnabled={notificationsEnabled}
        />
      )}
    </>
  );
};

export default NaverMap;
