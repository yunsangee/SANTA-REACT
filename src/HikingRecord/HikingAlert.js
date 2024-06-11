import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HikingAlert = ({ userNo }) => {
    const [alertSettings, setAlertSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meetingTime,setMeetingTime] = useState(null);

    useEffect(() => {
        const fetchAlertSettings = async () => {
            try {
                const response = await axios.post(`http://localhost:8001/hikingGuide/react/getAlertSetting/${userNo}`);
                setAlertSettings(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchAlertSettings();
    }, [userNo]);

    console.log(alertSettings)
    const handleToggle = (setting) => {
        setAlertSettings({
            ...alertSettings,
            [setting]: !alertSettings[setting],
        });
    };

    const saveSettings = async () => {
        try {
            await axios.post('/react/updateAlertSetting', {
                userNo,
                ...alertSettings,
            });
            alert('Settings updated successfully');
        } catch (error) {
            alert('Failed to update settings');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading alert settings</div>;

    return (
        <div>
            <h1>Alert Settings</h1>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={alertSettings.hg_setting}
                        onChange={() => handleToggle('hg_setting')}
                    />
                    HG Setting
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={alertSettings.destination_setting}
                        onChange={() => handleToggle('destination_setting')}
                    />
                    Destination Setting
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={alertSettings.sunset_setting}
                        onChange={() => handleToggle('sunset_setting')}
                    />
                    Sunset Setting
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={alertSettings.location_over_setting}
                        onChange={() => handleToggle('location_over_setting')}
                    />
                    Location Over Setting
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={alertSettings.time_alert_setting}
                        onChange={() => handleToggle('time_alert_setting')}
                    />
                    Time Alert Setting
                </label>
            </div>
            <div>
                <label>
                    Meeting Time: {alertSettings.meetingTime}
                </label>
            </div>
           
            <button onClick={saveSettings}>Save Settings</button>
        </div>
    );
};

export default HikingAlert;
