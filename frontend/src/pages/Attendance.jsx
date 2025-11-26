import { useState, useEffect } from 'react';
import { recordAttendance } from '../services/api';

const Attendance = () => {
  const [tutorName, setTutorName] = useState('');
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', id: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [classId, setClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceReviewed, setAttendanceReviewed] = useState(false);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('kk_session') || '{}');
      if (session?.user?.name) setTutorName(session.user.name);

      const savedStudents = localStorage.getItem('attendance_students');
      if (savedStudents) setStudents(JSON.parse(savedStudents));

      const savedClassId = localStorage.getItem('attendance_classId');
      if (savedClassId) setClassId(savedClassId);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    if (students.length > 0) localStorage.setItem('attendance_students', JSON.stringify(students));
    if (classId) localStorage.setItem('attendance_classId', classId);
  }, [students, classId]);

  const addStudent = () => {
    if (!newStudent.name.trim() || !newStudent.id.trim()) {
      setMessage({ type: 'error', text: 'Please enter both name and ID' });
      return;
    }
    if (students.some((s) => s.id === newStudent.id.trim())) {
      setMessage({ type: 'error', text: 'Student ID already exists' });
      return;
    }
    setStudents([...students, {
      id: newStudent.id.trim(),
      name: newStudent.name.trim(),
      present: true,
      marks: '', // Added marks field
      reviewed: false
    }]);
    setNewStudent({ name: '', id: '' });
    setMessage({ type: 'success', text: 'Student added successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const removeStudent = (studentId) => {
    setStudents(students.filter((s) => s.id !== studentId));
  };

  const toggleAttendance = (studentId) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, present: !s.present, reviewed: true } : s)));
    setAttendanceReviewed(true);
  };

  const updateMarks = (studentId, marks) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, marks, reviewed: true } : s)));
    setAttendanceReviewed(true);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return setMessage({ type: 'error', text: 'Please add at least one student' });
    if (!attendanceReviewed) return setMessage({ type: 'error', text: 'Please confirm that you have reviewed all data' });

    const finalClassId = classId.trim() || `CLASS-${new Date().toISOString().split('T')[0]}`;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const promises = students.map((student) =>
        recordAttendance({
          classId: finalClassId,
          studentId: student.id,
          present: student.present,
          marks: student.marks, // Save marks
          notes: '',
          date: attendanceDate,
        })
      );
      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Attendance & Marks saved securely!' });
      setStudents(students.map((s) => ({ ...s, reviewed: false })));
      setAttendanceReviewed(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to save data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-black">Attendance & Marks</h2>
          <p className="text-gray-500 mt-1">Securely log student attendance and assessment scores.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold">Tutor</p>
          <p className="font-bold text-black">{tutorName || 'Loading...'}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <section className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-black mb-4">Class Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Class ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  placeholder="e.g., CLS-2024-001"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-black mb-4">Add Student</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder="Student Name"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
              />
              <input
                type="text"
                value={newStudent.id}
                onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                placeholder="Student ID"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow focus:border-transparent outline-none text-sm transition-all"
                onKeyPress={(e) => e.key === 'Enter' && addStudent()}
              />
              <button
                onClick={addStudent}
                className="w-full py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
              >
                Add to List
              </button>
            </div>
          </div>
        </section>

        {/* Students List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-black">Student List ({students.length})</h3>
              {students.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all students?')) {
                      setStudents([]);
                      localStorage.removeItem('attendance_students');
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-800"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {students.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No students added yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4 text-center">Attendance</th>
                      <th className="px-6 py-4">Marks (Optional)</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-black">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.id}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleAttendance(student.id)}
                            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${student.present
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                              }`}
                          >
                            {student.present ? 'PRESENT' : 'ABSENT'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={student.marks}
                            onChange={(e) => updateMarks(student.id, e.target.value)}
                            placeholder="Score"
                            className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-maatram-yellow outline-none text-center"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeStudent(student.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <span className="material-icons-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {students.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 sticky bottom-6">
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="checkbox"
                  checked={attendanceReviewed}
                  onChange={(e) => setAttendanceReviewed(e.target.checked)}
                  className="w-5 h-5 text-maatram-yellow rounded border-gray-300 focus:ring-maatram-yellow"
                />
                <label className="text-sm font-medium text-gray-700">
                  I confirm that I have reviewed the attendance and marks for all students.
                </label>
              </div>

              <button
                onClick={handleSaveAttendance}
                disabled={loading || !attendanceReviewed}
                className={`w-full py-3 rounded-xl font-bold text-black transition-all shadow-lg ${loading || !attendanceReviewed
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-maatram-yellow hover:bg-maatram-yellow-dark shadow-maatram-yellow/20'
                  }`}
              >
                {loading ? 'Saving securely...' : 'Save Attendance & Marks'}
              </button>

              {message.text && (
                <p className={`mt-3 text-center text-sm font-bold ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {message.text}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Attendance;
