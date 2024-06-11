import React, { useEffect } from 'react';

const Mountain = ({ setMountains }) => {
  useEffect(() => {
    const fetchMountains = async () => {
      try {
        const response = await fetch('http://localhost:8001/hikingGuide/react/getMountain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
          })
        });

        if (response.ok) {
          const data = await response.json();
          setMountains(data);
        } else {
          console.error('Failed to fetch mountain data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchMountains();
  }, [setMountains]);

  return null; 
};

export default Mountain;
