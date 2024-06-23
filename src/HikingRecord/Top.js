import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../css/Top.css';

const Top = () => {
  const javaServerIp = process.env.REACT_APP_JAVA_SERVER_IP;
  const reactServerIp = process.env.REACT_APP_REACT_SERVER_IP;
  const navigate = useNavigate();

  const handleNavigation = (url) => {
    window.location.href = url;
  };

  return (
    <div className="container-fluid fixed-top px-0">
      <nav className="navbar navbar-expand-xl navbar-light bg-white shadow-sm w-100">
        <div className="container">
          <h1
            id="logoName"
            className="navbar-brand mb-0"
            onClick={() => handleNavigation(`https://${javaServerIp}/`)}
            style={{ color: "rgb(80, 190, 80)", fontWeight: "bold", cursor: 'pointer' }}
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
                  className="nav-link active"
                  onClick={() => handleNavigation(`https://${javaServerIp}/`)}
                  style={{ color: "rgb(80, 190, 80)" }}
                >
                  홈
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="mountain"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${javaServerIp}/mountain/searchMountain`)}
                >
                  산
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="certificationPost"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${javaServerIp}/certificationPost/listCertificationPost`)}
                >
                  인증게시판
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="meetingPost"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${javaServerIp}/meetingPost/getMeetingPostList`)}
                >
                  모임게시판
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  id="hikingguide"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${reactServerIp}`)}
                >
                  등산안내
                </a>
              </li>
            </ul>
            <div className="d-flex justify-content-center">
              {sessionStorage.getItem('user') ? (
                <a href="#" className="my-auto">
                  <i
                    id="userProfile"
                    className="fas fa-user fa-2x"
                    onClick={() => handleNavigation(`https://${javaServerIp}/mountain/searchMountain`)}
                    style={{ color: "rgb(80, 190, 80)" }}
                  ></i>
                </a>
              ) : (
                <a href="#" className="my-auto">
                  <i
                    id="loginButton"
                    className="fas fa-sign-in-alt fa-1x"
                    onClick={() => handleNavigation(`https://${javaServerIp}/user/login`)}
                    style={{ color: "rgb(80, 190, 80)" }}
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
    </div>
  );
};

export default Top;
