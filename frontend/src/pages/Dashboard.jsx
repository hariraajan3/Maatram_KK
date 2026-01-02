import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell, AreaChart, Area } from 'recharts';
import { fetchDashboard } from '../services/api';

// Mock student performance data with more detail
const mockStudentPerformance = {
  'STU001': {
    name: 'Mani K',
    id: 'STU001',
    quarterly: 72,
    halfYearly: 78,
    annual: 85,
    attendance: 92,
    subjects: { Math: 88, Science: 82, English: 75 }
  },
  'STU002': {
    name: 'Harini D',
    id: 'STU002',
    quarterly: 80,
    halfYearly: 84,
    annual: 88,
    attendance: 96,
    subjects: { Math: 90, Science: 92, English: 85 }
  },
  'STU003': {
    name: 'Kumar S',
    id: 'STU003',
    quarterly: 65,
    halfYearly: 70,
    annual: 75,
    attendance: 85,
    subjects: { Math: 70, Science: 72, English: 68 }
  },
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchDashboard()
      .then((payload) => {
        // Some environments may return an unexpected shape; ensure we always have meta to render safely.
        if (payload && payload.meta) {
          setData(payload);
        } else if (payload && payload.dashboard && payload.dashboard.meta) {
          setData(payload.dashboard);
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback dummy data if API fails
        setData({
          meta: {
            totalTutors: 8,
            totalStudents: 45,
            totalClasses: 12,
            upcomingClasses: 5,
            attendanceRate: 94,
          },
          workloadByPhase: {
            Selection: 3,
            Scheduling: 5,
            Attendance: 4,
          },
          onboardingQueue: [],
          swapQueue: [],
          students: [
            { id: 's1', name: 'Mani K', phase: 'Selection', group: 'KK-2025-A', progressScore: 76 },
            { id: 's2', name: 'Harini D', phase: 'Scheduling', group: 'KK-2025-B', progressScore: 83 },
            { id: 's3', name: 'Kumar S', phase: 'Attendance', group: 'KK-2025-C', progressScore: 66 },
          ],
        });
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
    const query = searchQuery.trim().toUpperCase();
    let found = mockStudentPerformance[query] || Object.values(mockStudentPerformance).find(
      (student) => student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedStudent(found);
    } else {
      setSearchError('Student not found. Please check the name or ID.');
    }
  };

  const getPerformanceData = (student) => {
    if (!student) return [];
    return [
      { period: 'Quarterly', marks: student.quarterly },
      { period: 'Half-Yearly', marks: student.halfYearly },
      { period: 'Annual', marks: student.annual },
    ];
  };

  const calculateImprovement = (student) => {
    const improvement = student.annual - student.quarterly;
    return {
      value: improvement,
      percentage: ((improvement / student.quarterly) * 100).toFixed(1),
      isPositive: improvement >= 0
    };
  };

  const fallbackDashboard = {
    meta: {
      totalTutors: 8,
      totalStudents: 45,
      totalClasses: 12,
      upcomingClasses: 5,
      attendanceRate: 94,
    },
    workloadByPhase: {
      Selection: 3,
      Scheduling: 5,
      Attendance: 4,
    },
    onboardingQueue: [],
    swapQueue: [],
    students: [
      { id: 's1', name: 'Mani K', phase: 'Selection', group: 'KK-2025-A', progressScore: 76 },
      { id: 's2', name: 'Harini D', phase: 'Scheduling', group: 'KK-2025-B', progressScore: 83 },
      { id: 's3', name: 'Kumar S', phase: 'Attendance', group: 'KK-2025-C', progressScore: 66 },
    ],
  };

  const safeData = data && data.meta ? data : fallbackDashboard;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;

  const metrics = [
    { label: 'Total Tutors', value: safeData.meta.totalTutors, icon: 'group' },
    { label: 'Total Students', value: safeData.meta.totalStudents, icon: 'school' },
    { label: 'Active Classes', value: safeData.meta.totalClasses, icon: 'class' },
    { label: 'Attendance Rate', value: `${safeData.meta.attendanceRate}%`, icon: 'fact_check' },
  ];

  return (
    <div className="space-y-8">
      {/* Search Section - Prominent */}
      <section className="bg-gradient-to-r from-maatram-yellow to-maatram-yellow-light rounded-2xl p-8 shadow-lg text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-black mb-2">Student Growth Tracker</h2>

          <div className="flex gap-4 bg-white p-2 rounded-xl shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter student name or ID..."
              className="flex-1 px-4 py-3 rounded-lg border-none focus:ring-0 outline-none text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3 rounded-lg bg-black text-white font-bold hover:bg-gray-800 transition-colors"
            >
              Analyze
            </button>
          </div>
          {searchError && <p className="text-red-900 font-bold mt-3 bg-red-100/50 inline-block px-4 py-1 rounded-full text-sm">{searchError}</p>}
        </div>
      </section>

      {/* Student Analysis Result */}
      {selectedStudent && (
        <div className="animate-fade-in space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">{selectedStudent.name}</h3>
                <p className="text-gray-500 font-medium">{selectedStudent.id} • Class 10</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right px-6 py-2 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">Attendance</p>
                <p className="text-xl font-bold text-black">{selectedStudent.attendance}%</p>
              </div>
              <div className="text-right px-6 py-2 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold">Current Grade</p>
                <p className="text-xl font-bold text-black">A</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Improvement Card */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-icons-outlined text-6xl">trending_up</span>
              </div>
              <p className="text-sm text-gray-500 font-bold uppercase mb-2">Overall Improvement</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-green-600">
                  +{calculateImprovement(selectedStudent).percentage}%
                </span>
                <span className="text-sm text-green-600 font-bold mb-1">
                  since Quarterly
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Consistent growth observed across all terms.</p>
            </div>

            {/* Subject Breakdown (Mock) */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <p className="text-sm text-gray-500 font-bold uppercase mb-4">Subject Performance</p>
              <div className="space-y-3">
                {Object.entries(selectedStudent.subjects).map(([subject, score]) => (
                  <div key={subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-700">{subject}</span>
                      <span className="font-bold text-black">{score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-maatram-yellow rounded-full"
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Percentile (Mock) */}
            <div className="bg-black text-white rounded-2xl p-6 shadow-card relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-sm text-gray-400 font-bold uppercase mb-2">Class Standing</p>
                <p className="text-4xl font-bold text-maatram-yellow">Top 5%</p>
                <p className="text-sm text-gray-400 mt-2">Among 45 students in the batch.</p>
                <div className="mt-4 inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold border border-white/20">
                  High Performer
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-maatram-yellow rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100">
            <h3 className="text-lg font-bold text-black mb-6">Performance Trajectory</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getPerformanceData(selectedStudent)}>
                  <defs>
                    <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="marks"
                    stroke="#FFD700"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorMarks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Default Metrics Grid (Hidden when searching, or moved below) */}
      {!selectedStudent && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{metric.label}</p>
                <span className="material-icons-outlined text-maatram-yellow-dark opacity-50">{metric.icon}</span>
              </div>
              <p className="text-3xl font-display font-bold text-black">{metric.value}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
