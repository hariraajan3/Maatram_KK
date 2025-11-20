import { useState, useEffect } from 'react';
import { recordAttendance } from '../services/api';

const Attendance = () => {
  // Get tutor name from session
  const [tutorName, setTutorName] = useState('');
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: '', id: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [classId, setClassId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceReviewed, setAttendanceReviewed] = useState(false);

  // Load tutor name and students from localStorage on mount
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('kk_session') || '{}');
      if (session?.user?.name) {
        setTutorName(session.user.name);
      }

      // Load saved students from localStorage
      const savedStudents = localStorage.getItem('attendance_students');
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }

      // Load class ID if exists
      const savedClassId = localStorage.getItem('attendance_classId');
      if (savedClassId) {
        setClassId(savedClassId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('attendance_students', JSON.stringify(students));
    }
  }, [students]);

  // Save class ID to localStorage
  useEffect(() => {
    if (classId) {
      localStorage.setItem('attendance_classId', classId);
    }
  }, [classId]);

  const addStudent = () => {
    if (!newStudent.name.trim() || !newStudent.id.trim()) {
      setMessage({ type: 'error', text: 'Please enter both name and ID' });
      return;
    }

    // Check if student ID already exists
    if (students.some((s) => s.id === newStudent.id.trim())) {
      setMessage({ type: 'error', text: 'Student ID already exists' });
      return;
    }

    const student = {
      id: newStudent.id.trim(),
      name: newStudent.name.trim(),
      present: true, // Default to present
      reviewed: false, // Not reviewed yet
    };

    setStudents([...students, student]);
    setNewStudent({ name: '', id: '' });
    setMessage({ type: 'success', text: 'Student added successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const removeStudent = (studentId) => {
    setStudents(students.filter((s) => s.id !== studentId));
    setMessage({ type: 'success', text: 'Student removed' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const toggleAttendance = (studentId) => {
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, present: !s.present, reviewed: true } : s))
    );
    // Mark attendance as reviewed when user interacts
    setAttendanceReviewed(true);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one student' });
      return;
    }

    if (!attendanceReviewed) {
      setMessage({ type: 'error', text: 'Please confirm that you have reviewed all attendance' });
      return;
    }

    // Use a default class ID if not provided
    const finalClassId = classId.trim() || `CLASS-${new Date().toISOString().split('T')[0]}`;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save attendance for each student
      const promises = students.map((student) =>
        recordAttendance({
          classId: finalClassId,
          studentId: student.id,
          present: student.present,
          notes: '',
          date: attendanceDate,
        })
      );

      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Attendance saved successfully!' });
      
      // Reset attendance status but keep students
      setStudents(students.map((s) => ({ ...s, present: true, reviewed: false })));
      setAttendanceReviewed(false);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to save attendance. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllStudents = () => {
    if (window.confirm('Are you sure you want to clear all students? This cannot be undone.')) {
      setStudents([]);
      localStorage.removeItem('attendance_students');
      setMessage({ type: 'success', text: 'All students cleared' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold text-black">Attendance Management</h2>
        <p className="text-sm text-black/70 font-medium">
          Record and manage student attendance for your classes
        </p>
      </header>

      {/* Tutor Name Section */}
      <div className="bg-maatram-yellow rounded-xl shadow-lg p-6 border-2 border-black">
        <p className="text-sm text-black/70 mb-1 font-medium">Tutor Handling the Class</p>
        <h3 className="text-2xl font-bold text-black">{tutorName || 'Loading...'}</h3>
      </div>

      {/* Class ID and Date Section */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-maatram-yellow p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Class ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              placeholder="Enter class ID (e.g., CLASS-001)"
              className="w-full border-2 border-black rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Date</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full border-2 border-black rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
            />
          </div>
        </div>
      </div>

      {/* Add Student Section */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-maatram-yellow p-6">
        <h3 className="text-lg font-bold text-black mb-4">Add Students</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Student Name</label>
            <input
              type="text"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="Enter student name"
              className="w-full border-2 border-black rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
              onKeyPress={(e) => e.key === 'Enter' && addStudent()}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Student ID</label>
            <input
              type="text"
              value={newStudent.id}
              onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
              placeholder="Enter student ID"
              className="w-full border-2 border-black rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maatram-yellow focus:border-maatram-yellow outline-none transition font-medium"
              onKeyPress={(e) => e.key === 'Enter' && addStudent()}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addStudent}
              className="w-full bg-maatram-yellow hover:bg-maatram-yellow-dark text-black font-bold py-2.5 px-4 rounded-lg transition-all border-2 border-black shadow-md hover:shadow-lg"
            >
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`rounded-lg p-4 border-2 ${
            message.type === 'success'
              ? 'bg-maatram-yellow/30 border-maatram-yellow text-black'
              : 'bg-red-100 border-red-500 text-red-900'
          } font-bold`}
        >
          {message.text}
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-maatram-yellow overflow-hidden">
        <div className="p-6 border-b-2 border-maatram-yellow flex justify-between items-center bg-maatram-yellow">
          <h3 className="text-lg font-bold text-black">
            Students ({students.length})
          </h3>
          {students.length > 0 && (
            <button
              type="button"
              onClick={clearAllStudents}
              className="text-sm text-red-900 hover:text-red-700 font-bold"
            >
              Clear All
            </button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-black/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="mt-4 text-sm text-black/70 font-medium">No students added yet</p>
            <p className="text-xs text-black/60 mt-1 font-medium">
              Add students using the form above to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-maatram-yellow/30 border-b-2 border-maatram-yellow">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-maatram-yellow">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-maatram-yellow/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => toggleAttendance(student.id)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                          student.present
                            ? 'bg-maatram-yellow text-black border-black hover:bg-maatram-yellow-dark'
                            : 'bg-red-100 text-red-900 border-red-500 hover:bg-red-200'
                        }`}
                      >
                        {student.present ? (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Present
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Absent
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => removeStudent(student.id)}
                        className="text-red-900 hover:text-red-700 text-sm font-bold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Attendance Button */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-maatram-yellow p-6">
          {/* Review Confirmation */}
          <div className="mb-4 p-4 bg-maatram-yellow/20 rounded-lg border-2 border-maatram-yellow">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={attendanceReviewed}
                onChange={(e) => {
                  setAttendanceReviewed(e.target.checked);
                }}
                className="w-5 h-5 text-maatram-yellow border-2 border-black rounded focus:ring-maatram-yellow focus:ring-2 cursor-pointer accent-maatram-yellow"
              />
              <span className="ml-3 text-sm text-black font-bold">
                I have reviewed and marked attendance for all students
              </span>
            </label>
          </div>

          {/* Requirements Status */}
          {!attendanceReviewed && (
            <div className="mb-4 p-3 bg-maatram-yellow/30 border-2 border-maatram-yellow rounded-lg">
              <p className="text-xs text-black font-bold">
                Please check the confirmation box above to enable the Save button
              </p>
            </div>
          )}
          
          {!classId.trim() && attendanceReviewed && (
            <div className="mb-4 p-3 bg-maatram-yellow/20 border-2 border-maatram-yellow rounded-lg">
              <p className="text-xs text-black font-bold">
                Note: Class ID is empty. A default Class ID will be generated if not provided.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={loading || !attendanceReviewed}
            className={`w-full font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center border-2 ${
              loading || !attendanceReviewed
                ? 'bg-black/20 text-black/50 cursor-not-allowed border-black/20'
                : 'bg-maatram-yellow hover:bg-maatram-yellow-dark text-black border-black'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving Attendance...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Attendance;
