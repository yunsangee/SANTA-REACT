import { createCustomOverlay } from './CustomOverlay';

export const displayTrailInfo = (map, trails, naver) => {
  const CustomOverlay = createCustomOverlay(naver);
  const customOverlays = [];
  const markers = [];
  const markerSize = 10; // Small size marker
  const offsetStep = 20; // Offset step to separate overlapping markers and overlays
  let blinkingPolyline = null;
  let blinkInterval = null;
  const minZoomLevel = 15; // Minimum zoom level to display trail info

  // Add zoom_changed event listener to the map
  naver.maps.Event.addListener(map, 'zoom_changed', () => {
    const zoomLevel = map.getZoom();
    customOverlays.forEach((customOverlay) => {
      if (zoomLevel >= minZoomLevel) {
        customOverlay.setMap(map);
        customOverlay._element.querySelector('.card-body').style.display = 'block';
      } else {
        customOverlay.setMap(null);
        customOverlay._element.querySelector('.card-body').style.display = 'none';
      }
    });

    markers.forEach((firstMarker) => {
      if (zoomLevel >= minZoomLevel) {
        firstMarker.setMap(map);
      } else {
        firstMarker.setMap(null);
      }
    });
  });

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
      <div class="card text-dark bg-light" style="${getCardStyle(index)}" 
      onclick="window.zoomToTrail(${trail.mountainTrailCoordinates[0][0]}, ${trail.mountainTrailCoordinates[0][1]});
      window.setTrailDifficulty('${trail.mountainTrailDifficulty}');
      window.setSelectedTrailEnd({latitude: ${lastCoordinate[0]}, longitude: ${lastCoordinate[1]}});
      window.setTrailCoordinates(${JSON.stringify(trail.mountainTrailCoordinates)});
      window.setSelectedTrailLength(${trail.mountainTrailLength});
      window.setSelectedTrailAscent(${trail.expectedAscentTime});
      window.setSelectedTrailDescent(${trail.descentTime});
      window.blinkPolyline(${index});
      console.log('Last coordinate of the trail:', {latitude: ${lastCoordinate[0]}, longitude: ${lastCoordinate[1]}});">
        <div class="card-body p-2" style="display: none;">
          <h6 class="card-title mb-1">등산난이도: ${trailDifficultyText}</h6>
          <p class="card-text mb-1"><strong>길이:</strong> ${trail.mountainTrailLength}m</p>
          <p class="card-text mb-1"><strong>등산시간:</strong> ${trail.expectedAscentTime}min</p>
          <p class="card-text mb-1"><strong>하산시간:</strong> ${trail.descentTime}min</p>
        </div>
      </div>
    `;

    const customOverlay = new CustomOverlay({
      content: customOverlayContent,
      position: path[0],
      map: null,
      offset: { x: 0, y: -markerSize - offsetStep * index } // Apply an offset to separate overlapping markers and overlays
    });

    customOverlays.push(customOverlay);

    // Add a small marker at the first coordinate of the trail with an offset
    const firstCoordinate = trail.mountainTrailCoordinates[0];
    const firstMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(firstCoordinate[0], firstCoordinate[1]),
      map: null,
      icon: {
        url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
        scaledSize: new naver.maps.Size(markerSize, markerSize)
      },
      zIndex: 100 + index // Ensure markers are drawn above the polyline
    });

    markers.push(firstMarker);
  });

  window.blinkPolyline = (index) => {
    if (blinkingPolyline) {
      clearInterval(blinkInterval);
      blinkingPolyline.setVisible(true); // Ensure the last blinking polyline is visible
    }
    blinkingPolyline = customOverlays[index].polyline;
    console.log('Blinking polyline:', blinkingPolyline);
    blinkInterval = setInterval(() => {
      if (blinkingPolyline) {
        blinkingPolyline.setVisible(!blinkingPolyline.getVisible());
      }
    }, 500); // Toggle visibility every 500ms
  };

  // Initialize overlay visibility based on current zoom level
  const currentZoomLevel = map.getZoom();
  customOverlays.forEach((customOverlay) => {
    if (currentZoomLevel >= minZoomLevel) {
      customOverlay.setMap(map);
      customOverlay._element.querySelector('.card-body').style.display = 'block';
    } else {
      customOverlay.setMap(null);
      customOverlay._element.querySelector('.card-body').style.display = 'none';
    }
  });

  markers.forEach((firstMarker) => {
    if (currentZoomLevel >= minZoomLevel) {
      firstMarker.setMap(map);
    } else {
      firstMarker.setMap(null);
    }
  });

  return { customOverlays, markers };
};

export const clearTrailInfo = ({ customOverlays, markers }) => {
  customOverlays.forEach((customOverlay) => {
    customOverlay.setMap(null);
  });
  markers.forEach((firstMarker) => {
    firstMarker.setMap(null);
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

// Helper function to generate card style
const getCardStyle = (index) => `
  width: 14rem; 
  padding: 8px; 
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); 
  cursor: pointer; 
  z-index: ${1000 + index};
  border: 1px solid black; /* 검은색 선 추가 */
`;
