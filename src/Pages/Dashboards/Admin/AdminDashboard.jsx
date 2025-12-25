import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import LoadingSpinner from "../../../Components/LoadingSpinner";
import Sidebar from "../../../Components/Sidebar";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      const [usersRes, boardsRes, campaignsRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL_GET_ALL_USERS || "https://bbms-backend-62q5.onrender.com/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(import.meta.env.VITE_API_URL_GET_BOARDS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(import.meta.env.VITE_API_URL_GET_ALL_CAMPAIGNS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const userList = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.users || [];

      const boardList = Array.isArray(boardsRes.data)
        ? boardsRes.data
        : boardsRes.data.boards || [];

      const campaignList = Array.isArray(campaignsRes.data)
        ? campaignsRes.data
        : campaignsRes.data.campaigns || [];

      setUsers(userList);
      setBoards(boardList);
      setCampaigns(campaignList);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Count roles
  const clientCount = users.filter((u) => u.role === "client").length;
  const servicemanCount = users.filter((u) => u.role === "serviceman").length;
  const managerCount = users.filter((u) => u.role === "manager").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const totalBoards = boards.length;

  // Prepare data for charts
  const cityBoardsData = () => {
    const cityCounts = {};
    boards.forEach(board => {
      cityCounts[board.City] = (cityCounts[board.City] || 0) + 1;
    });

    const sortedCities = Object.entries(cityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedCities.map(([city]) => city),
      datasets: [
        {
          label: 'Number of Boards',
          data: sortedCities.map(([, count]) => count),
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(0, 255, 127, 0.8)',
            'rgba(255, 0, 255, 0.8)',
            'rgba(128, 0, 0, 0.8)',
            'rgba(0, 128, 128, 0.8)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(0, 255, 127, 1)',
            'rgba(255, 0, 255, 1)',
            'rgba(128, 0, 0, 1)',
            'rgba(0, 128, 128, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Boards Distribution by City',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'City-wise Board Distribution',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col w-full overflow-y-auto">
        {/* Mobile topbar */}
        <div className="p-4 bg-white shadow-md md:hidden flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Main content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 hidden md:block">Admin Dashboard</h1>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {/* User Statistics */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">User Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                    <p className="text-sm text-gray-500 mb-1">Total Clients</p>
                    <p className="text-3xl font-bold text-blue-600">{clientCount}</p>
                    <p className="text-xs text-gray-400 mt-2">{((clientCount / users.length) * 100).toFixed(1)}% of users</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">Trackers</p>
                    <p className="text-3xl font-bold text-green-600">{servicemanCount}</p>
                    <p className="text-xs text-gray-400 mt-2">{((servicemanCount / users.length) * 100).toFixed(1)}% of users</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100">
                    <p className="text-sm text-gray-500 mb-1">Managers</p>
                    <p className="text-3xl font-bold text-purple-600">{managerCount}</p>
                    <p className="text-xs text-gray-400 mt-2">{((managerCount / users.length) * 100).toFixed(1)}% of users</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-100">
                    <p className="text-sm text-gray-500 mb-1">Admin</p>
                    <p className="text-3xl font-bold text-yellow-600">{adminCount}</p>
                    <p className="text-xs text-gray-400 mt-2">{((adminCount / users.length) * 100).toFixed(1)}% of users</p>
                  </div>
                </div>
              </div>

              {/* Board Statistics */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Board Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
                    <p className="text-sm text-gray-500 mb-1">Total Boards</p>
                    <p className="text-3xl font-bold text-indigo-600">{totalBoards}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
                    <p className="text-sm text-gray-500 mb-1">Cities Covered</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {new Set(boards.map(board => board.City)).size}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
                    <p className="text-sm text-gray-500 mb-1">Active Campaigns</p>
                    <p className="text-3xl font-bold text-indigo-600">{campaigns.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
                    <p className="text-sm text-gray-500 mb-1">Boards in Use</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {new Set(campaigns.flatMap(c => c.selectedBoards || [])).size}
                    </p>
                  </div>
                </div>
              </div>

              {/* Board Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="h-[400px]">
                    <Bar options={barOptions} data={cityBoardsData()} />
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="h-[400px]">
                    <Pie options={pieOptions} data={cityBoardsData()} />
                  </div>
                </div>

                {/* City-wise Board List */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Detailed City Distribution</h2>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Array.from(new Set(boards.map(board => board.City)))
                        .sort((a, b) => {
                          const countA = boards.filter(board => board.City === a).length;
                          const countB = boards.filter(board => board.City === b).length;
                          return countB - countA;
                        })
                        .map(city => (
                          <div key={city} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-gray-700">{city}</span>
                            <span className="text-indigo-600 font-semibold">
                              {boards.filter(board => board.City === city).length} boards
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
