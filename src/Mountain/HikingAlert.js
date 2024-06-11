import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HikingAlert = ({ currentLocation, selectedTrailEnd }) => {

  useEffect(() => {
    if (currentLocation && selectedTrailEnd) {
      const distance = calculateDistance(currentLocation, selectedTrailEnd);
      
      console.log('Current Location:', currentLocation);
      console.log('Selected Trail End Coordinate:', selectedTrailEnd);
      console.log('Distance to Trail End Coordinate:', distance);

      if (distance <= 200) {
        toast.info('200m left to the destination');
      }
    }
  }, [currentLocation, selectedTrailEnd]);

  const calculateDistance = (loc1, loc2) => {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // Distance in meters
    return d;
  };

  return (
    <>
      <ToastContainer />
    </>
  );
};

export default HikingAlert;
