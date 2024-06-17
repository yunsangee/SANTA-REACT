import { createCustomOverlay } from './CustomOverlay';

export const displayTrailInfo = (map, trails, naver) => {
  const CustomOverlay = createCustomOverlay(naver);
  const customOverlays = [];
  const markerSize = 10; // Small size marker
  const offsetStep = 20; // Offset step to separate overlapping markers and overlays

  trails.forEach((trail, index) => {
    const path = trail.mountainTrailCoordinates.map(coord => new naver.maps.LatLng(coord[0], coord[1]));

    // Set the color based on the trail difficulty
    let strokeColor;
    if (trail.mountainTrailDifficulty === '0') {
      strokeColor = '#FF0000'; // Red for easy
    } else if (trail.mountainTrailDifficulty === '1') {
      strokeColor = '#FFFF00'; // Yellow for normal
    } else if (trail.mountainTrailDifficulty === '2') {
      strokeColor = '#008000'; // Green for hard
    }

    const polyline = new naver.maps.Polyline({
      path: path,
      map: map,
      strokeColor: strokeColor,
      strokeWeight: 2
    });

    let trailDifficultyText = '';
    if (trail.mountainTrailDifficulty === '2') {
      trailDifficultyText = '쉬움';
    } else if (trail.mountainTrailDifficulty === '1') {
      trailDifficultyText = '보통';
    } else if (trail.mountainTrailDifficulty === '0') {
      trailDifficultyText = '어려움';
    }

    const lastCoordinate = trail.mountainTrailCoordinates.slice(-1)[0];

    const customOverlayContent = `
      <div style="
        font-size: 10px; 
        width: 200px; 
        padding: 10px; 
        background: white; 
        border: 1px solid black; 
        border-radius: 5px; 
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); 
        cursor: pointer;" 
      onclick="window.zoomToTrail(${trail.mountainTrailCoordinates[0][0]}, ${trail.mountainTrailCoordinates[0][1]});
      window.setTrailDifficulty('${trail.mountainTrailDifficulty}');
      window.setSelectedTrailEnd({latitude: ${lastCoordinate[0]}, longitude: ${lastCoordinate[1]}});
      window.setTrailCoordinates(${JSON.stringify(trail.mountainTrailCoordinates)});
      window.setSelectedTrailLength(${trail.mountainTrailLength});
      window.setSelectedTrailAscent(${trail.expectedAscentTime});
      window.setSelectedTrailDescent(${trail.descentTime});
      console.log('Last coordinate of the trail:', {latitude: ${lastCoordinate[0]}, longitude: ${lastCoordinate[1]}});">
        <p style="margin: 0;"><strong>등산난이도:</strong> ${trailDifficultyText}</p>
        <p style="margin: 0;"><strong>등산로길이:</strong> ${trail.mountainTrailLength} m</p>
        <p style="margin: 0;"><strong>예상등산시간:</strong> ${trail.expectedAscentTime} min</p>
        <p style="margin: 0;"><strong>예상하산시간:</strong> ${trail.descentTime} min</p>
      </div>
    `;

    const customOverlay = new CustomOverlay({
      content: customOverlayContent,
      position: path[0],
      map: map,
      offset: { x: 0, y: -markerSize - offsetStep * index } // Apply an offset to separate overlapping markers and overlays
    });

    customOverlays.push({ polyline, customOverlay });

    // Add a small marker at the first coordinate of the trail with an offset
    const firstCoordinate = trail.mountainTrailCoordinates[0];
    const firstMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(firstCoordinate[0], firstCoordinate[1]),
      map: map,
      icon: {
        url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
        scaledSize: new naver.maps.Size(markerSize, markerSize)
      },
      zIndex: 100 + index // Ensure markers are drawn above the polyline
    });

    customOverlays.push({ polyline, customOverlay, firstMarker });
  });

  return customOverlays;
};

export const clearTrailInfo = (overlays) => {
  overlays.forEach(({ polyline, customOverlay, firstMarker }) => {
    polyline.setMap(null);
    customOverlay.setMap(null);
    if (firstMarker) firstMarker.setMap(null); // Remove the first marker if it exists
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
  if (window.setSelectedTrailEndCoord) {
    window.setSelectedTrailEndCoord(endCoord);
  }
};

// Add function to set trail coordinates
window.setTrailCoordinates = (coords) => {
  if (window.setSelectedTrailCoordinates) {
    window.setSelectedTrailCoordinates(coords);
  }
};

window.setSelectedTrailLength = (length) => {
  if (window.setSelectedTrailLength) {
    window.setSelectedTrailLength(length);
  }
};

window.setSelectedTrailAscent = (ascent) => {
  if (window.setSelectedTrailAscent) {
    window.setSelectedTrailAscent(ascent);
  }
};

window.setSelectedTrailDescent = (descent) => {
  if (window.setSelectedTrailDescent) {
    window.setSelectedTrailDescent(descent);
  }
};
