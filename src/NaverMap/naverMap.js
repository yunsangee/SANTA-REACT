import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const NaverMap = () => {
  const [socket, setSocket] = useState(null);
  const [randomCoordinates, setRandomCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [almostThere, setAlmostThere] = useState(false);
  const [map, setMap] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [polyline, setPolyline] = useState(null);

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
        const mapInstance = new window.naver.maps.Map('map', mapOptions);
        setMap(mapInstance);

        const streetLayer = new window.naver.maps.StreetLayer();
        const btn = document.getElementById('street');
        window.naver.maps.Event.addListener(mapInstance, 'streetLayer_changed', function (streetLayer) {
          if (streetLayer) {
            btn.classList.add('control-on');
          } else {
            btn.classList.remove('control-on');
          }
        });

        btn.addEventListener("click", function (e) {
          e.preventDefault();
          if (streetLayer.getMap()) {
            streetLayer.setMap(null);
          } else {
            streetLayer.setMap(mapInstance);
          }
        });

        window.naver.maps.Event.once(mapInstance, 'init', function () {
          streetLayer.setMap(mapInstance);
        });

        // Connect to the socket.io server with reconnection options
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

        socketInstance.on('randomCoordinate', ({ randomCoordinates, distance, almostThere }) => {
          console.log('Random coordinate received:', randomCoordinates);
          console.log('Distance:', distance);
          console.log('Almost there:', almostThere);
          setDistance(distance);
          setAlmostThere(almostThere);

          const newRandomLocation = new window.naver.maps.LatLng(randomCoordinates.latitude, randomCoordinates.longitude);

          // Add new random coordinates to the list
          setRandomCoordinates(prevCoordinates => {
            const updatedCoordinates = [...prevCoordinates, newRandomLocation];

            // Update polyline
            if (polyline) {
              polyline.setPath(updatedCoordinates);
            } else {
              const newPolyline = new window.naver.maps.Polyline({
                map: mapInstance,
                path: updatedCoordinates,
                strokeColor: '#FF0000', // Red color for the line
                strokeWeight: 5
              });
              setPolyline(newPolyline);
            }

            // Add new random marker
            const newMarker = new window.naver.maps.Marker({
              position: newRandomLocation,
              map: mapInstance,
              title: 'Random Location',
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }
            });

            return updatedCoordinates;
          });
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from server');
        });

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
              socketInstance.emit('location', location);
              console.log('Location sent to server:', location);

              // Update current location marker
              const newLocation = new window.naver.maps.LatLng(location.latitude, location.longitude);
              mapInstance.setCenter(newLocation);

              if (currentMarker) {
                currentMarker.setPosition(newLocation);
              } else {
                const marker = new window.naver.maps.Marker({
                  position: newLocation,
                  map: mapInstance,
                  title: 'Your Location',
                  icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                  }
                });
                setCurrentMarker(marker);
              }
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

  return (
    <>
      <div id="map" style={{ width: '100%', height: '400px' }}></div>
      <button id="street" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>Toggle Street View</button>
      <div id="log" style={{ position: 'absolute', bottom: '10px', left: '10px', width: '100%', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '10px', zIndex: 1000 }}></div>
      {distance !== null && 
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          Distance: {distance.toFixed(2)} km
        </div>
      }
      {almostThere && 
        <div style={{ position: 'absolute', top: '50px', right: '10px', zIndex: 1000, backgroundColor: 'yellow', padding: '10px' }}>
          Almost there!
        </div>
      }
    </>
  );
};

export default NaverMap;
