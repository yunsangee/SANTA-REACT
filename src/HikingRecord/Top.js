import React from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import '../css/style.css'; // Assuming you have a corresponding CSS file

const Top = () => {
  const javaServerIp = process.env.REACT_APP_JAVA_SERVER_IP;
  const reactServerIp = process.env.REACT_APP_REACT_SERVER_IP;
  const navigate = useNavigate();

  const handleNavigation = (url) => {
    window.location.href = url;
  };

  return (
    <div className="container-fluid fixed-top custom-navbar">
      <div className="container px-0">
        <nav className="navbar navbar-light bg-white navbar-expand-xl">
          <h1
            id="logoName"
            className="custom-logo"
            onClick={() => handleNavigation(`http://${javaServerIp}/`)}
          >
            SANTA
          </h1>
          <button
            className="navbar-toggler py-2 px-3"
            type="button"
            data-toggle="collapse"
            data-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="fa fa-bars text-primary"></span>
          </button>
          <div className="collapse navbar-collapse bg-white" id="navbarCollapse">
            <div className="navbar-nav mx-auto custom-nav-links">
              <a
                href="#"
                id="Home"
                className="nav-item nav-link active custom-link"
                onClick={() => handleNavigation(`http://${javaServerIp}/`)}
              >
                홈
              </a>
              <a
                href="#"
                id="mountain"
                className="nav-item nav-link custom-link"
                onClick={() =>
                  handleNavigation(`http://${javaServerIp}/mountain/searchMountain`)
                }
              >
                산
              </a>
              <a
                href="#"
                id="certificationPost"
                className="nav-item nav-link custom-link"
                onClick={() =>
                  handleNavigation(`http://${javaServerIp}/certificationPost/listCertificationPost`)
                }
              >
                인증게시판
              </a>
              <a
                href="#"
                id="meetingPost"
                className="nav-item nav-link custom-link"
                onClick={() =>
                  handleNavigation(`http://${javaServerIp}/meetingPost/getMeetingPostList`)
                }
              >
                모임게시판
              </a>
              <a
                href="#"
                id="hikingGuide"
                className="nav-item nav-link custom-link"
                onClick={() => handleNavigation(`http://${reactServerIp}`)}
              >
                등산안내
              </a>
            </div>
            <div className="d-flex m-3 me-0 custom-login">
              {sessionStorage.getItem('user') ? (
                <a href="#" className="my-auto">
                  <i
                    id="userProfile"
                    className="fas fa-user fa-2x"
                    onClick={() =>
                      handleNavigation(`http://${javaServerIp}/mountain/searchMountain`)
                    }
                  ></i>
                </a>
              ) : (
                <a href="#" className="my-auto">
                  <i
                    id="loginButton"
                    className="fas fa-sign-in-alt fa-1x custom-link"
                    onClick={() => handleNavigation(`http://${javaServerIp}/user/login`)}
                  >
                    {' '}
                    로그인
                  </i>
                </a>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Top;
