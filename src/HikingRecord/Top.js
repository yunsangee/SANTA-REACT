import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import styled from 'styled-components';

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
  }

  .navbar-nav .nav-link:hover,
  .navbar-nav .nav-link.active,
  .fixed-top.bg-white .navbar-nav .nav-link:hover,
  .fixed-top.bg-white .navbar-nav .nav-link.active {
    color: var(--bs-primary);
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

  &:hover {
    color: rgb(60, 170, 60);
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

  &:hover {
    color: rgb(60, 170, 60);
  }
`;

const Top = () => {
  const javaServerIp = process.env.REACT_APP_JAVA_SERVER_IP;
  const reactServerIp = process.env.REACT_APP_REACT_SERVER_IP;
  const navigate = useNavigate();

  const handleNavigation = (url) => {
    window.location.href = url;
  };

  return (
    <div className="container-fluid fixed-top px-0">
      <Navbar className="navbar navbar-expand-xl navbar-light bg-white shadow-sm w-100">
        <div className="container">
          <LogoName
            id="logoName"
            className="navbar-brand mb-0"
            onClick={() => handleNavigation(`https://${javaServerIp}/`)}
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
                  onClick={() => handleNavigation(`https://${javaServerIp}/`)}
                >
                  홈
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="mountain"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${javaServerIp}/mountain/searchMountain`)}
                >
                  산
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="certificationPost"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${javaServerIp}/certificationPost/listCertificationPost`)}
                >
                  인증게시판
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="meetingPost"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${javaServerIp}/meetingPost/getMeetingPostList`)}
                >
                  모임게시판
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  href="#"
                  id="hiking"
                  className="nav-link"
                  onClick={() => handleNavigation(`https://${reactServerIp}`)}
                >
                  등산안내
                </NavLink>
              </li>
            </ul>
            <div className="d-flex justify-content-center">
              {sessionStorage.getItem('user') ? (
                <a href="#" className="my-auto">
                  <UserProfileIcon
                    id="userProfile"
                    className="fas fa-user fa-2x"
                    onClick={() => handleNavigation(`https://${javaServerIp}/mountain/searchMountain`)}
                  ></UserProfileIcon>
                </a>
              ) : (
                <a href="#" className="my-auto">
                  <LoginButtonIcon
                    id="loginButton"
                    className="fas fa-sign-in-alt fa-1x"
                    onClick={() => handleNavigation(`https://${javaServerIp}/user/login`)}
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
