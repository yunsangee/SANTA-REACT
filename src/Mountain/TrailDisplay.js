export const displayTrailInfo = (map, trails, naver, currentZoom) => {
  const customOverlays = [];
  const markerSize = 18; // Small size marker
  let blinkingPolyline = null;
  let blinkInterval = null;
  let openInfoWindow = null; // Currently open InfoWindow

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
    if (trail.mountainTrailDifficulty === '0') {
      trailDifficultyText = '쉬움';
    } else if (trail.mountainTrailDifficulty === '1') {
      trailDifficultyText = '보통';
    } else if (trail.mountainTrailDifficulty === '2') {
      trailDifficultyText = '어려움';
    }

    const lastCoordinate = trail.mountainTrailCoordinates.slice(-1)[0];

    // Add a small marker at the first coordinate of the trail with an offset
    const firstCoordinate = trail.mountainTrailCoordinates[0];
    console.log('First coordinate:', firstCoordinate); // Debug log

    const firstMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(firstCoordinate[0], firstCoordinate[1]),
      map: map,
      icon: {
        url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank.png',
        scaledSize: new naver.maps.Size(markerSize, markerSize)
      },
      zIndex: 100 + index // Ensure markers are drawn above the polyline
    });

    // Create InfoWindow for the marker
    const infoWindowContent = `
    <div style="padding: 15px; border-radius: 50px; background-color: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1); cursor: pointer; width: 180px;" onclick="window.handleInfoWindowClick(${trail.mountainTrailCoordinates[0][0]}, ${trail.mountainTrailCoordinates[0][1]}, '${trail.mountainTrailDifficulty}', ${lastCoordinate[0]}, ${lastCoordinate[1]}, ${JSON.stringify(trail.mountainTrailCoordinates)}, ${trail.mountainTrailLength}, ${trail.expectedAscentTime}, ${trail.descentTime}, ${trail.mountainTrailNo});">
      <h6 style="margin: 0; font-size: 16px; color: #4CAF50;">등산난이도: ${trailDifficultyText}</h6>
      <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>길이:</strong> ${trail.mountainTrailLength}m</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>등산시간:</strong> ${trail.expectedAscentTime}분</p>
      <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>하산시간:</strong> ${trail.descentTime}분</p>
    </div>
  `;
  
  
  
    const infoWindow = new naver.maps.InfoWindow({
      content: infoWindowContent,
      backgroundColor: "#fff",
      borderColor: "#333",
      borderWidth: 2,
      anchorSize: new naver.maps.Size(10, 10),
      anchorSkew: true,
      anchorColor: "#fff"
    });

    console.log('InfoWindow created:', infoWindow); // Debug log

    naver.maps.Event.addListener(firstMarker, 'click', () => {
      if (openInfoWindow) {
        openInfoWindow.close();
      }
      infoWindow.open(map, firstMarker);
      openInfoWindow = infoWindow;
    });

    // Always visible (no zoom level condition)
    customOverlays.push({ trailNo: trail.mountainTrailNo, polyline, infoWindow, firstMarker });
  });

  window.handleInfoWindowClick = (lat, lon, difficulty, lastLat, lastLon, coordinates, length, ascent, descent, trailNo) => {
    console.log('InfoWindow clicked. First coordinate:', lat, lon); 
    window.zoomToTrail(lat, lon);
    window.setTrailDifficulty(difficulty);
    window.setSelectedTrailEnd({latitude: lastLat, longitude: lastLon});
    window.setTrailCoordinates(coordinates);
    window.setSelectedTrailLength(length);
    window.setSelectedTrailAscent(ascent);
    window.setSelectedTrailDescent(descent);
    window.blinkPolyline(trailNo);
  };

  window.blinkPolyline = (trailNo) => {
    if (blinkingPolyline) {
      clearInterval(blinkInterval);
      blinkingPolyline.setVisible(true); // Ensure the last blinking polyline is visible
    }
    const overlay = customOverlays.find(overlay => overlay.trailNo === trailNo);
    if (overlay) {
      blinkingPolyline = overlay.polyline;
      blinkInterval = setInterval(() => {
        blinkingPolyline.setVisible(!blinkingPolyline.getVisible());
      }, 500); // Toggle visibility every 500ms
    }
  };

  window.stopBlinkingPolyline = () => {
    if (blinkingPolyline) {
      clearInterval(blinkInterval);
      blinkingPolyline.setVisible(true); // Ensure the polyline is visible when blinking stops
    }
  };

  return customOverlays;
};

export const clearTrailInfo = (overlays) => {
  overlays.forEach(({ polyline, infoWindow, firstMarker }) => {
    polyline.setMap(null);
    if (infoWindow) infoWindow.close(); // Close the InfoWindow if it exists
    if (firstMarker) firstMarker.setMap(null); // Remove the first marker if it exists
  });
};

// Expose a function to zoom to trail and set trail difficulty
window.zoomToTrail = (lat, lon) => {
  const latLng = new window.naver.maps.LatLng(lat, lon);
  if (window.map) {
    window.map.setCenter(latLng);
    window.map.setZoom(18);
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
