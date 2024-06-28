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
    bottom: '70px',
    right: '10px',
    zIndex: '1000',
    padding: '10px',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
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
            zoom: 14,
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
            initializeMap(37.5666805, 126.9784147);
          });
        } else {
          console.error('Geolocation not supported');
          initializeMap(37.5666805, 126.9784147);
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
                    url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
                    scaledSize: new naver.maps.Size(23, 23)
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
          url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
          scaledSize: new window.naver.maps.Size(20, 20)
        }
      });
      setCurrentMarker(marker);

      console.log('Updated location: ' + newLocation.lat() + ', ' + newLocation.lng());
    }
  }, [latitude, longitude, map]);

  useEffect(() => {
    if (mountains.length > 0 && map) {
      mountainMarkers.forEach(marker => marker.setMap(null));

      const newMarkers = mountains.map(mountain => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(mountain.mountainLatitude, mountain.mountainLongitude),
          map: map,
          title: mountain.mountainName,
          icon: {
            url: 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png',
            scaledSize: new window.naver.maps.Size(20, 20)
          }
        });

        window.naver.maps.Event.addListener(marker, 'click', () => {
          console.log('Marker clicked:', mountain.mountainName);
          console.log('Mountain trails:', mountain.mountainTrail);

          setSelectedMountainName(mountain.mountainName);

          map.setCenter(marker.getPosition());
          map.setZoom(20);

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
      visibleTrails.trails.forEach(({ customOverlay }) => {
        const isVisible = zoomLevel >= zoomLevelThreshold;
        if (customOverlay && typeof customOverlay.setVisible === 'function') {
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
        text: error.message,
      });
      console.error('Error saving hiking data:', error.message);
    }
  };

  const getButtonText = () => {
    if (hikingStatus === 'notStarted') return '등산시작';
    if (hikingStatus === 'hiking') return '등산완료';
    if (hikingStatus === 'hikingCompleted') return '하산시작';
    if (hikingStatus === 'descending') return '하산완료';
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
            url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
            scaledSize: new window.naver.maps.Size(23, 23)
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
  if (selectedTrailDifficulty === '2') {
    trailDifficultyText = '쉬움';
  } else if (selectedTrailDifficulty === '1') {
    trailDifficultyText = '보통';
  } else if (selectedTrailDifficulty === '0') {
    trailDifficultyText = '어려움';
  }

  return (
    <>
      <div className="map-container" style={styles.mapContainer}>
        <div className="top-border-line" style={styles.topBorderLine}></div>
        <div id="map" style={{ width: '100%', height: '900px', position: 'relative' }}>
          <div style={styles.settingButtonStyle}>
            <button 
              onClick={() => navigate('./hiking-alert')}
              style={styles.settingButtonStyle}
            >
              ⚙️
            </button>
          </div>
          <div style={styles.locateButtonStyle}>
            <button 
              onClick={handleLocateMe}
              style={styles.locateButtonStyle}
            >
              📍
            </button>
          </div>
        </div>
        <div className="bottom-border-line" style={styles.bottomBorderLine}></div>
      </div>
      <div style={styles.buttonStyle}>
        <button className='hiking-button' onClick={handleHikingStatusChange}>
          {getButtonText()}
        </button>
      </div>
      <div className="weather">
        <WeatherComponent latitude={latitude} longitude={longitude} setSkyCondition={setSkyCondition} setSunsetTime={setSunsetTime} />
      </div>
      <div className="mountain">
        <Mountain setMountains={setMountains} />
      </div>
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
      <HikingAlert 
        userNo={userNo}  // userNo를 전달합니다
        currentLocation={{ latitude, longitude }} 
        selectedTrailEnd={selectedTrailEnd} 
        sunsetTime={sunsetTime}
        trailCoordinates={trailCoordinates} 
        hikingStatus={hikingStatus} 
      /> 
    </>
  );
};

export default NaverMap;
