import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Toggle from 'react-toggle';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '25px',
        lineHeight: '1.8',
        margin: '20px'
    },
    alertSetting: {
        marginBottom: '30px',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '25px',
        marginBottom: '10px'
    },
    labelSpan: {
        marginRight: '20px'
    },
    hr: {
        marginTop: '10px',
        marginBottom: '30px',
        border: 'none',
        borderTop: '5px solid #4CAF50'
    },
    timeInput: {
        fontSize: '25px',
        padding: '10px',
        marginLeft: '10px'
    },
    saveButton: {
        fontSize: '20px',
        padding: '15px 30px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    saveButtonHover: {
        backgroundColor: '#45a049'
    }
};

const HikingAlert = () => {
    const [alertSettings, setAlertSettings] = useState({
        hikingAlertFlag: 0,
        destinationAlert: 0,
        sunsetAlert: 0,
        locationOverAlert: 0,
        meetingTimeAlert: 0,
        meetingTime: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userNo, setUserNo] = useState(null);

    useEffect(() => {
        const userNoFromCookie = Cookies.get('userNo');
        setUserNo(userNoFromCookie);

        const fetchAlertSettings = async () => {
            try {
                const response = await axios.post(`https://www.dearmysanta.site/hiking/react/getAlertSetting/${userNoFromCookie}`);
                console.log(response.data); // Print the values received to the console
                
                // Map response data to toggle states
                setAlertSettings({
                    hikingAlertFlag: response.data.hikingAlertFlag,
                    destinationAlert: response.data.destinationAlert,
                    sunsetAlert: response.data.sunsetAlert,
                    locationOverAlert: response.data.locationOverAlert,
                    meetingTimeAlert: response.data.meetingTimeAlert,
                    meetingTime: response.data.meetingTime
                });
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        if (userNoFromCookie) {
            fetchAlertSettings();
        }
    }, []);

    const handleToggle = (setting) => {
        setAlertSettings({
            ...alertSettings,
            [setting]: alertSettings[setting] === 1 ? 0 : 1,
        });
    };

    const handleMeetingTimeChange = (event) => {
        setAlertSettings({
            ...alertSettings,
            meetingTime: event.target.value,
        });
    };
    const saveSettings = async () => {
        try {
          // Update alert settings
          const alertPayload = {
            hikingAlertFlag: alertSettings.hikingAlertFlag,
            destinationAlert: alertSettings.destinationAlert,
            sunsetAlert: alertSettings.sunsetAlert,
            locationOverAlert: alertSettings.locationOverAlert,
            meetingTimeAlert: alertSettings.meetingTimeAlert,
            userNo: userNo
          };
      
          await axios.post(`https://www.dearmysanta.site/hiking/react/updateAlertSetting/${userNo}`, alertPayload);
      
          // Update meeting time
          const meetingTimePayload = {
            meetingTimeAlert: alertSettings.meetingTimeAlert,
            meetingTime: alertSettings.meetingTime
          };
      
          await axios.post(`https://www.dearmysanta.site/hiking/react/updateMeetingTime/${userNo}`, meetingTimePayload);
      
          Swal.fire({
            icon: 'success',
            title: '설정 되었습니다~',
            showConfirmButton: false,
            timer: 1500
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: '다시 시도해주세요',
            text: error.message,
            showConfirmButton: false,
            timer: 1500
          });
        }
      };
      

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading alert settings</div>;

    return (
        <div style={styles.container}>
            <h1>등산 안내 알림 설정</h1>
            <br /><br />
            <div style={styles.alertSetting}>
                <label style={styles.label}>
                    <span style={styles.labelSpan}>전체 알림</span>
                    <Toggle
                        checked={alertSettings.hikingAlertFlag === 1}
                        onChange={() => handleToggle('hikingAlertFlag')}
                    />
                </label>
                <hr style={styles.hr} />
            </div>
            <div style={styles.alertSetting}>
                <label style={styles.label}>
                    <span style={styles.labelSpan}>목적지까지 거리 알림</span>
                    <Toggle
                        checked={alertSettings.destinationAlert === 1}
                        onChange={() => handleToggle('destinationAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div style={styles.alertSetting}>
                <label style={styles.label}>
                    <span style={styles.labelSpan}>일몰 시간 알림</span>
                    <Toggle
                        checked={alertSettings.sunsetAlert === 1}
                        onChange={() => handleToggle('sunsetAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div style={styles.alertSetting}>
                <label style={styles.label}>
                    <span style={styles.labelSpan}>위치 이탈 알림</span>
                    <Toggle
                        checked={alertSettings.locationOverAlert === 1}
                        onChange={() => handleToggle('locationOverAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div style={styles.alertSetting}>
                <label style={styles.label}>
                    <span style={styles.labelSpan}>모임/개인 시간 설정 알림</span>
                    <Toggle
                        checked={alertSettings.meetingTimeAlert === 1}
                        onChange={() => handleToggle('meetingTimeAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div style={styles.alertSetting}>
                <label style={styles.label}>
                    <span style={styles.labelSpan}>모임/개인 시간 설정</span>
                    <input
                        type="time"
                        value={alertSettings.meetingTime}
                        onChange={handleMeetingTimeChange}
                        disabled={alertSettings.hikingAlertFlag === 0 || alertSettings.meetingTimeAlert === 0}
                        style={styles.timeInput}
                    />
                </label>
            </div>
            <button
                style={styles.saveButton}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.saveButtonHover.backgroundColor}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.saveButton.backgroundColor}
                onClick={saveSettings}
            >
                설정 저장하기
            </button>
        </div>
    );
};

export default HikingAlert;
