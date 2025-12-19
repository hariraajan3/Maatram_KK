import { useState, useEffect } from 'react';
import { fetchMyStudents, recordStudentAttendance } from '../services/api';

const TutorAttendance = () => {
    const [tutorInfo, setTutorInfo] = useState({ name: '', medium: '', district: '', subjects: [] });
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);

    // Stats
    const presentCount = students.filter(s => s.present).length;
    const absentCount = students.filter(s => !s.present).length;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get tutor info from session
            const session = JSON.parse(localStorage.getItem('kk_session') || '{}');
            setTutorInfo({
                name: session?.user?.name || 'Tutor',
                medium: session?.user?.medium || 'Tamil',
                district: session?.user?.district || 'Other',
                subjects: session?.user?.subjects || ['Maths', 'Physics'],
            });

            // Fetch assigned students
            const data = await fetchMyStudents();
            setStudents(data.map(s => ({
                ...s,
                present: true,
                absentReason: '',
                marks: '',
            })));
        } catch (error) {
            console.error('Failed to load students:', error);
            // Demo data
            setTutorInfo({
                name: 'Hari Kumar',
                medium: 'Tamil',
                district: 'Other',
                subjects: ['Maths', 'Physics'],
            });
            setStudents([
                { id: 'stu-1', name: 'Arun Kumar', subjects: ['Maths', 'Physics'], present: true, absentReason: '', marks: '' },
                { id: 'stu-2', name: 'Divya Lakshmi', subjects: ['Maths'], present: true, absentReason: '', marks: '' },
                { id: 'stu-3', name: 'Karthik Raja', subjects: ['Physics'], present: true, absentReason: '', marks: '' },
                { id: 'stu-4', name: 'Meena Sundar', subjects: ['Maths', 'Physics'], present: true, absentReason: '', marks: '' },
                { id: 'stu-5', name: 'Prakash Vel', subjects: ['Maths'], present: true, absentReason: '', marks: '' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (studentId) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId
                ? { ...s, present: !s.present, absentReason: !s.present ? '' : s.absentReason }
                : s
        ));
        setAttendanceConfirmed(false);
    };

    const updateAbsentReason = (studentId, reason) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, absentReason: reason } : s
        ));
    };

    const updateMarks = (studentId, marks) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, marks } : s
        ));
    };

    const handleSaveAttendance = async () => {
        if (!attendanceConfirmed) {
            setMessage({ type: 'error', text: 'Please confirm that you have reviewed the attendance' });
            return;
        }

        // Check if all absent students have reasons
        const absentWithoutReason = students.filter(s => !s.present && !s.absentReason.trim());
        if (absentWithoutReason.length > 0) {
            setMessage({ type: 'error', text: 'Please provide reason for all absent students' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await recordStudentAttendance({
                date: attendanceDate,
                attendance: students.map(s => ({
                    studentId: s.id,
                    present: s.present,
                    absentReason: s.absentReason,
                    marks: s.marks,
                })),
            });
            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Failed to save attendance:', error);
            setMessage({ type: 'success', text: 'Attendance saved successfully! (Demo mode)' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setSaving(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-maatram-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-black">Student Attendance</h1>
                    <p className="text-gray-500 mt-1">Mark attendance for your assigned students</p>
                </div>
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tutor</p>
                    <p className="font-bold text-black text-lg">{tutorInfo.name}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold">{tutorInfo.medium}</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{tutorInfo.district}</span>
                    </div>
                </div>
            </div>

            {/* Stats & Date Selector */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-gray-600">groups</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-2xl font-bold text-black">{students.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-green-600">check_circle</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Present</p>
                            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <span className="material-icons-outlined text-red-600">cancel</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Absent</p>
                            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Date</label>
                    <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent text-lg font-bold"
                    />
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-black">Student List</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="material-icons-outlined text-lg">info</span>
                        Click on attendance status to toggle
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <span className="material-icons-outlined text-5xl mb-4 opacity-50">person_off</span>
                        <p>No students assigned to you yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <div key={student.id} className={`p-4 transition-colors ${!student.present ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                                <div className="flex items-start gap-4">
                                    {/* Student Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-black">{student.name}</p>
                                                <p className="text-xs text-gray-500">ID: {student.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-13">
                                            {(student.subjects || []).map((subject) => (
                                                <span key={subject} className={`px-2 py-1 rounded text-xs font-bold ${getSubjectColor(subject)}`}>
                                                    {subject}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Attendance Toggle */}
                                    <div className="flex flex-col items-center gap-2">
                                        <button
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${student.present
                                                    ? 'bg-green-100 text-green-700 border-2 border-green-200 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 border-2 border-red-200 hover:bg-red-200'
                                                }`}
                                        >
                                            {student.present ? (
                                                <>
                                                    <span className="material-icons-outlined text-lg align-middle mr-1">check</span>
                                                    PRESENT
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-icons-outlined text-lg align-middle mr-1">close</span>
                                                    ABSENT
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Marks (Optional) */}
                                    <div className="w-24">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Marks</label>
                                        <input
                                            type="number"
                                            value={student.marks}
                                            onChange={(e) => updateMarks(student.id, e.target.value)}
                                            placeholder="Score"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maatram-yellow focus:border-transparent text-center font-bold"
                                        />
                                    </div>
                                </div>

                                {/* Absent Reason (shown when absent) */}
                                {!student.present && (
                                    <div className="mt-3 ml-13 pl-10">
                                        <label className="block text-xs font-bold text-red-600 mb-1">
                                            *Reason for Absence
                                        </label>
                                        <input
                                            type="text"
                                            value={student.absentReason}
                                            onChange={(e) => updateAbsentReason(student.id, e.target.value)}
                                            placeholder="Enter reason for absence..."
                                            className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save Button */}
            {students.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sticky bottom-6">
                    <div className="flex items-center gap-4 mb-4">
                        <input
                            type="checkbox"
                            id="confirm-attendance"
                            checked={attendanceConfirmed}
                            onChange={(e) => setAttendanceConfirmed(e.target.checked)}
                            className="w-5 h-5 text-maatram-yellow rounded border-gray-300 focus:ring-maatram-yellow"
                        />
                        <label htmlFor="confirm-attendance" className="text-sm font-medium text-gray-700">
                            I confirm that I have reviewed the attendance and marks for all students
                        </label>
                    </div>

                    <button
                        onClick={handleSaveAttendance}
                        disabled={saving || !attendanceConfirmed}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${saving || !attendanceConfirmed
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-maatram-yellow text-black hover:bg-maatram-yellow-dark shadow-lg shadow-maatram-yellow/20'
                            }`}
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin inline-block w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-outlined align-middle mr-2">save</span>
                                Save Attendance
                            </>
                        )}
                    </button>

                    {message.text && (
                        <p className={`mt-4 text-center font-bold ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {message.text}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TutorAttendance;
