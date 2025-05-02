import React from 'react';
// import { Link } from 'react-router-dom'; // Nếu các link này là route nội bộ

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-column">
          <div className="footer-logo">S3-MRS</div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>

        <div className="footer-column">
          <h3>COMPANY</h3>
          <ul>
            {/* Thay bằng <Link to="/about">About Us</Link> nếu là route nội bộ */}
            <li><a href="#">About Us</a></li>
            <li><a href="#">Legal Information</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Blogs</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>HELP CENTER</h3>
          <ul>
            <li><a href="#">Find a Property</a></li>
            <li><a href="#">How To Host?</a></li>
            <li><a href="#">Why Us?</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Rental Guides</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>CONTACT INFO</h3>
          <p>Phone: 1234567890</p>
          <p>Email: company@email.com</p>
          <p>Location: 100 Smart Street, LA, USA</p>
          <div className="social-icons">
            <a href="#">f</a> <a href="#">t</a> <a href="#">i</a> <a href="#">in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;