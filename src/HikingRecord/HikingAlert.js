import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import '../css/style.css';

const HikingAlert = ({ userNo }) => {
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

    useEffect(() => {
        const fetchAlertSettings = async () => {
            try {
                const response = await axios.post(`https://www.dearmysanta.site/hiking/react/getAlertSetting/${userNo}`);
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
        fetchAlertSettings();
    }, [userNo]);

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

            alert('설정 되었습니다~');
        } catch (error) {
            alert('다시 시도해주세요');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading alert settings</div>;

    return (
        <div className="hiking-alert-container">
            <h1>등산 안내 알림 설정</h1>
            <br/><br/>
            <div className="alert-setting hg-setting">
                <label>
                    <span>전체 알림</span>
                    <Toggle
                        checked={alertSettings.hikingAlertFlag === 1}
                        onChange={() => handleToggle('hikingAlertFlag')}
                    />
                </label>
                <hr />
            </div>
            <div className="alert-setting">
                <label>
                    <span>목적지까지 거리 알림</span>
                    <Toggle
                        checked={alertSettings.destinationAlert === 1}
                        onChange={() => handleToggle('destinationAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div className="alert-setting">
                <label>
                    <span>일몰 시간 알림</span>
                    <Toggle
                        checked={alertSettings.sunsetAlert === 1}
                        onChange={() => handleToggle('sunsetAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div className="alert-setting">
                <label>
                    <span>위치 이탈 알림</span>
                    <Toggle
                        checked={alertSettings.locationOverAlert === 1}
                        onChange={() => handleToggle('locationOverAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div className="alert-setting">
                <label>
                    <span>모임/개인 시간 설정 알림</span>
                    <Toggle
                        checked={alertSettings.meetingTimeAlert === 1}
                        onChange={() => handleToggle('meetingTimeAlert')}
                        disabled={alertSettings.hikingAlertFlag === 0}
                    />
                </label>
            </div>
            <div className="alert-setting">
                <label>
                    <span>모임/개인 시간 설정</span>
                    <input
                        type="time"
                        value={alertSettings.meetingTime}
                        onChange={handleMeetingTimeChange}
                        disabled={alertSettings.hikingAlertFlag === 0 || alertSettings.meetingTimeAlert === 0}
                    />
                </label>
            </div>
            <button className="save-button" onClick={saveSettings}>설정 저장하기</button>
        </div>
    );
};

export default HikingAlert;