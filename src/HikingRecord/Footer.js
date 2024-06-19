import React from 'react';
import '../css/style.css'; // Ensure you have this CSS file or adjust as necessary

const Footer = () => {
  return (
    <div className="container-fluid bg-dark text-white-50 footer">
      <div className="container py-4">
        <div className="pb-3 mb-3 border-bottom-custom">
          <div className="row g-4">
            <div className="col-lg-4">
              <h1 className="custom-logo">루돌프</h1>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-6 col-md-6">
            <div className="footer-item">
              <h4 className="custom-heading mb-3">회사 정보</h4>
              <p className="custom-paragraph mb-2">주소: 서울 강남구 강남대로94길 20, 삼오빌딩 5층</p>
              <p className="custom-paragraph mb-2">사업자 등록 번호: 328-85-02112</p>
              <p className="custom-paragraph mb-0">대표자: 김새봄</p>
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <div className="footer-item">
              <h4 className="custom-heading mb-3">고객 서비스</h4>
              <p className="custom-paragraph mb-2">문의 및 제안: ljh71506@gmail.com</p>
              <p className="custom-paragraph mb-0">연락처: 02-3486-4600</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
