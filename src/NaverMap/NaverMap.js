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

const styles = {
  containerFluid: {
    padding: '0',
  },
  mapContainer: {
    marginTop: '110px',
    position: 'relative',
  },
  topBorderLine: {
    width: '100%',
    height: '5px',
    backgroundColor: 'black',
    position: 'absolute',
    left: '0',
    zIndex: '1000',
    top: '0',
  },
  bottomBorderLine: {
    width: '100%',
    height: '5px',
    backgroundColor: 'black',
    position: 'absolute',
    left: '0',
    zIndex: '1000',
    bottom: '0',
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
  buttonHoverStyle: {
    backgroundColor: '#0056b3',
    transform: 'translateY(-2px)',
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

  const navigate = useNavigate();

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
          timeout: 20000,
        });
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('Connected to server');
        });

        socketInstance.on('locationUpdate', (locations) => {
          console.log('Location update received:', locations);
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

            const newTrails = displayTrailInfo(map, mountain.mountainTrail, window.naver);
            setVisibleTrails({ mountainNo: mountain.mountainNo, trails: newTrails });
          }
        });

        return marker;
      });

      setMountainMarkers(newMarkers);
    }
  }, [mountains, map, visibleTrails]);

  useEffect(() => {
    window.setSelectedTrailDifficulty = setSelectedTrailDifficulty;
    window.setSelectedTrailEndCoord = setSelectedTrailEnd;
    window.setSelectedTrailCoordinates = setTrailCoordinates;
    window.setSelectedTrailLength = setTrailLength;
    window.setSelectedTrailAscent = setTrailAscent;
    window.setSelectedTrailDescent = setTrailDescent;
  }, []);

  const handleHikingStatusChange = () => {
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
      mountain: {
        mountainName: selectedMountainName
      },
      totalTime: time,
      hikingDifficulty: selectedTrailDifficulty,
      ascentTime,
      descentTime: calculatedDescentTime,
      userDistance: distance,
      weather: { skyCondition }
    };

    console.log(hikingData);
    try {
      await axios.post('https://www.dearmysanta.site/hiking/react/addHikingRecord', hikingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Hiking data saved successfully.');
    } catch (error) {
      console.error('Error saving hiking data:', error.message);
    }
  };

  const getButtonText = () => {
    if (hikingStatus === 'notStarted') return '등산시작';
    if (hikingStatus === 'hiking') return '등산완료';
    if (hikingStatus === 'hikingCompleted') return '하산시작';
    if (hikingStatus === 'descending') return '하산완료';
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
