import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import $ from 'jquery';
import Cookies from 'js-cookie';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Top = () => {
  const javaServerIp = 'https://www.dearmysanta.site';
  const reactServerIp = 'https://www.dearmysanta.site/hikingguide'; 
  const navigate = useNavigate();
  const userNo = Cookies.get('userNo');
  const userName = Cookies.get('nickName');  // 쿠키에서 닉네임을 가져옴
  const userId = Cookies.get('userId');
  const [showFullNavbar, setShowFullNavbar] = useState(true);

  const handleNavigation = (url) => {
    window.location.href = url;
  };

  const handleLogout = () => {
    Cookies.remove('userNo');
    Cookies.remove('userName');
    Cookies.remove('userId');  // 로그아웃 시 닉네임 쿠키도 제거
    handleNavigation(`${javaServerIp}`);
  };

  const fetchPostCounts = async () => {
    try {
      const response = await axios.get(`${javaServerIp}/userEtc/rest/getCount`, {
        withCredentials: true 
      });
      console.log('fetchPostCounts response:', response.data);
      sessionStorage.setItem('meetingCount', response.data.meetingPostCount);
      sessionStorage.setItem('certificationCount', response.data.certificationPostCount);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    }
  };

  const updateAlarmSetting = async (userNo, alarmSettingType) => {
    try {
      const response = await axios.get(`${javaServerIp}/userEtc/rest/updateAlarmSetting`, {
        params: { userNo, alarmSettingType },
        withCredentials: true 
      });
      console.log('updateAlarmSetting response:', response.data);
    } catch (error) {
      console.error('Error updating alarm settings:', error);
    }
  };

  const handleBellClick = () => {
    if (userNo) {
      updateAlarmSetting(userNo, 0); 
    } else {
      alert('Please log in to update alarm settings');
    }
  };

  useEffect(() => {
    fetchPostCounts();

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowFullNavbar(false);
      } else {
        setShowFullNavbar(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    $(function() {
      const currentUrl = window.location.pathname;
      const pathParts = currentUrl.split('/');
      let startPathPart = pathParts[1];

      if (startPathPart === "") {
        startPathPart = "home";
      }

      $('.nav-link').removeClass('active');
      $(`.${startPathPart}`).addClass('active');

      $('#logoName').on('click', () => handleNavigation(`${javaServerIp}/`));
      $('#mountain').on('click', () => handleNavigation(`${javaServerIp}/mountain/searchMountain`));
      $('#certificationPost').on('click', () => handleNavigation(`${javaServerIp}/certificationPost/listCertificationPost`));
      $('#meetingPost').on('click', () => handleNavigation(`${javaServerIp}/meeting/getMeetingPostList`));
      $('#hikingGuide').on('click', () => handleNavigation(`${reactServerIp}`));
      $('#meetingChat').on('click', () => handleNavigation(`${javaServerIp}/chatting/getChattingRoomList`));
      $('#loginButton').on('click', () => handleNavigation(`${javaServerIp}/user/login`));
      $('#userProfile').on('click', () => handleNavigation(`${javaServerIp}/mountain/searchMountain`));
      $('#getUserList').on('click', () => handleNavigation(`${javaServerIp}/user/getUserList`));
      $('#statistics').on('click', () => handleNavigation(`${javaServerIp}/mountain/getStatistics`));
      $('#correctionPost').on('click', () => handleNavigation(`${javaServerIp}/correctionPost/getCorrectionPostList`));
      $('#myInfo').on('click', () => handleNavigation(`${javaServerIp}/user/getUser`));
      $('#myMeetingPost').on('click', () => handleNavigation(`${javaServerIp}/meeting/getMeetingPostList`));
      $('#myCertificationPost').on('click', () => handleNavigation(`${javaServerIp}/certificationPost/getCertificationPostList`));
      $('#myMountainLike').on('click', () => handleNavigation(`${javaServerIp}/mountain/getMountainLikeList?userNo=${userNo}`));
      $('#mySchedule').on('click', () => handleNavigation(`${javaServerIp}/user/getScheduleList`));
      $('#myHikingRecord').on('click', () => handleNavigation(`${javaServerIp}/hikingguide/HikingRecord`));
      $('#qna').on('click', () => handleNavigation(`${javaServerIp}/user/getQnAList`));
      $('#logout').on('click', handleLogout);

      $('.dropdown-toggle').on('click', function(event) {
        event.stopPropagation();
        let dropdownMenu = $(this).next('.dropdown-menu');
        if (dropdownMenu.hasClass('show')) {
          dropdownMenu.removeClass('show');
        } else {
          $('.dropdown-menu').removeClass('show'); 
          dropdownMenu.addClass('show'); 
        }
      });

      $(document).on('click', function(event) {
        if (!$(event.target).closest('.dropdown').length) {
          $('.dropdown-menu').removeClass('show');
        }
      });

      $(document).on('click', '.close-icon', function(event) {
        event.preventDefault();
        event.stopPropagation();
        let alarmNo = $(this).parent().find('#alarmNo').val();
        $.ajax({
          url: `/userEtc/rest/deleteAlarmMessage?alarmNo=${alarmNo}`,
          method: 'GET',
          success: function(response) {
            console.log('deleteAlarmMessage response:', response);
            $(this).closest('.dropdown-item').remove();
          },
          error: function(xhr, status, error) {
            console.error('Error deleting alarm message:', error);
          }
        });
      });

      $('#settingsIcon').on('click', function() {
        let modal = $('#settingsModal');
        if (modal.css('display') === 'none' || modal.css('display') === '') {
          modal.css('display', 'block');
        } else {
          modal.css('display', 'none');
        }
      });

      $('.form-switch').on('click', function(event) {
        event.stopPropagation();
      });

      $('#flexSwitchAllAlert').on('click', function() {
        let userNo = sessionStorage.getItem('userNo');
        let alarmSettingType = 0;
        $.ajax({
          url: `/userEtc/rest/updateAlarmSetting?userNo=${userNo}&alarmSettingType=${alarmSettingType}`,
          method: 'GET',
          success: function(response) {
            console.log('updateAlarmSetting response:', response);
            window.location.reload();
          }
        });
      });

      $('#flexSwitchCertificationPostAlert').on('click', function() {
        let userNo = sessionStorage.getItem('userNo');
        let alarmSettingType = 1;
        $.ajax({
          url: `/userEtc/rest/updateAlarmSetting?userNo=${userNo}&alarmSettingType=${alarmSettingType}`,
          method: 'GET',
          success: function(response) {
            console.log('updateAlarmSetting response:', response);
            window.location.reload();
          }
        });
      });

      $('#flexSwitchMeetingPostAlert').on('click', function() {
        let userNo = sessionStorage.getItem('userNo');
        let alarmSettingType = 2;
        $.ajax({
          url: `/userEtc/rest/updateAlarmSetting?userNo=${userNo}&alarmSettingType=${alarmSettingType}`,
          method: 'GET',
          success: function(response) {
            console.log('updateAlarmSetting response:', response);
            window.location.reload();
          }
        });
      });

      $('#flexSwitchHikingGuideAlert').on('click', function() {
        let userNo = sessionStorage.getItem('userNo');
        let alarmSettingType = 3;
        $.ajax({
          url: `/userEtc/rest/updateAlarmSetting?userNo=${userNo}&alarmSettingType=${alarmSettingType}`,
          method: 'GET',
          success: function(response) {
            console.log('updateAlarmSetting response:', response);
          }
        });
      });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userNo]);

  const profileImage = Cookies.get('profile');
  const profileImageUrl = profileImage ? `${profileImage}` : '';

  return (
    <div className="container-fluid fixed-top px-0">
      <nav className={`navbar navbar-expand-xl navbar-light bg-white shadow-sm w-100 navbar-custom ${showFullNavbar ? '' : 'navbar-shrink'}`}>
        <div className="container">
          <h1
            id="logoName"
            className="navbar-brand mb-0 logo-name"
            onClick={() => handleNavigation(`${javaServerIp}/`)}
          >
            SANTA
          </h1>
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
                <a
                  href="#"
                  id="Home"
                  className="nav-link nav-link-custom home"
                  onClick={() => handleNavigation(`${javaServerIp}/`)}
                >
                  홈
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="mountain"
                  className="nav-link nav-link-custom mountain"
                  onClick={() => handleNavigation(`${javaServerIp}/mountain/searchMountain`)}
                >
                  산
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="certificationPost"
                  className="nav-link nav-link-custom certificationPost"
                  onClick={() => handleNavigation(`${javaServerIp}/certificationPost/listCertificationPost`)}
                >
                  인증게시판
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="meetingPost"
                  className="nav-link nav-link-custom meeting"
                  onClick={() => handleNavigation(`${javaServerIp}/meeting/getMeetingPostList`)}
                >
                  모임게시판
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="meetingChat"
                  className="nav-link nav-link-custom chatting"
                  onClick={() => handleNavigation(`${javaServerIp}/chatting/getChattingRoomList`)}
                >
                  모임채팅
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="hikingGuide"
                  className="nav-link nav-link-custom hikingGuide"
                  onClick={() => handleNavigation(`${reactServerIp}`)}
                >
                  등산안내
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="qna"
                  className="nav-link nav-link-custom qna"
                  onClick={() => handleNavigation(`${javaServerIp}/user/getQnAList`)}
                >
                  Q&A
                </a>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              {userNo ? (
                <>
                  <div className="dropdown">
                    <a className="dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <img src={profileImageUrl} alt="User Image" className="user-image"/>
                    </a>
                    <div className="dropdown-menu dropdown-menu-right profile dropdown-menu-custom" aria-labelledby="navbarDropdown">
                      <div className="dropdown-header dropdown-header-custom d-flex align-items-center">
                        <img src={profileImageUrl} alt="User Image"/>
                        <div className="info ml-2">
                          <div className="name">{userName}</div>  
                          <div className='email'>{userId}</div>
                        </div>
                        <i className="fas fa-cog setting-icon" id="settingsIcon"></i>
                      </div>
                      <a className="dropdown-item dropdown-item-custom" href="#"><i className="fas fa-certificate"></i> 인증 {sessionStorage.getItem('certificationCount')}회, 모임 {sessionStorage.getItem('meetingCount')}회 </a>
                      <a className="dropdown-item dropdown-item-custom" id="myInfo" href="#"><i className="fas fa-user"></i> 내 정보보기</a>
                      <a className="dropdown-item dropdown-item-custom" id="myMeetingPost" href="#"><i className="fas fa-users"></i> 내가 쓴 모임 게시글 보기</a>
                      <a className="dropdown-item dropdown-item-custom" id="myCertificationPost" href="#"><i className="fas fa-check-circle"></i> 내가 쓴 인증 게시글 보기</a>
                      <a className="dropdown-item dropdown-item-custom" id="myMountainLike" href="#"><i className="fas fa-heart"></i> 내가 좋아요 한 산 보기</a>
                      <a className="dropdown-item dropdown-item-custom" id="mySchedule" href="#"><i className="fas fa-calendar-alt"></i> 내 일정 보기</a>
                      <a className="dropdown-item dropdown-item-custom" id="myHikingRecord" href="#"><i className="fas fa-hiking"></i> 등산 기록 보기</a>
                      <a className="dropdown-item dropdown-item-custom" id="logout" href="#" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> 로그아웃</a>
                    </div>
                  </div>
                  {/* <i className="fas fa-bell user-profile-icon" onClick={handleBellClick} style={{ marginLeft: '15px', fontSize: '20px', color: 'rgb(60, 170, 60)' }} /> */}
                </>
              ) : (
                <a href="#" className="my-auto">
                  <i
                    id="loginButton"
                    className="fas fa-sign-in-alt fa-1x login-button-icon"
                    onClick={() => handleNavigation(`${javaServerIp}/user/login`)}
                  >
                    {' '}
                    로그인
                  </i>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="container alarmSettings" id="settingsModal" style={{display: 'none', position: 'absolute', top: '65%', marginLeft: '5px', right: 0, background: 'white', border: '1px solid #ccc', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)'}}>
        <h6>알림 설정</h6>
        <div className="form-group">
          <label className="d-flex align-items-center">
            전체알림
            <div className="form-check form-switch ml-auto">
              <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchAllAlert"
                defaultChecked={sessionStorage.getItem('allAlertSetting') == 1}/>
              <label className="form-check-label" htmlFor="flexSwitchAllAlert"></label>
            </div>
          </label>
        </div>
        <div className="form-group">
          <label className="d-flex align-items-center">
            인증 게시글 알림
            <div className="form-check form-switch ml-auto">
              <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCertificationPostAlert"
                defaultChecked={sessionStorage.getItem('certificationPostAlertSetting') == 1}/>
              <label className="form-check-label" htmlFor="flexSwitchCertificationPostAlert"></label>
            </div>
          </label>
        </div>
        <div className="form-group">
          <label className="d-flex align-items-center">
            모임 게시글 알림
            <div className="form-check form-switch ml-auto">
              <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchMeetingPostAlert"
                defaultChecked={sessionStorage.getItem('meetingPostAlertSetting') == 1}/>
              <label className="form-check-label" htmlFor="flexSwitchMeetingPostAlert"></label>
            </div>
          </label>
        </div>
        <div className="form-group">
          <label className="d-flex align-items-center">
            등산 안내 알림
            <div className="form-check form-switch ml-auto">
              <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchHikingGuideAlert"
                defaultChecked={sessionStorage.getItem('hikingGuideAlertSetting') == 1}/>
              <label className="form-check-label" htmlFor="flexSwitchHikingGuideAlert"></label>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Top;
