import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white py-12 px-6 transition duration-300">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold mb-4">CampaignSoft</h2>
          <p className="text-sm">
            A complete campaign management solution to simplify campaign tracking,
            location coordination, and tracking of staff & clients — all in one dashboard.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-yellow-300 transition duration-300">Home</Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-yellow-300 transition duration-300">Login</Link>
            </li>
            <li>
              <Link to="/admin-dashboard" className="hover:text-yellow-300 transition duration-300">Admin Panel</Link>
            </li>
            <li>
              <Link to="/client-dashboard" className="hover:text-yellow-300 transition duration-300">Client Portal</Link>
            </li>
            <li>
              <Link to="/service-dashboard" className="hover:text-yellow-300 transition duration-300">Service Staff</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="text-sm space-y-2">
            <li>
              Email: <a href="mailto:m.afaqpak@gmail.com" className="hover:text-yellow-300 transition duration-300">m.afaqpak@gmail.com</a>
            </li>
            <li>
              Phone: <a href="tel:+923097876497" className="hover:text-yellow-300 transition duration-300">+92 309 7876497</a>
            </li>
            <li>Location: Lahore | Karachi, Pakistan</li>
          </ul>
        </div>

        {/* Social Media Icons */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4 text-white text-xl">
            <a href="#" aria-label="Facebook" className="hover:text-yellow-300 transition duration-300">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-yellow-300 transition duration-300">
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-yellow-300 transition duration-300">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-yellow-300 transition duration-300">
              <FaTwitter />
            </a>
          </div>
        </div>

      </div>

      <div className="text-center text-sm text-white mt-10 border-t border-blue-500 pt-4">
        © {new Date().getFullYear()} CampaignSoft. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
