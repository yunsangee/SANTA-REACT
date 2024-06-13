import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { calculateDistance } from '../Utils/calculateDistance'; 

const UserInformation = ({ 
  isHiking, 
  ascentTime, 
  totalTime, 
  descentTime, 
  resetHiking, 
  mountainName, 
  trailDifficulty, 
  distance, 
  setDistance,
  trailLength,
  trailAscent,
  trailDescent 
}) => {
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

  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, backgroundColor: 'white', padding: '10px', fontSize: '12px' }}>
      <h3>등산 정보</h3>
      <p>총 소요시간: {Math.floor(totalTime / 60)}:{('0' + (totalTime % 60)).slice(-2)}</p>
      <p>이동 거리: {distance.toFixed(2)} m</p>
      {ascentTime > 0 && <p>등산 시간: {Math.floor(ascentTime / 60)}:{('0' + (ascentTime % 60)).slice(-2)}</p>}
      {descentTime > 0 && <p>하산 시간: {Math.floor(descentTime / 60)}:{('0' + (descentTime % 60)).slice(-2)}</p>}
      <p>산 이름: {mountainName}</p>
      <p>등산로 난이도: {trailDifficulty}</p>
      <p>등산로 길이: {trailLength} m</p>
      <p>등산예상시간: {trailAscent} 분</p>
      <p>하산예상시간: {trailDescent} 분</p>
    </div>
  );
};

export default UserInformation;
