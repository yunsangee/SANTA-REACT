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
    const socketInstance = io('https://www.dearmysanta.site', {
      path: '/hikingAssist',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 2000,
    });

    setSocket(socketInstance);

    socketInstance.on('locationUpdate', (location) => {
      if (isHiking) {
        if (prevLocation) {
          const distanceIncrement = calculateDistance(prevLocation, location);
          setDistance(prevDistance => prevDistance + distanceIncrement);
          setPath(prevPath => [...prevPath, location]);
        } else {
          setPath([location]);
        }
        setPrevLocation(location);
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [prevLocation, isHiking]);

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
        strokeColor: '#808080',  // Gray color for the path
        strokeWeight: 2
      });
    }
  }, [path]);

  return (
    <div style={{ 
      position: 'absolute', 
      top: '120px', 
      left: '10px', 
      zIndex: 1000, 
      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
      padding: '8px', 
      fontSize: '12px', 
      width: '180px', 
      backdropFilter: 'blur(10px)', 
      WebkitBackdropFilter: 'blur(10px)', 
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ fontSize: '18px', marginBottom: '8px', borderBottom: '1px solid #000' }}>〈〈등산 정보〉〉</h3>
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>총 소요시간: {Math.floor(totalTime / 60)}:{('0' + (totalTime % 60)).slice(-2)}</p>
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>이동 거리: {distance.toFixed(2)} m</p>
      {ascentTime > 0 && <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>등산 시간: {Math.floor(ascentTime / 60)}:{('0' + (ascentTime % 60)).slice(-2)}</p>}
      {descentTime > 0 && <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>하산 시간: {Math.floor(descentTime / 60)}:{('0' + (descentTime % 60)).slice(-2)}</p>}
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>산 이름: {mountainName}</p>
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>등산로 난이도: {trailDifficulty}</p>
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>등산로 길이: {trailLength} m</p>
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>등산 예상시간: {trailAscent} 분</p>
      <p style={{ margin: '3px 0', textAlign: 'left', fontWeight: 'bold' }}>하산 예상시간: {trailDescent} 분</p>
    </div>
  );
};

export default UserInformation;
