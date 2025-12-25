import { Link } from "react-router-dom";
import Footer from "../Components/footer";
import Navbar from "../Components/navbar";

const LandingPage = () => {
  return (
    <div>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center bg-indigo-700 text-white">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Manage Campaigns Effortlessly
          </h1>
          <p className="text-xl mb-6 max-w-2xl text-indigo-100">
            From banners to billing, streamline every part of your campaign
            management in one secure dashboard.
          </p>
          <Link to="/login">
            <button className="bg-yellow-400 text-indigo-900 font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition">
              Get Started
            </button>
          </Link>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-indigo-800">
              Key Features
            </h2>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  Campaign Banner Upload
                </h3>
                <p className="text-sm text-gray-600">
                  Upload & manage campaign banners with geo-tagging support.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  Tracker Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Track all trackers and service mens activities with real-time location tracking.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  Staff Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Track all staff activities.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  Client Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Track all Clients and sent them their campaign Reports.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  Boards Management                </h3>
                <p className="text-sm text-gray-600">
                  Manage boards with their different types with real time location.
                </p>
              </div>
              <div className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2 text-indigo-700">
                  Google Map Integration
                </h3>
                <p className="text-sm text-gray-600">
                  Assign board locations using Google Maps for easy tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 text-indigo-800">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-indigo-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <p className="italic text-gray-700">
                  “The platform is easy to use and saves hours every week.
                  Highly recommended for campaign managers.”
                </p>
                <h4 className="font-semibold mt-4 text-indigo-800">
                  – Ahsan, Outdoor Media
                </h4>
              </div>
              <div className="bg-indigo-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <p className="italic text-gray-700">
                  “From start to finish, the management and billing system has
                  made our workflows seamless.”
                </p>
                <h4 className="font-semibold mt-4 text-indigo-800">
                  – Sarah, AdBoard Solutions
                </h4>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-6 bg-indigo-700 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Simplify Campaign Management?
          </h2>
          <p className="text-lg mb-6 text-indigo-100">
            Login now and take control of your advertising campaigns.
          </p>
          <Link to="/login">
            <button className="bg-yellow-400 text-indigo-900 font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition">
              Login to Dashboard
            </button>
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
