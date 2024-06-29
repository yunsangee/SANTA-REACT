import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import styled from 'styled-components';
import $ from 'jquery';
import Cookies from 'js-cookie';
import axios from 'axios';

const Navbar = styled.nav`
  height: 100px;
  border-bottom: 1px solid rgba(255, 255, 255, .1);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  transition: box-shadow 0.3s ease;
  
  .navbar-nav .nav-link {
    padding: 10px 15px;
    font-size: 16px;
    transition: .5s;
    color: black; /* Black color for other nav links */
  }

  .navbar-nav .nav-link:hover,
  .navbar-nav .nav-link.active,
  .fixed-top.bg-white .navbar-nav .nav-link:hover,
  .fixed-top.bg-white .navbar-nav .nav-link.active {
    color: rgb(60, 170, 60); /* Green color on hover and active */
  }

  .dropdown-toggle::after {
    border: none;
    content: "\\f107";
    font-family: "Font Awesome 5 Free";
    font-weight: 700;
    vertical-align: middle;
    margin-left: 8px;
  }

  @media (min-width: 1200px) {
    .nav-item .dropdown-menu {
      display: block;
      visibility: hidden;
      top: 100%;
      transform: rotateX(-75deg);
      transform-origin: 0% 0%;
      border: 0;
      transition: .5s;
      opacity: 0;
    }
  }

  .nav-item:hover .dropdown-menu {
    transform: rotateX(0deg);
    visibility: visible;
    background: var(--bs-light) !important;
    border-radius: 10px !important;
    transition: .5s;
    opacity: 1;
  }

  .dropdown-menu a:hover {
    background: var(--bs-secondary);
    color: var(--bs-primary);
  }
`;

const LogoName = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;
  color: rgb(60, 170, 60); /* Green color for the SANTA text */

  &:hover {
    color: rgb(80, 190, 80); /* Slightly different green color on hover */
  }
`;

const NavLink = styled.a`
  transition: color 0.3s ease;

  &:hover {
    color: rgb(60, 170, 60);
  }

  &.active {
    color: rgb(80, 190, 80);
    font-weight: bold;
  }
`;

const UserProfileIcon = styled.i`
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: rgb(60, 170, 60);
  }
`;

const LoginButtonIcon = styled.i`
  cursor: pointer;
  transition: color 0.3s ease;
  color: rgb(60, 170, 60); /* Green color for the login/logout text */

  &:hover {
    color: rgb(80, 190, 80);
  }
`;

const UserImage = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`;

const DropdownMenu = styled.div`
  width: 200px;
  left: -150px !important;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;

  img {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    margin-right: 5px;
  }

  .info {
    flex: 1;

    .name {
      font-weight: bold;
      font-size: 0.7em;
    }

    .email {
      font-size: 0.7em;
      color: #6c757d;
    }
  }

  .setting-icon {
    cursor: pointer;
  }
`;

const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  padding: 5px;

  i {
    margin-right: 5px;
    font-size: 0.7em;
  }

  .text {
    font-size: 0.7em;
  }
`;


const Top = () => {
  const javaServerIp = 'https://www.dearmysanta.site';
  const reactServerIp = 'https://www.dearmysanta.site/hikingguide';
  const navigate = useNavigate();
  const userNo = Cookies.get('userNo');

  const [meetingCount, setMeetingCount] = useState(sessionStorage.getItem('meetingCount') || 0);
  const [certificationCount, setCertificationCount] = useState(sessionStorage.getItem('certificationCount') || 0);
  const [alerts, setAlerts] = useState([]);

  const handleNavigation = (url) => {
    window.location.href = url;
  };

  const handleLogout = () => {
    Cookies.remove('userNo');
    window.location.reload();
  };

  const fetchPostCounts = async () => {
    try {
      const response = await axios.get(`${javaServerIp}/userEtc/rest/getCount`, {
        withCredentials: true 
      });
      console.log('fetchPostCounts response:', response.data);
      const { meetingPostCount, certificationPostCount } = response.data;
      sessionStorage.setItem('meetingCount', meetingPostCount);
      sessionStorage.setItem('certificationCount', certificationPostCount);
      setMeetingCount(meetingPostCount);
      setCertificationCount(certificationPostCount);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${javaServerIp}/userEtc/rest/getAlarmMessages`, {
        withCredentials: true
      });
      console.log('fetchAlerts response:', response.data);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const updateAlarmSetting = async (userNo, alarmSettingType) => {
    try {
      const response = await axios.get(`${javaServerIp}/userEtc/rest/updateAlarmSetting`, {
        params: { userNo, alarmSettingType },
        withCredentials: true 
      });
      console.log('updateAlarmSetting response:', response.data);
      alert('Alarm settings updated');
    } catch (error) {
      console.error('Error updating alarm settings:', error);
    }
  };

  const handleBellClick = () => {
    if (userNo) {
      fetchAlerts(); // 알림 메시지 가져오기
      const dropdownMenu = document.getElementById('alertDropdownMenu');
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    } else {
      alert('Please log in to update alarm settings');
    }
  };

  useEffect(() => {
    fetchPostCounts();

    $(function() {
      // jQuery 이벤트 리스너 설정 (생략)
    });
  }, [userNo]);

  const profileImage = Cookies.get('profile');
  const profileImageUrl = profileImage ? `${profileImage}` : '';

  return (
    <div className="container-fluid fixed-top px-0">
      <Navbar className="navbar navbar-expand-xl navbar-light bg-white shadow-sm w-100">
        <div className="container">
          <LogoName
            id="logoName"
            className="navbar-brand mb-0"
            onClick={() => handleNavigation(`${javaServerIp}/`)}
          >
            SANTA
          </LogoName>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav mx-auto mb-2 mb-xl-0">
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="Home"
                  className="nav-link active"
                  onClick={() => handleNavigation(`${javaServerIp}/`)}
                >
                  홈
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="mountain"
                  className="nav-link"
                  onClick={() => handleNavigation(`${javaServerIp}/mountain/searchMountain`)}
                >
                  산
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="certificationPost"
                  className="nav-link"
                  onClick={() => handleNavigation(`${javaServerIp}/certificationPost/listCertificationPost`)}
                >
                  인증게시판
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="meetingPost"
                  className="nav-link"
                  onClick={() => handleNavigation(`${javaServerIp}/meeting/getMeetingPostList`)}
                >
                  모임게시판
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  href="#"
                  id="meetingChat"
                  className="nav-link"
                  onClick={() => handleNavigation(`${javaServerIp}/chatting/getChattingRoomList`)}
                >
                  모임채팅
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  href="#"
                  id="hikingGuide"
                  className="nav-link"
                  onClick={() => handleNavigation(`${reactServerIp}`)}
                >
                  등산안내
                </NavLink>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              {userNo ? (
                <>
                  <div className="dropdown">
                    <a className="dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <UserImage src={profileImageUrl} alt="User Image"/>
                    </a>
                    <DropdownMenu className="dropdown-menu dropdown-menu-left profile" aria-labelledby="navbarDropdown">
                      <DropdownHeader className="dropdown-header">
                        <img src={profileImageUrl} alt="User Image"/>
                        <div className="info">
                          <div className="name">{sessionStorage.getItem('userName')}</div>
                          <div className="email">{sessionStorage.getItem('userId')}</div>
                        </div>
                        <i className="fas fa-cog setting-icon" id="settingsIcon"></i>
                      </DropdownHeader>
                      <DropdownItem className="dropdown-item" href="#"><i className="fas fa-certificate"></i> 인증 {certificationCount}회, 모임 {meetingCount}회 </DropdownItem>
                      <DropdownItem className="dropdown-item" id="myInfo" href="#"><i className="fas fa-user"></i> 내 정보보기 <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="myMeetingPost" href="#"><i className="fas fa-users"></i> 내가 쓴 모임 게시글 보기 <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="myCertificationPost" href="#"><i className="fas fa-check-circle"></i> 내가 쓴 인증 게시글 보기 <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="myMountainLike" href="#"><i className="fas fa-heart"></i> 내가 좋아요 한 산 보기 <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="mySchedule" href="#"><i className="fas fa-calendar-alt"></i> 내 일정 보기 <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="myHikingRecord" href="#"><i className="fas fa-hiking"></i> 등산 기록 보기 <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="qna" href="#"><i className="fas fa-question-circle"></i> Q&A <i className="fas fa-chevron-right"></i></DropdownItem>
                      <DropdownItem className="dropdown-item" id="logout" href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> 로그아웃 <i className="fas fa-chevron-right"></i></DropdownItem>
                    </DropdownMenu>
                  </div>
                  <div className="position-relative">
                    <UserProfileIcon className="fas fa-bell" onClick={handleBellClick} style={{ marginLeft: '15px', fontSize: '20px', color: 'rgb(60, 170, 60)' }} />
                    <AlarmDropdownMenu id="alertDropdownMenu">
                      {alerts.length > 0 ? (
                        alerts.map((alert, index) => (
                          <div className="dropdown-item" key={index}>
                            {alert.message}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item">알림 메시지가 없습니다.</div>
                      )}
                    </AlarmDropdownMenu>
                  </div>
                </>
              ) : (
                <a href="#" className="my-auto">
                  <LoginButtonIcon
                    id="loginButton"
                    className="fas fa-sign-in-alt fa-1x"
                    onClick={() => handleNavigation(`${javaServerIp}/user/login`)}
                  >
                    {' '}
                    로그인
                  </LoginButtonIcon>
                </a>
              )}
            </div>
          </div>
        </div>
      </Navbar>
    </div>
  );
};

export default Top;