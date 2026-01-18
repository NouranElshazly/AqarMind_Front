import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { FiDownload, FiFilter, FiRefreshCw, FiCalendar } from "react-icons/fi";

const SystemReports = () => {
  const [activeTab, setActiveTab] = useState("performance");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("last30days");

  const performanceData = [
    { name: "Jan", responseTime: 200, uptime: 99.5, errors: 12 },
    { name: "Feb", responseTime: 180, uptime: 99.8, errors: 8 },
    { name: "Mar", responseTime: 150, uptime: 99.9, errors: 5 },
    { name: "Apr", responseTime: 142, uptime: 99.98, errors: 2 },
    { name: "May", responseTime: 135, uptime: 99.99, errors: 1 },
    { name: "Jun", responseTime: 130, uptime: 100, errors: 0 },
  ];

  const userActivityData = [
    { name: "Landlords", value: 45 },
    { name: "Tenants", value: 128 },
    { name: "Admins", value: 3 },
  ];

  const resourceUsageData = [
    { name: "CPU", usage: 32 },
    { name: "Memory", usage: 45 },
    { name: "Storage", usage: 28 },
    { name: "Network", usage: 15 },
  ];

  const errorLogs = [
    {
      id: 1,
      timestamp: "2023-06-15 10:23:45",
      type: "Database",
      message: "Connection timeout",
      severity: "High",
    },
    {
      id: 2,
      timestamp: "2023-06-14 15:12:33",
      type: "API",
      message: "Rate limit exceeded",
      severity: "Medium",
    },
    {
      id: 3,
      timestamp: "2023-06-12 08:45:21",
      type: "Authentication",
      message: "Failed login attempt",
      severity: "Low",
    },
    {
      id: 4,
      timestamp: "2023-06-10 22:10:05",
      type: "Database",
      message: "Query timeout",
      severity: "High",
    },
    {
      id: 5,
      timestamp: "2023-06-08 11:30:15",
      type: "System",
      message: "Memory allocation error",
      severity: "Critical",
    },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-800 font-sans bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6 border-b-2 border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 lg:mb-0 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          System Reports
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center bg-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-full sm:w-auto">
            <FiCalendar className="mr-2 text-gray-500 text-lg" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border-none bg-transparent text-sm text-gray-700 outline-none cursor-pointer font-medium"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:scale-100 w-full sm:w-auto justify-center"
            onClick={refreshData}
            disabled={loading}
          >
            <FiRefreshCw
              className={`text-lg ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          className={`px-6 py-3 bg-transparent border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "performance"
              ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("performance")}
        >
          Performance
        </button>
        <button
          className={`px-6 py-3 bg-transparent border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "users"
              ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("users")}
        >
          User Activity
        </button>
        <button
          className={`px-6 py-3 bg-transparent border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "resources"
              ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("resources")}
        >
          Resources
        </button>
        <button
          className={`px-6 py-3 bg-transparent border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "errors"
              ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("errors")}
        >
          Error Logs
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px] backdrop-blur-sm bg-opacity-95">
        {activeTab === "performance" && (
          <div className="space-y-12 animate-fadeIn">
            <div className="animate-slideUp">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                Response Time (ms)
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#3b82f6" }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="animate-slideUp">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                Uptime Percentage
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis domain={[98, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="uptime"
                      fill="#10b981"
                      animationDuration={1500}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="animate-slideUp">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                User Distribution
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={userActivityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      animationBegin={0}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    >
                      {userActivityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  New Signups
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">24</p>
                <p className="text-sm text-green-600 font-medium">
                  +12% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  Active Users
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">89</p>
                <p className="text-sm text-green-600 font-medium">
                  +5% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  Avg. Session
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">4.2 min</p>
                <p className="text-sm text-red-600 font-medium">
                  -0.3 min from last month
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="animate-slideUp">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                Resource Usage
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis domain={[0, 100]} stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="usage"
                      fill="#8884d8"
                      animationDuration={1500}
                      radius={[8, 8, 0, 0]}
                    >
                      {resourceUsageData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-8 animate-slideUp">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Detailed Resource Metrics
              </h3>
              <div className="overflow-x-auto rounded-xl shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Resource
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Current Usage
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Peak Usage
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Threshold
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">CPU</td>
                      <td className="p-4 border-b border-gray-100">32%</td>
                      <td className="p-4 border-b border-gray-100">78%</td>
                      <td className="p-4 border-b border-gray-100">85%</td>
                      <td className="p-4 border-b border-gray-100">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">Memory</td>
                      <td className="p-4 border-b border-gray-100">45%</td>
                      <td className="p-4 border-b border-gray-100">82%</td>
                      <td className="p-4 border-b border-gray-100">90%</td>
                      <td className="p-4 border-b border-gray-100">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">Storage</td>
                      <td className="p-4 border-b border-gray-100">28%</td>
                      <td className="p-4 border-b border-gray-100">30%</td>
                      <td className="p-4 border-b border-gray-100">95%</td>
                      <td className="p-4 border-b border-gray-100">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">Network</td>
                      <td className="p-4 border-b border-gray-100">15%</td>
                      <td className="p-4 border-b border-gray-100">45%</td>
                      <td className="p-4 border-b border-gray-100">80%</td>
                      <td className="p-4 border-b border-gray-100">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          OK
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "errors" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-l-4 border-red-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  Total Errors
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">28</p>
                <p className="text-sm text-red-600 font-medium">
                  +5 from last week
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-l-4 border-orange-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  Critical Errors
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">3</p>
                <p className="text-sm text-green-600 font-medium">
                  -2 from last week
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-base font-medium text-gray-600 mb-2">
                  Avg. Resolution Time
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">2.4 hrs</p>
                <p className="text-sm text-green-600 font-medium">
                  -0.8 hrs from last week
                </p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Error Logs
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:scale-105">
                  <FiDownload className="text-base" />
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl shadow-md">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Timestamp
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Message
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Severity
                      </th>
                      <th className="p-4 text-left border-b border-gray-200 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {errorLogs.map((error) => (
                      <tr
                        key={error.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 border-b border-gray-100">
                          {error.timestamp}
                        </td>
                        <td className="p-4 border-b border-gray-100">
                          {error.type}
                        </td>
                        <td className="p-4 border-b border-gray-100">
                          {error.message}
                        </td>
                        <td className="p-4 border-b border-gray-100">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              error.severity === "Critical"
                                ? "bg-red-100 text-red-800"
                                : error.severity === "High"
                                ? "bg-yellow-100 text-yellow-800"
                                : error.severity === "Medium"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {error.severity}
                          </span>
                        </td>
                        <td className="p-4 border-b border-gray-100">
                          <button className="px-3 py-1 border-none rounded text-xs cursor-pointer transition-all duration-300 mr-2 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md">
                            View
                          </button>
                          <button className="px-3 py-1 border-none rounded text-xs cursor-pointer transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:shadow-md">
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SystemReports;
