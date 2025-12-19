import { useState, useEffect } from 'react';
import {
    fetchTutors,
    fetchTutorStudents,
    fetchTutorAttendanceHistory,
} from '../services/api';

const MEDIUMS = ['Tamil', 'English'];
const DISTRICTS = ['Chennai', 'Coimbatore', 'Other'];

const OverallAttendance = () => {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [tutorStudents, setTutorStudents] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadTutors();
    }, []);

    const loadTutors = async () => {
        setLoading(true);
        try {
            const data = await fetchTutors();
            setTutors(data);
        } catch (error) {
            console.error('Failed to load tutors:', error);
            // Demo data for development
            setTutors([
                {
                    id: 'TUT-001',
                    name: 'Hari Kumar',
                    email: 'hari@maatram.org',
                    medium: 'Tamil',
                    district: 'Other',
                    subjects: ['Maths', 'Physics'],
                    status: 'active',
                    studentCount: 15,
                },
                {
                    id: 'TUT-002',
                    name: 'Priya Sundaram',
                    email: 'priya@maatram.org',
                    medium: 'English',
                    district: 'Chennai',
                    subjects: ['Chemistry', 'Maths'],
                    status: 'active',
                    studentCount: 12,
                },
                {
                    id: 'TUT-003',
                    name: 'Ravi Chandran',
                    email: 'ravi@maatram.org',
                    medium: 'Tamil',
                    district: 'Coimbatore',
                    subjects: ['Commerce', 'Accounts', 'Economics'],
                    status: 'active',
                    studentCount: 8,
                },
                {
                    id: 'TUT-004',
                    name: 'Meena Lakshmi',
                    email: 'meena@maatram.org',
                    medium: 'English',
                    district: 'Other',
                    subjects: ['Tamil', 'English'],
                    status: 'active',
                    studentCount: 10,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadTutorDetails = async (tutor) => {
        setSelectedTutor(tutor);

        try {
            const [students, history] = await Promise.all([
                fetchTutorStudents(tutor.id),
                fetchTutorAttendanceHistory(tutor.id),
            ]);
            setTutorStudents(students);
            setAttendanceHistory(history);
        } catch (error) {
            console.error('Failed to load tutor details:', error);
            // Demo data
            setTutorStudents([
                { id: 'STU-001', name: 'Arun Kumar', subjects: ['Maths', 'Physics'] },
                { id: 'STU-002', name: 'Divya Lakshmi', subjects: ['Maths'] },
                { id: 'STU-003', name: 'Karthik Raja', subjects: ['Physics'] },
            ]);
            setAttendanceHistory([
                { date: '2025-12-18', present: 12, absent: 3, total: 15 },
                { date: '2025-12-17', present: 14, absent: 1, total: 15 },
                { date: '2025-12-16', present: 13, absent: 2, total: 15 },
            ]);
        }
    };

    const getSubjectColor = (subject) => {
        const colors = {
            Physics: 'bg-blue-100 text-blue-800',
            Maths: 'bg-purple-100 text-purple-800',
            Chemistry: 'bg-green-100 text-green-800',
            Commerce: 'bg-orange-100 text-orange-800',
            Economics: 'bg-yellow-100 text-yellow-800',
            Accounts: 'bg-pink-100 text-pink-800',
            Tamil: 'bg-red-100 text-red-800',
            English: 'bg-indigo-100 text-indigo-800',
        };
        return colors[subject] || 'bg-gray-100 text-gray-800';
    };

    const getMediumColor = (medium) => {
        return medium === 'Tamil' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700';
    };

    const getDistrictColor = (district) => {
        const colors = {
            Chennai: 'bg-blue-50 text-blue-700',
            Coimbatore: 'bg-green-50 text-green-700',
            Other: 'bg-gray-50 text-gray-700',
        };
        return colors[district] || 'bg-gray-50 text-gray-700';
    };

    // Tutor Detail View (when clicked)
    if (selectedTutor) {
        return (
            <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedTutor(null)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <span className="material-icons-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-display font-bold text-black">{selectedTutor.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm text-gray-500">ID: {selectedTutor.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMediumColor(selectedTutor.medium)}`}>
                                {selectedTutor.medium} Medium
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDistrictColor(selectedTutor.district)}`}>
                                {selectedTutor.district}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subjects */}
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-black mb-4">Subjects Teaching</h3>
                    <div className="flex flex-wrap gap-2">
                        {(selectedTutor.subjects || []).map((subject) => (
                            <span key={subject} className={`px-4 py-2 rounded-xl text-sm font-bold ${getSubjectColor(subject)}`}>
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Attendance Summary */}
                    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                            <span className="material-icons-outlined text-maatram-yellow">event_available</span>
                            Attendance History
                        </h3>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                            />
                        </div>

                        {attendanceHistory.length > 0 && (
                            <div className="space-y-3">
                                {attendanceHistory.slice(0, 5).map((record) => (
                                    <div
                                        key={record.date}
                                        className={`p-4 rounded-xl border ${record.date === selectedDate
                                            ? 'bg-maatram-yellow/10 border-maatram-yellow'
                                            : 'bg-gray-50 border-transparent'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                            <span className="text-xs text-gray-500">{record.total} students</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="text-sm font-bold text-green-700">{record.present} Present</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span className="text-sm font-bold text-red-700">{record.absent} Absent</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Student List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="material-icons-outlined text-maatram-yellow">school</span>
                                Assigned Students ({tutorStudents.length})
                            </h3>
                        </div>

                        {tutorStudents.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <span className="material-icons-outlined text-5xl mb-4 opacity-50">person_off</span>
                                <p>No students assigned yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {tutorStudents.map((student) => (
                                    <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black">{student.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {(student.subjects || []).map((subject) => (
                                                    <span key={subject} className={`px-2 py-1 rounded text-xs font-bold ${getSubjectColor(subject)}`}>
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main List View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-black">Overall Attendance</h1>
                <p className="text-gray-500 mt-1">View all tutors and their attendance records</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-gray-600">groups</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Tutors</p>
                            <p className="text-2xl font-bold text-black">{tutors.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-red-600">translate</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tamil Medium</p>
                            <p className="text-2xl font-bold text-red-700">{tutors.filter(t => t.medium === 'Tamil').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-indigo-600">language</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">English Medium</p>
                            <p className="text-2xl font-bold text-indigo-700">{tutors.filter(t => t.medium === 'English').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-green-600">school</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-green-700">{tutors.reduce((acc, t) => acc + (t.studentCount || 0), 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tutors Table */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-black">All Tutors</h3>
                    <p className="text-sm text-gray-500">Click on a tutor to view their attendance details</p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-maatram-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading tutors...
                    </div>
                ) : tutors.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <span className="material-icons-outlined text-6xl mb-4 opacity-50">person_add</span>
                        <p className="text-lg font-bold">No tutors found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">Name</th>
                                    <th className="px-6 py-4 text-left">Medium</th>
                                    <th className="px-6 py-4 text-left">District</th>
                                    <th className="px-6 py-4 text-left">Subjects</th>
                                    <th className="px-6 py-4 text-center">Students</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tutors.map((tutor) => (
                                    <tr
                                        key={tutor.id}
                                        onClick={() => loadTutorDetails(tutor)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{tutor.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-maatram-yellow/20 flex items-center justify-center font-bold text-black">
                                                    {tutor.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black">{tutor.name}</p>
                                                    <p className="text-xs text-gray-500">{tutor.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getMediumColor(tutor.medium)}`}>
                                                {tutor.medium}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDistrictColor(tutor.district)}`}>
                                                {tutor.district}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(tutor.subjects || []).slice(0, 3).map((subject) => (
                                                    <span key={subject} className={`px-2 py-1 rounded text-xs font-bold ${getSubjectColor(subject)}`}>
                                                        {subject}
                                                    </span>
                                                ))}
                                                {(tutor.subjects || []).length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                                                        +{tutor.subjects.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-black">{tutor.studentCount || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${tutor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {tutor.status === 'active' ? '● Active' : '○ Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="material-icons-outlined text-gray-400">chevron_right</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverallAttendance;

// Also export as TutorManagement for backward compatibility with App.jsx import
export { OverallAttendance as TutorManagement };

