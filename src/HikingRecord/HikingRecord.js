import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HikingListRecord = ({ userNo }) => {
  const [hikingList, setHikingList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    userNo = 1;
    axios.post(`http://localhost:8001/hikingGuide/react/getHikingListRecord/${userNo}`)
      .then(response => setHikingList(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, [userNo]);

  const handleSelect = (hrNo) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(hrNo)
        ? prevSelected.filter(item => item !== hrNo)
        : [...prevSelected, hrNo]
    );
  };

  const handleDeleteSelected = () => {
    axios.post('http://localhost:8001/hikingGuide/react/deleteHikingRecord', selectedItems)
      .then(() => {
        setHikingList(hikingList.filter(record => !selectedItems.includes(record.hrNo)));
        setSelectedItems([]); 
      })
      .catch(error => console.error('Error deleting records:', error));
  };

  return (
    <div>
      <h1>Hiking List Record</h1>
      {hikingList.length === 0 ? (
        <p>No records found</p>
      ) : (
        <>
          <button onClick={handleDeleteSelected} disabled={selectedItems.length === 0}>
            Delete Selected
          </button>
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>HR No</th>
                <th>User No</th>
                <th>Total Time</th>
                <th>User Distance</th>
                <th>Ascent Time</th>
                <th>Descent Time</th>
                <th>Hiking Date</th>
                <th>User Latitude</th>
                <th>User Longitude</th>
                <th>Hiking Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {hikingList.map(record => (
                <tr key={record.hrNo}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(record.hrNo)}
                      onChange={() => handleSelect(record.hrNo)}
                    />
                  </td>
                  <td>{record.hrNo}</td>
                  <td>{record.userNo}</td>
                  <td>{record.totalTime}</td>
                  <td>{record.userDistance}</td>
                  <td>{record.ascentTime}</td>
                  <td>{record.descentTime}</td>
                  <td>{record.hikingDate}</td>
                  <td>{record.userLatitude}</td>
                  <td>{record.userLongitude}</td>
                  <td>{record.hikingDifficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default HikingListRecord;