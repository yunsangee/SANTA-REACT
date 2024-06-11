import { createCustomOverlay } from './CustomOverlay';

export const displayTrailInfo = (map, trails, naver) => {
  const CustomOverlay = createCustomOverlay(naver);
  const customOverlays = [];

  trails.forEach(trail => {
    const path = trail.mountainTrailCoordinates.map(coord => new naver.maps.LatLng(coord[0], coord[1]));
    const polyline = new naver.maps.Polyline({
      path: path,
      map: map,
      strokeColor: '#FF0000',
      strokeWeight: 2
    });

    let trailDifficultyText = '';
    if (trail.mountainTrailDifficulty === '0') {
      trailDifficultyText = '쉬움';
    } else if (trail.mountainTrailDifficulty === '1') {
      trailDifficultyText = '보통';
    } else if (trail.mountainTrailDifficulty === '3'){
      trailDifficultyText = '어려움';
    }

    const customOverlayContent = `
      <div style="font-size: 10px; width: 150px; cursor: pointer;" onclick="window.zoomToTrail(${trail.mountainTrailCoordinates[0][0]}, ${trail.mountainTrailCoordinates[0][1]}); window.setTrailDifficulty('${trail.mountainTrailDifficulty}'); window.setSelectedTrailEnd({latitude: ${trail.mountainTrailCoordinates.slice(-1)[0][0]}, longitude: ${trail.mountainTrailCoordinates.slice(-1)[0][1]}});">
        <p><strong>Difficulty:</strong> ${trailDifficultyText}</p>
        <p><strong>Length:</strong> ${trail.mountainTrailLength} m</p>
        <p><strong>Ascent:</strong> ${trail.expectedAscentTime} min</p>
        <p><strong>Descent:</strong> ${trail.descentTime} min</p>
      </div>
    `;

    const customOverlay = new CustomOverlay({
      content: customOverlayContent,
      position: path[0],
      map: map
    });

    customOverlays.push({ polyline, customOverlay });
  });

  return customOverlays;
};

export const clearTrailInfo = (overlays) => {
  overlays.forEach(({ polyline, customOverlay }) => {
    polyline.setMap(null);
    customOverlay.setMap(null);
  });
};

// Expose a function to zoom to trail and set trail difficulty
window.zoomToTrail = (lat, lon) => {
  const latLng = new window.naver.maps.LatLng(lat, lon);
  if (window.map) {
    window.map.setCenter(latLng);
    window.map.setZoom(23);
  }
};

window.setTrailDifficulty = (difficulty) => {
  if (window.setSelectedTrailDifficulty) {
    window.setSelectedTrailDifficulty(difficulty);
  }
};

window.setSelectedTrailEnd = (endCoord) => {
  if (window.setSelectedTrailEnd) {
    window.setSelectedTrailEnd(endCoord);
  }
};
