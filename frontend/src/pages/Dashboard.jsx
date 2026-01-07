import { useEffect, useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell, AreaChart, Area } from 'recharts';
import { fetchDashboard, fetchDashboardStudents } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student Directory State
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    medium: '',
    district: '',
  });

  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch Dashboard Stats
  useEffect(() => {
    fetchDashboard()
      .then((payload) => {
        if (payload && payload.meta) {
          setDashboardData(payload);
        } else if (payload && payload.dashboard && payload.dashboard.meta) {
          setDashboardData(payload.dashboard);
        } else {
          setDashboardData(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard stats fetch error", err);
        setLoading(false);
      });
  }, []);

  // Fetch Students with Filters/Pagination
  useEffect(() => {
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const params = {
          page,
          limit: 10,
          search: searchQuery,
          ...filters
        };
        const data = await fetchDashboardStudents(params);
        setStudents(data.students || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages);
        }
      } catch (err) {
        console.error("Students fetch error", err);
      } finally {
        setStudentsLoading(false);
      }
    };

    // Debounce search a bit if desired, but for now simple effect
    const timeout = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timeout);
  }, [page, searchQuery, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({ subject: '', medium: '', district: '' });
    setSearchQuery('');
    setPage(1);
  };

  // Mocks for detailed view charts (since backend doesn't provide marks history yet)
  const getPerformanceData = (student) => {
    // If real data exists in 'subjectMarks' or similar, map it here.
    // For now, return mock pattern or empty if unknown.
    return [
      { period: 'Quarterly', marks: 72 },
      { period: 'Half-Yearly', marks: 78 },
      { period: 'Annual', marks: 85 },
    ];
  };

  const calculateImprovement = (student) => {
    // Mock improvement
    return { value: 13, percentage: '18.0', isPositive: true };
  };

  const fallbackDashboard = {
    meta: {
      totalTutors: 0,
      totalStudents: 0,
      totalClasses: 0,
      upcomingClasses: 0,
      attendanceRate: 0,
    }
  };

  const safeData = dashboardData && dashboardData.meta ? dashboardData : fallbackDashboard;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;

  const metrics = [
    { label: 'Total Tutors', value: safeData.meta.totalTutors || 0, icon: 'group' },
    { label: 'Total Students', value: safeData.meta.totalStudents || 0, icon: 'school' },
    { label: 'Active Classes', value: safeData.meta.totalClasses || 0, icon: 'class' },
    { label: 'Attendance Rate', value: `${safeData.meta.attendanceRate || 0}%`, icon: 'fact_check' },
  ];

  return (
    <div className="space-y-6">
      {/* Mini Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-maatram-yellow/10 flex items-center justify-center text-maatram-yellow-dark">
              <span className="material-icons-outlined text-xl">{metric.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{metric.label}</p>
              <p className="text-xl font-display font-black text-black">{metric.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Search & Filter Section */}
      <section className="bg-gradient-to-r from-maatram-yellow to-maatram-yellow-light rounded-2xl p-6 shadow-md text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-black mb-4 flex items-center justify-center gap-2">
            <span className="material-icons-outlined">search</span>
            Student Tracker
          </h2>

          <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-black/5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search by name or ID..."
                className="flex-1 px-4 py-2 rounded-lg border-none focus:ring-0 outline-none text-base"
              />
              <button className="px-6 py-2 rounded-lg bg-black text-white font-bold hover:bg-gray-800 transition-colors text-sm">
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="bg-white/90 border-0 rounded-lg py-1.5 px-3 shadow-sm focus:ring-2 focus:ring-black font-medium text-xs"
              >
                <option value="">All Subjects</option>
                {['Physics', 'Maths', 'Chemistry', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filters.medium}
                onChange={(e) => handleFilterChange('medium', e.target.value)}
                className="bg-white/90 border-0 rounded-lg py-1.5 px-3 shadow-sm focus:ring-2 focus:ring-black font-medium text-xs"
              >
                <option value="">All Mediums</option>
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
              </select>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="bg-white/90 border-0 rounded-lg py-1.5 px-3 shadow-sm focus:ring-2 focus:ring-black font-medium text-xs"
              >
                <option value="">All Districts</option>
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Other">Other</option>
              </select>
              <button onClick={clearFilters} className="bg-white/50 text-black font-bold py-1.5 px-3 rounded-lg hover:bg-white transition text-xs">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Result / Directory / Detail View */}
      {selectedStudent ? (
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-black">Student Details</h3>
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:text-black hover:border-black transition-all"
            >
              Back to List
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-maatram-yellow flex items-center justify-center text-2xl font-black text-black shadow-inner">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-black">{selectedStudent.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{selectedStudent.kkId || 'No ID'} • {selectedStudent.district || 'Unknown District'}</p>
                <p className="text-xs text-gray-400">{selectedStudent.schoolName || 'School N/A'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right px-6 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Classes</p>
                <p className="text-xl font-bold text-black">{selectedStudent.attendanceCount || 0}</p>
              </div>
              <div className="text-right px-6 py-2 bg-green-50 rounded-xl border border-green-100">
                <p className="text-[10px] text-green-600 uppercase font-black mb-1">Status</p>
                <p className="text-xl font-bold text-green-700">Active</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-sm font-black text-gray-400 uppercase mb-4">Subjects Handled</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(selectedStudent.tutoringSubjects) && selectedStudent.tutoringSubjects.length > 0 ? (
                  selectedStudent.tutoringSubjects.map(sub => (
                    <span key={sub} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                      {sub}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">No subjects listed</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <span className="material-icons-outlined text-6xl">show_chart</span>
              </div>
              <h4 className="text-sm font-black text-gray-400 uppercase mb-4">Improvement Score</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-green-600">+12%</span>
                <span className="text-xs text-gray-400 font-bold">vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h4 className="text-sm font-black text-gray-400 uppercase mb-6">Learning Trajectory</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getPerformanceData(selectedStudent)}>
                  <defs>
                    <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="marks" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorMarks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <section className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black">Student Directory</h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{students.length} Students found</span>
          </div>

          {studentsLoading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 font-medium border border-dashed border-gray-200">
              <div className="w-8 h-8 border-4 border-maatram-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Refreshing student list...
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">FullName</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">District</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">School</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4 text-xs font-bold text-gray-500 font-mono">{student.kkId}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-black group-hover:text-maatram-yellow-dark transition-colors">{student.name}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500">{student.district}</td>
                          <td className="px-6 py-4 text-[11px] font-medium text-gray-400 italic max-w-xs truncate">{student.schoolName}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-black hover:text-white transition-all shadow-sm"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                          No matches found. Try adjusting your search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-black bg-white shadow-sm border border-gray-200 hover:border-black'}`}
                  >
                    Previous
                  </button>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-black bg-white shadow-sm border border-gray-200 hover:border-black'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
