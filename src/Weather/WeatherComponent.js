import React, { useState, useEffect } from 'react';

const WeatherComponent = ({ latitude, longitude, setSkyCondition, setSunsetTime }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://www.dearmysanta.site/hikingguide/react/getWeather', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ latitude, longitude })
        });

        if (response.ok) {
          const data = await response.json();
          setWeather(data);
          if (data.skyCondition) {
            setSkyCondition(data.skyCondition); 
          } else {
            setSkyCondition('Unknown');
          }
          if (data.sunsetTime) {
            setSunsetTime(data.sunsetTime);
          }
        } else {
          console.error('Failed to fetch weather information');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude, setSkyCondition, setSunsetTime]);

  const getSkyCondition = (code) => {
    const skyConditionCode = parseInt(code, 10);
    switch (skyConditionCode) {
      case 1:
        return '맑음 ☀️'; // Clear with sun emoticon
      case 3:
        return '구름많음 ☁️'; // Cloudy with cloud emoticon
      case 4:
        return '흐림 🌥️'; // Overcast with cloud emoticon
      default:
        return '알 수 없음 ❓'; // Unknown with question mark emoticon
    }
  };

  const getPrecipitationType = (code) => {
    const precipitationTypeCode = parseInt(code, 10);
    switch (precipitationTypeCode) {
      case 1:
        return '비 🌧️'; // Rain with rain cloud emoticon
      case 2:
        return '비/눈 🌦️'; // Rain/Snow with rain and snow emoticon
      case 3:
        return '눈 ❄️'; // Snow with snowflake emoticon
      case 4:
        return '소나기 🌦️'; // Shower with shower emoticon
      default:
        return '강수 없음';
    }
  };

  const formatTime = (time) => {
    const hour = time.slice(0, 2);
    const minute = time.slice(2, 4);
    return `${hour.padStart(2, '0')} : ${minute.padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: '170px', 
      right: '8px', 
      zIndex: 1000, 
      backgroundColor: 'rgba(255, 255, 255, 0.2)',  // Increased transparency
      padding: '10px', 
      fontSize: '15px', 
      width: '200px', 
      backdropFilter: 'blur(10px)', 
      WebkitBackdropFilter: 'blur(10px)', // For Safari support
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '25px', marginBottom: '10px', borderBottom: '1px solid #000' }}>〈〈날씨〉〉</h2>
      {weather ? (
        <>
          <p style={{ margin: '5px 0',fontWeight: 'bold'}}>현재 날씨: {getSkyCondition(weather.skyCondition)}</p>
          <p style={{ margin: '5px 0',fontWeight: 'bold' }}>기온: {weather.temperature}°C</p>
          <p style={{ margin: '5px 0',fontWeight: 'bold' }}>일출시간: {formatTime(weather.sunriseTime)}</p>
          <p style={{ margin: '5px 0',fontWeight: 'bold' }}>일몰시간: {formatTime(weather.sunsetTime)}</p>
          <p style={{ margin: '5px 0',fontWeight: 'bold' }}>강수형태: {getPrecipitationType(weather.precipitationType)}</p>
          <p style={{ margin: '5px 0',fontWeight: 'bold' }}>강수확률: {weather.precipitationProbability}%</p>
        </>
      ) : (
        <p style={{ margin: '5px 0' }}>Loading weather information...</p>
      )}
    </div>
  );
};

export default WeatherComponent;