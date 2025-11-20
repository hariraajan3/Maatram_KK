import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import { fetchDashboard } from '../services/api';

const metricClasses = 'bg-white rounded-2xl p-5 shadow-lg border-2 border-maatram-yellow';

// Mock student performance data - in production, this would come from the backend
const mockStudentPerformance = {
  'STU001': {
    name: 'Mani K',
    id: 'STU001',
    quarterly: 72,
    halfYearly: 78,
    annual: 85,
  },
  'STU002': {
    name: 'Harini D',
    id: 'STU002',
    quarterly: 80,
    halfYearly: 84,
    annual: 88,
  },
  'STU003': {
    name: 'Kumar S',
    id: 'STU003',
    quarterly: 65,
    halfYearly: 70,
    annual: 75,
  },
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchDashboard().then((payload) => {
      setData(payload);
      setLoading(false);
    });
  }, []);

  const handleSearch = () => {
    setSearchError('');
    setSelectedStudent(null);

    if (!searchQuery.trim()) {
      setSearchError('Please enter a student name or ID');
      return;
    }

    // Search by ID first, then by name
    const query = searchQuery.trim().toUpperCase();
    let found = null;

    // Search by ID
    if (mockStudentPerformance[query]) {
      found = mockStudentPerformance[query];
    } else {
      // Search by name
      found = Object.values(mockStudentPerformance).find(
        (student) => student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (found) {
      setSelectedStudent(found);
      setSearchError('');
    } else {
      setSearchError('Student not found. Please check the name or ID and try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getPerformanceData = (student) => {
    if (!student) return [];
    return [
      { period: 'Quarterly', marks: student.quarterly, color: '#3b82f6' },
      { period: 'Half-Yearly', marks: student.halfYearly, color: '#8b5cf6' },
      { period: 'Annual', marks: student.annual, color: '#10b981' },
    ];
  };

  const calculateGrowth = (student) => {
    if (!student) return { quarterlyToHalf: 0, halfToAnnual: 0, overall: 0 };
    const quarterlyToHalf = student.halfYearly - student.quarterly;
    const halfToAnnual = student.annual - student.halfYearly;
    const overall = student.annual - student.quarterly;
    return { quarterlyToHalf, halfToAnnual, overall };
  };

  if (loading) {
    return <p className="text-sm text-black/70 font-medium">Loading dashboard...</p>;
  }

  const metrics = [
    { label: 'Tutors', value: data.meta.totalTutors },
    { label: 'Students', value: data.meta.totalStudents },
    { label: 'Classes', value: data.meta.totalClasses },
    { label: 'Attendance %', value: `${data.meta.attendanceRate}%` },
  ];

  const phaseChart = Object.entries(data.workloadByPhase || {}).map(([phase, value]) => ({
    phase,
    value,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-black">Today at a glance</h2>
        <p className="text-sm text-black/70 font-medium">Selection, scheduling and attendance in one view.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {metrics.map((metric) => (
            <div key={metric.label} className={metricClasses}>
              <p className="text-xs uppercase tracking-wide text-black/60 font-bold">{metric.label}</p>
              <p className="text-3xl font-bold text-black mt-3">{metric.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-lg border-2 border-maatram-yellow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-black">Phase workload</h3>
              <p className="text-xs text-black/70 font-medium">Active classes for each KK phase</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={phaseChart}>
                <XAxis dataKey="phase" stroke="#000" />
                <Tooltip />
                <Bar dataKey="value" fill="#FFD700" radius={6} stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-maatram-yellow">
          <h3 className="text-lg font-bold text-black">Rapid actions</h3>
          <ul className="mt-4 space-y-3 text-sm text-black font-medium">
            <li>• Trigger onboarding approvals</li>
            <li>• Review pending swaps</li>
            <li>• Regroup low progress students</li>
          </ul>
          <p className="mt-6 text-xs text-black/60 font-medium">Role: {data.role}</p>
        </div>
      </section>

      {/* Student Performance Section */}
      <section className="bg-white rounded-2xl p-6 shadow-lg border-2 border-maatram-yellow">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">Student Performance Tracker</h2>
          <p className="text-sm text-black/70 font-medium">
            Search for a student by name or ID to view their performance across Quarterly, Half-Yearly, and Annual assessments
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter student name or ID (e.g., Mani K or STU001)"
                className="w-full border-2 border-black rounded-lg px-4 py-3 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
              />
              {searchError && (
                <p className="text-sm text-red-900 font-bold mt-2">{searchError}</p>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-maatram-yellow hover:bg-maatram-yellow-dark text-black font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl whitespace-nowrap border-2 border-black"
            >
              Search
            </button>
          </div>
        </div>

        {/* Performance Chart */}
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-maatram-yellow rounded-xl p-6 border-2 border-black shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black/70 mb-1 font-medium">Student Information</p>
                  <h3 className="text-2xl font-bold text-black">{selectedStudent.name}</h3>
                  <p className="text-sm text-black/70 mt-1 font-medium">ID: {selectedStudent.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-black/70 font-medium">Current Performance</p>
                  <p className="text-3xl font-bold text-black">{selectedStudent.annual}%</p>
                </div>
              </div>
            </div>

            {/* Growth Indicators */}
            {(() => {
              const growth = calculateGrowth(selectedStudent);
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-maatram-yellow/30 border-2 border-maatram-yellow rounded-lg p-4">
                    <p className="text-xs text-black font-bold mb-1">Quarterly → Half-Yearly</p>
                    <p className={`text-2xl font-bold ${growth.quarterlyToHalf >= 0 ? 'text-black' : 'text-red-900'}`}>
                      {growth.quarterlyToHalf >= 0 ? '+' : ''}{growth.quarterlyToHalf}%
                    </p>
                  </div>
                  <div className="bg-maatram-yellow/30 border-2 border-maatram-yellow rounded-lg p-4">
                    <p className="text-xs text-black font-bold mb-1">Half-Yearly → Annual</p>
                    <p className={`text-2xl font-bold ${growth.halfToAnnual >= 0 ? 'text-black' : 'text-red-900'}`}>
                      {growth.halfToAnnual >= 0 ? '+' : ''}{growth.halfToAnnual}%
                    </p>
                  </div>
                  <div className="bg-maatram-yellow/30 border-2 border-maatram-yellow rounded-lg p-4">
                    <p className="text-xs text-black font-bold mb-1">Overall Growth</p>
                    <p className={`text-2xl font-bold ${growth.overall >= 0 ? 'text-black' : 'text-red-900'}`}>
                      {growth.overall >= 0 ? '+' : ''}{growth.overall}%
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Bar Chart */}
            <div className="bg-white rounded-xl p-6 border-2 border-maatram-yellow shadow-lg">
              <h3 className="text-lg font-bold text-black mb-4">Performance Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPerformanceData(selectedStudent)}>
                    <XAxis dataKey="period" stroke="#000" />
                    <YAxis domain={[0, 100]} stroke="#000" label={{ value: 'Marks (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Marks']}
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="marks" radius={[8, 8, 0, 0]} stroke="#000" strokeWidth={2}>
                      {getPerformanceData(selectedStudent).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#FFD700" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Details Table */}
            <div className="bg-white rounded-xl border-2 border-maatram-yellow overflow-hidden shadow-lg">
              <div className="p-4 bg-maatram-yellow border-b-2 border-black">
                <h3 className="text-lg font-bold text-black">Detailed Performance</h3>
              </div>
              <table className="w-full">
                <thead className="bg-maatram-yellow/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase border-b-2 border-black">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase border-b-2 border-black">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase border-b-2 border-black">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase border-b-2 border-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-maatram-yellow">
                  {getPerformanceData(selectedStudent).map((item, index) => {
                    const getGrade = (marks) => {
                      if (marks >= 90) return 'A+';
                      if (marks >= 80) return 'A';
                      if (marks >= 70) return 'B+';
                      if (marks >= 60) return 'B';
                      if (marks >= 50) return 'C';
                      return 'D';
                    };
                    const getStatus = (marks) => {
                      if (marks >= 80) return { text: 'Excellent', color: 'bg-maatram-yellow text-black border-2 border-black' };
                      if (marks >= 70) return { text: 'Good', color: 'bg-maatram-yellow/70 text-black border-2 border-black' };
                      if (marks >= 60) return { text: 'Average', color: 'bg-maatram-yellow/50 text-black border-2 border-black' };
                      return { text: 'Needs Improvement', color: 'bg-red-100 text-red-900 border-2 border-red-500' };
                    };
                    const status = getStatus(item.marks);
                    return (
                      <tr key={index} className="hover:bg-maatram-yellow/20">
                        <td className="px-6 py-4 text-sm font-bold text-black">{item.period}</td>
                        <td className="px-6 py-4 text-sm font-bold text-black">{item.marks}%</td>
                        <td className="px-6 py-4 text-sm font-bold text-black">{getGrade(item.marks)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedStudent && !searchError && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-black/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-sm text-black/70 font-medium">Search for a student to view their performance</p>
            <p className="text-xs text-black/60 mt-1 font-medium">Try searching for: Mani K, Harini D, or Kumar S</p>
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-maatram-yellow">
          <h3 className="text-lg font-bold text-black">Onboarding queue</h3>
          <div className="mt-4 space-y-3">
            {data.onboardingQueue.length === 0 && (
              <p className="text-sm text-black/70 font-medium">No pending approvals 🎉</p>
            )}
            {data.onboardingQueue.map((request) => (
              <article
                key={request.id}
                className="p-3 rounded-xl border-2 border-maatram-yellow bg-maatram-yellow/20 flex justify-between text-sm"
              >
                <div>
                  <p className="font-bold text-black">{request.name}</p>
                  <p className="text-xs text-black/70 font-medium">{request.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] bg-maatram-yellow text-black font-bold border border-black">
                  {request.status}
                </span>
              </article>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-maatram-yellow">
          <h3 className="text-lg font-bold text-black">High-touch students</h3>
          <div className="mt-4 space-y-3">
            {data.students.map((student) => (
              <article key={student.id} className="p-3 rounded-xl border-2 border-maatram-yellow bg-maatram-yellow/10">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-black">{student.name}</p>
                    <p className="text-xs text-black/70 font-medium">
                      {student.phase} • {student.group}
                    </p>
                  </div>
                  <span className="text-sm font-bold bg-maatram-yellow px-3 py-1 rounded-lg border-2 border-black text-black">
                    {student.progressScore}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

