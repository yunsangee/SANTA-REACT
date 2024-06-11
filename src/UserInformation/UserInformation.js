import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const UserInformation = ({ isHiking, ascentTime, totalTime, descentTime, resetHiking, mountainName, trailDifficulty, distance, setDistance }) => {
  const [prevLocation, setPrevLocation] = useState(null);
  const [socket, setSocket] = useState(null);
  const [path, setPath] = useState([]);

  useEffect(() => {
    const socketInstance = io('http://localhost:4000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 2000,
    });

    setSocket(socketInstance);

    socketInstance.on('locationUpdate', (location) => {
      if (prevLocation) {
        const distanceIncrement = calculateDistance(prevLocation, location);
        setDistance(prevDistance => prevDistance + distanceIncrement);
        setPath(prevPath => [...prevPath, location]);
      } else {
        setPath([location]);
      }
      setPrevLocation(location);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [prevLocation]);

  useEffect(() => {
    if (resetHiking) {
      setDistance(0);
      setPrevLocation(null);
      setPath([]);
    }
  }, [resetHiking, setDistance]);

  useEffect(() => {
    if (path.length > 1) {
      const polylinePath = path.map(loc => new window.naver.maps.LatLng(loc.latitude, loc.longitude));
      if (window.polyline) {
        window.polyline.setMap(null);
      }
      window.polyline = new window.naver.maps.Polyline({
        path: polylinePath,
        map: window.map,
        strokeColor: '#808080',
        strokeWeight: 2
      });
    }
  }, [path]);

  const calculateDistance = (loc1, loc2) => {
    const R = 6371e3; 
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; 
    return d;
  };
  

  return (
    <div style={{ position: 'absolute', bottom: '55px', left: '10px', zIndex: 1000, backgroundColor: 'white', padding: '10px', fontSize: '12px' }}>
      <h3>Hiking Info</h3>
      <p>Time: {Math.floor(totalTime / 60)}:{('0' + (totalTime % 60)).slice(-2)}</p>
      <p>Distance: {distance.toFixed(2)} m</p>
      {ascentTime > 0 && <p>Ascent Time: {Math.floor(ascentTime / 60)}:{('0' + (ascentTime % 60)).slice(-2)}</p>}
      {descentTime > 0 && <p>Descent Time: {Math.floor(descentTime / 60)}:{('0' + (descentTime % 60)).slice(-2)}</p>}
      <p>Mountain Name: {mountainName}</p>
      <p>Trail Difficulty: {trailDifficulty}</p>
    </div>
  );
};

export default UserInformation;
