import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const NaverMap = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=ch1xa6ojlq";
    script.async = true;
    script.onload = () => {
      if (window.naver && window.naver.maps) {
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
          zoom: 10,
          mapTypeId: window.naver.maps.MapTypeId.NORMAL,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.naver.maps.MapTypeControlStyle.DROPDOWN
          }
        };
        const map = new window.naver.maps.Map('map', mapOptions);
        const infowindow = new window.naver.maps.InfoWindow();
        const streetLayer = new window.naver.maps.StreetLayer();
        let marker = null;

        // Handle street layer toggle
        const btn = document.getElementById('street');
        window.naver.maps.Event.addListener(map, 'streetLayer_changed', function(streetLayer) {
          if (streetLayer) {
            btn.classList.add('control-on');
          } else {
            btn.classList.remove('control-on');
          }
        });

        btn.addEventListener("click", function(e) {
          e.preventDefault();
          if (streetLayer.getMap()) {
            streetLayer.setMap(null);
          } else {
            streetLayer.setMap(map);
          }
        });

        window.naver.maps.Event.once(map, 'init', function() {
          streetLayer.setMap(map);
        });

        // Connect to the socket.io server with reconnection options
        const socket = io('http://localhost:4000', {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });
        setSocket(socket);

        socket.on('connect', () => {
          console.log('Connected to server');
          
        });

        socket.on('locationUpdate', (locations) => {
          console.log('Location update received:', locations);


          const userLocation = locations[socket.id];
          if (userLocation) {
            const newLocation = new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude);
            map.setCenter(newLocation);

            if (marker) {
              marker.setPosition(newLocation);
            } else {
              marker = new window.naver.maps.Marker({
                position: newLocation,
                map: map
              });
            }

            infowindow.setContent('<div style="padding:20px;">실시간 위치</div>');
            infowindow.open(map, marker);
          }
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from server');
      
        });

        const addLog = (message) => {
          const logContainer = document.getElementById('log');
          const logEntry = document.createElement('div');
          logEntry.textContent = message;
          logContainer.appendChild(logEntry);
        }

        // Function to get the current geolocation and send it to the server
        const logGeolocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };

              console.log('Coordinates: ' + location.latitude + ', ' + location.longitude);
         

              // Send location to the server
              socket.emit('location', location);
              console.log('Location sent to server:', location);
            
            }, () => {
              console.error('Geolocation failed!');
            
            });
          } else {
            console.error('Geolocation not supported');
        
          }
        };

        // Log the geolocation every 2 seconds
        const geolocationInterval = setInterval(logGeolocation, 2000);

        // Cleanup interval and socket connection on component unmount
        return () => {
          clearInterval(geolocationInterval);
          if (socket) {
            socket.disconnect();
          }
        };
      } else {
        console.error("네이버 지도 API를 로드하는 데 실패했습니다.");
      }
    };
    document.head.appendChild(script);
  }, []);

  return (
    <>
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
      <button id="street" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>Toggle Street View</button>
      <div id="log" style={{ position: 'absolute', bottom: '10px', left: '10px', width: '100%', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', zIndex: 1000 }}></div>
    </>
  );
};

export default NaverMap;
