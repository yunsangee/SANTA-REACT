import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import WeatherComponent from '../Weather/WeatherComponent';
import Mountain from '../Mountain/Mountain';
import UserInformation from '../UserInformation/UserInformation';
import HikingAlert from '../Mountain/HikingAlert';
import { displayTrailInfo, clearTrailInfo } from '../Mountain/TrailDisplay';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const NaverMap = () => {
  const [socket, setSocket] = useState(null);
  const [map, setMap] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [mountainMarkers, setMountainMarkers] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [mountains, setMountains] = useState([]);
  const [visibleTrails, setVisibleTrails] = useState(null);
  const [hikingStatus, setHikingStatus] = useState('notStarted'); // 'notStarted', 'hiking', 'hikingCompleted', 'descending'
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
  const [trailCoordinates, setTrailCoordinates] = useState([]); // Add trail coordinates state
  const [trailLength, setTrailLength] = useState(0);
  const [trailAscent, setTrailAscent] = useState(0);
  const [trailDescent, setTrailDescent] = useState(0);

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
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
          window.map = mapInstance; // expose map to window object
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

        const socketInstance = io('http://localhost:4000', {
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
          } else {
            console.error('Geolocation not supported');
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

          setSelectedMountainName(mountain.mountainName); // Save the selected mountain name

          // Zoom to the mountain marker
          map.setCenter(marker.getPosition());
          map.setZoom(15);

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
    // Expose setSelectedTrailDifficulty to the window object for trail info click handler
    window.setSelectedTrailDifficulty = setSelectedTrailDifficulty;
    window.setSelectedTrailEndCoord = setSelectedTrailEnd;
    window.setSelectedTrailCoordinates = setTrailCoordinates; // Add function to set trail coordinates
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
    const userNo = 1; 
    const hikingData = {
      userNo,
      mountain:{
      mountainName: selectedMountainName
      },
      totalTime: time,
      hikingDifficulty: selectedTrailDifficulty,
      ascentTime,
      descentTime: calculatedDescentTime, // Use the calculated descent time
      userDistance: distance,
      weather:{skyCondition}
    };

    console.log(hikingData);
    try {
      await axios.post('http://localhost:8001/hikingGuide/react/addHikingRecord', hikingData, {
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
      <div id="map" style={{ width: '100%', height: '800px' }}></div>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000 }}>
     <button 
        onClick={() => navigate('/hiking-alert')} // Navigate to HikingAlert
        style={{ padding: '10px', backgroundColor: 'white' }}
     >
    설정
  </button>
      </div>
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
        <button 
          onClick={handleHikingStatusChange} 
          style={{ padding: '10px', backgroundColor: 'white' }}
        >
          {getButtonText()}
        </button>
      </div>
      <WeatherComponent latitude={latitude} longitude={longitude} setSkyCondition={setSkyCondition} setSunsetTime={setSunsetTime} />
      <Mountain setMountains={setMountains} />
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
        trailLength={trailLength} // Add trail length prop
        trailAscent={trailAscent} // Add trail ascent prop
        trailDescent={trailDescent} // Add trail descent prop
      />
      <HikingAlert 
        currentLocation={{ latitude, longitude }} 
        selectedTrailEnd={selectedTrailEnd} 
        sunsetTime={sunsetTime}
        trailCoordinates={trailCoordinates} 
      /> 
    </>
  );
};

export default NaverMap;
