import React, { useState, useEffect } from 'react';

const WeatherComponent = ({ latitude, longitude, setSkyCondition, setSunsetTime }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('http://localhost:8001/hikingGuide/react/getWeather', {
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
        return '맑음';
      case 3:
        return '구름많음';
      case 4:
        return '흐림';
      default:
        return '알 수 없음';
    }
  };

  const getPrecipitationType = (code) => {
    const precipitationTypeCode = parseInt(code, 10);
    switch (precipitationTypeCode) {
      case 1:
        return '비';
      case 2:
        return '비/눈';
      case 3:
        return '눈';
      case 4:
        return '소나기';
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'absolute', top: '5px', right: '8px', zIndex: 1000, backgroundColor: 'white', padding: '3px', fontSize: '10px', width: '100px' }}>
      <h2 style={{ fontSize: '13px' }}>날씨</h2>
      {weather ? (
        <>
          <p>현재 날씨: {getSkyCondition(weather.skyCondition)}</p>
          <p>기온: {weather.temperature}°C</p>
          <p>일출시간: {weather.sunriseTime}</p>
          <p>일몰시간: {weather.sunsetTime}</p>
          {weather.precipitationType !== '강수없음' && (
            <p>강수형태: {getPrecipitationType(weather.precipitationType)}</p>
          )}
          <p>강수확률: {weather.precipitationProbability}%</p>
        </>
      ) : (
        <p>Loading weather information...</p>
      )}
    </div>
  );
};

export default WeatherComponent;
