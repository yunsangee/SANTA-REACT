import React from 'react';
import styled from 'styled-components';

// Define styled components
const FooterContainer = styled.div`
  background-color: #343a40;
  color: rgba(255, 255, 255, 0.5);
  text-align: left !important;
  margin-top: 200px;
`;

const FooterInner = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid rgba(226, 175, 24, 0.5);
`;

const FooterRow = styled.div`
  margin-bottom: 1rem;
`;

const FooterItem = styled.div`
  margin-bottom: 1rem;

  h4 {
    color: #ffffff;
    margin-bottom: 0.75rem;
  }
`;

const TextPrimary = styled.h1`
  color: #34a817 !important;
  margin-bottom: 0.5rem;
`;

const OrangeLine = styled.div`
  position: absolute;
  left: 0;
  width: 100vw; /* 전체 화면 너비로 설정 */
  height: 2px;
  background-color: orange;
  margin-top: 10px;
  transform: translateX(-10%); /* 중앙 정렬 */
`;

const Footer = () => {
  return (
    <FooterContainer className="container-fluid">
      <FooterInner className="container py-4">
        <FooterRow className="pb-3 mb-3 row g-4">
          <div className="col-lg-4">
            <TextPrimary className="mb-0">루돌프</TextPrimary>
            <OrangeLine />
          </div>
        </FooterRow>
        <div className="row g-4">
          <div className="col-lg-6 col-md-6">
            <FooterItem className="footer-item">
              <h4 className="mb-3">회사 정보</h4>
              <p className="mb-2">주소: 서울 강남구 강남대로94길 20, 삼오빌딩 5층</p>
              <p className="mb-2">사업자 등록 번호: 328-85-02112</p>
              <p className="mb-0">대표자: 이정한</p>
            </FooterItem>
          </div>
          <div className="col-lg-6 col-md-6">
            <FooterItem className="footer-item">
              <h4 className="mb-3">고객 서비스</h4>
              <p className="mb-2">문의 및 제안: ljh71506@gmail.com</p>
              <p className="mb-0">연락처: 02-3486-4600</p>
            </FooterItem>
          </div>
        </div>
      </FooterInner>
    </FooterContainer>
  );
};

export default Footer;
