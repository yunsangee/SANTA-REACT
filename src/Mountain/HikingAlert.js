import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import L from 'leaflet';
import { calculateDistance } from '../Utils/calculateDistance';

const expandLatLng = (latlng, distance) => {
  const earthRadius = 6371000; // 지구 반지름 (미터)
  const lat = latlng.lat * (Math.PI / 180); // 라디안 단위로 변환
  const lng = latlng.lng * (Math.PI / 180); // 라디안 단위로 변환

  const newLatLngs = [];
  const angleIncrement = 10; // 각도 증가량

  for (let angle = 0; angle < 360; angle += angleIncrement) {
    const angleRad = angle * (Math.PI / 180); // 라디안 단위로 변환
    const newLat = lat + (distance / earthRadius) * Math.cos(angleRad);
    const newLng = lng + (distance / earthRadius) * Math.sin(angleRad) / Math.cos(lat);

    newLatLngs.push(L.latLng(newLat * (180 / Math.PI), newLng * (180 / Math.PI)));
  }

  return newLatLngs;
};

const expandPolygon = (latlngs, distance) => {
  let expandedLatLngs = [];
  latlngs.forEach(latlng => {
    expandedLatLngs = expandedLatLngs.concat(expandLatLng(latlng, distance));
  });
  return expandedLatLngs;
};

const HikingAlert = ({ userNo, currentLocation, selectedTrailEnd, sunsetTime, trailCoordinates }) => {
  const [meetingTime, setMeetingTime] = useState('');
  const [alertSettings, setAlertSettings] = useState(null);
  const [distanceAlertShown, setDistanceAlertShown] = useState({ 200: false, 100: false });
  const [sunsetAlertShown, setSunsetAlertShown] = useState({ 2: false, 1: false });
  const [geoFence, setGeoFence] = useState(null);
  const geoFenceAlertInterval = useRef(null);
  const meetingTimeAlertShown = useRef(false);
  const audioRef = useRef(new Audio());

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const playTTS = async (message) => {
    const response = await fetch(`http://localhost:4000/tts?text=${encodeURIComponent(message)}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    audioRef.current.play();
  };

  useEffect(() => {
    const fetchAlertSettings = async () => {
      try {
        userNo = 21;
        const response = await axios.post(`http://localhost:8001/hikingGuide/react/getAlertSetting/${userNo}`);
        setAlertSettings(response.data);
        setMeetingTime(response.data.meetingTime);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching alert settings:', error);
      }
    };
    fetchAlertSettings();
  }, [userNo]);

  useEffect(() => {
    if (trailCoordinates && trailCoordinates.length > 0) {
      const latLngs = trailCoordinates.map(coord => L.latLng(coord[0], coord[1]));
      const expandedLatLngs = expandPolygon(latLngs, 15); 
      const polygon = L.polygon(expandedLatLngs);
      setGeoFence(polygon);
    }
  }, [trailCoordinates]);

  useEffect(() => {
    if (currentLocation && geoFence && alertSettings?.hikingAlertFlag === 1) {
      const userLatLng = L.latLng(currentLocation.latitude, currentLocation.longitude);
      const isInside = geoFence.getBounds().contains(userLatLng);

      if (!isInside && alertSettings?.locationOverAlert === 1 && notificationsEnabled) {
        if (!geoFenceAlertInterval.current) {
          geoFenceAlertInterval.current = setInterval(() => {
            const message = '등산로를 벗어나셨습니다~~!';
            toast.warn(message);
            playTTS(message);
          }, 3000);
        }
      } else {
        if (geoFenceAlertInterval.current) {
          clearInterval(geoFenceAlertInterval.current);
          geoFenceAlertInterval.current = null;
        }
      }

      console.log('User inside geofence:', isInside);
    }
  }, [currentLocation, geoFence, alertSettings, notificationsEnabled]);

  useEffect(() => {
    if (currentLocation && selectedTrailEnd && alertSettings?.hikingAlertFlag === 1 && alertSettings?.destinationAlert === 1 && notificationsEnabled) {
      if (selectedTrailEnd.latitude === 0 && selectedTrailEnd.longitude === 0) {
        console.log('Invalid trail end coordinates');
        return;
      }

      const distance = calculateDistance(currentLocation, selectedTrailEnd);

      console.log('Current distance to trail end:', distance);

      if (distance <= 200 && distance > 100 && !distanceAlertShown[200]) {
        const message = '목적지까지 200m 남았습니다';
        toast.info(message);
        playTTS(message);
        setDistanceAlertShown(prevState => ({ ...prevState, 200: true }));
      } else if (distance <= 100 && !distanceAlertShown[100]) {
        const message = '목적지까지 100m 남았습니다';
        toast.info(message);
        playTTS(message);
        setDistanceAlertShown(prevState => ({ ...prevState, 100: true }));
      }
    }

    if (sunsetTime && alertSettings?.hikingAlertFlag === 1 && alertSettings?.sunsetAlert === 1 && notificationsEnabled) {
      const currentTime = new Date();
      const sunsetDateTime = new Date();

      console.log('Raw sunsetTime:', sunsetTime);

      const formattedSunsetTime = `${sunsetTime.slice(0, 2)}:${sunsetTime.slice(2, 4)}`;
      const [sunsetHours, sunsetMinutes] = formattedSunsetTime.split(':');
      sunsetDateTime.setHours(sunsetHours);
      sunsetDateTime.setMinutes(sunsetMinutes);
      sunsetDateTime.setSeconds(0);
      sunsetDateTime.setMilliseconds(0);

      console.log('일몰시간:', sunsetDateTime);
      console.log('현재시간:', currentTime);

      if (isNaN(sunsetDateTime)) {
        console.error('Invalid sunsetDateTime:', sunsetDateTime);
        return;
      }

      const timeDifference = sunsetDateTime - currentTime;
      const hoursUntilSunset = timeDifference / (1000 * 60 * 60);

      if (hoursUntilSunset <= 2 && !sunsetAlertShown[2]) {
        const message = '일몰까지 2시간 남았습니다';
        toast.warn(message);
        playTTS(message);
        setSunsetAlertShown(prevState => ({ ...prevState, 2: true }));
      } else if (hoursUntilSunset <= 1 && !sunsetAlertShown[1]) {
        const message = '일몰까지 1시간 남았습니다';
        toast.warn(message);
        playTTS(message);
        setSunsetAlertShown(prevState => ({ ...prevState, 1: true }));
      }
    }

    if (meetingTime && alertSettings?.hikingAlertFlag === 1 && alertSettings?.meetingTimeAlert === 1 && notificationsEnabled && !meetingTimeAlertShown.current) {
      const currentTime = new Date();
      const meetingDateTime = new Date();

      const [meetingHours, meetingMinutes] = meetingTime.split(':');
      meetingDateTime.setHours(meetingHours);
      meetingDateTime.setMinutes(meetingMinutes);
      meetingDateTime.setSeconds(0);
      meetingDateTime.setMilliseconds(0);

      const timeDifference = meetingDateTime - currentTime;

      if (timeDifference <= 0 && timeDifference > -60000) { 
        const message = '약속한 시간이 되었습니다 서두르세요';
        toast.info(message);
        playTTS(message);
        meetingTimeAlertShown.current = true; 
      }
    }
  }, [currentLocation, selectedTrailEnd, sunsetTime, distanceAlertShown, sunsetAlertShown, alertSettings, meetingTime, notificationsEnabled]);

  useEffect(() => {
    return () => {
      if (geoFenceAlertInterval.current) {
        clearInterval(geoFenceAlertInterval.current);
      }
    };
  }, []);

  return (
    <>
      <button onClick={() => setNotificationsEnabled(prev => !prev)}>
        {notificationsEnabled ? '알림 끄기' : '알림 켜기'}
      </button>
      <ToastContainer position="top-center" />
    </>
  );
};

export default HikingAlert;
