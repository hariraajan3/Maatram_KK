import { useState, useEffect } from 'react';
import {
  fetchPhase1,
  fetchPhase2,
  fetchPhase3,
  fetchApplicationsByPhase,
  createApplication,
  updateApplicationPhase,
  updateStudent,
} from '../services/selectionApi';

const PHASES = {
  Phase1_Televerification: {
    label: 'Phase 1',
    sublabel: 'Tele-verification',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'phone',
    description: 'Phone verification in progress'
  },
  Phase2_PanelInterview: {
    label: 'Phase 2',
    sublabel: 'Panel Interview',
    color: 'bg-purple-100 text-purple-800',
    icon: 'groups',
    description: 'Final panel interview'
  },
  Phase3_FinalSelection: {
    label: 'Phase 3',
    sublabel: 'Final Selection',
    color: 'bg-green-100 text-green-800',
    icon: 'inbox',
    description: 'Students cleared for scheduling'
  },
};

const MEDIUMS = ['Tamil', 'English'];
const DISTRICTS = ['Chennai', 'Coimbatore', 'Other'];
const SUBJECTS = ['Physics', 'Maths', 'Chemistry', 'Biology', 'Science', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English'];

const Selection = () => {
  const [activeTab, setActiveTab] = useState('Phase1_Televerification');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [phaseNotes, setPhaseNotes] = useState('');
  const [isRejectAction, setIsRejectAction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    address: '',
    district: '',
    medium: '',
    email: '',
    yearOfStudy: '12th',
    publicMark: '',
    subjectMarks: '',
    phone: '',
    guardianContact: '',
    requestedSubjects: [],
  });

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const loadApplications = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      let response;
      if (activeTab === 'Phase1_Televerification') {
        response = await fetchPhase1();
      } else if (activeTab === 'Phase2_PanelInterview') {
        response = await fetchPhase2();
      } else if (activeTab === 'Phase3_FinalSelection') {
        response = await fetchPhase3();
      } else {
        response = await fetchApplicationsByPhase(activeTab);
      }

      // Consistent data handling from API response
      const data = Array.isArray(response) ? response : (response?.applications || []);
      const mappedData = data.map(app => {
        // Robust display marks formatting
        let displayMarks = 'No break-up';
        if (app.subjectMarks) {
          if (typeof app.subjectMarks === 'string') {
            displayMarks = app.subjectMarks;
          } else if (typeof app.subjectMarks === 'object') {
            const marksData = app.subjectMarks.text || app.subjectMarks;
            if (typeof marksData === 'string') {
              displayMarks = marksData;
            } else if (typeof marksData === 'object' && marksData !== null) {
              // Format key-value pairs if it's a break-up object
              displayMarks = Object.entries(marksData)
                .filter(([key]) => key !== 'text')
                .map(([sub, mark]) => `${sub}: ${mark}`)
                .join(', ') || 'No break-up';
            }
          }
        }

        return {
          ...app,
          phase: activeTab,
          displayMarks,
          // Ensure tutoringSubjects is always an array of strings
          tutoringSubjects: Array.isArray(app.tutoringSubjects)
            ? app.tutoringSubjects.map(s => (typeof s === 'object' ? JSON.stringify(s) : String(s)))
            : (typeof app.tutoringSubjects === 'object' && app.tutoringSubjects !== null
              ? Object.keys(app.tutoringSubjects)
              : [])
        };
      });

      setApplications(mappedData);
      if (response?.stats) setStats(response.stats);
      else setStats(null);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to load applications');
      setApplications([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateStudent(selectedApp.studentId || selectedApp.id, formData);
        setSuccessMessage('Profile updated successfully');
      } else {
        await createApplication(formData);
        setSuccessMessage('Application created successfully');
      }

      setShowForm(false);
      resetForm();
      loadApplications();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Operation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      schoolName: '',
      address: '',
      district: '',
      medium: '',
      email: '',
      yearOfStudy: '12th',
      publicMark: '',
      subjectMarks: '',
      phone: '',
      guardianContact: '',
      requestedSubjects: [],
    });
    setIsEditing(false);
    setSelectedApp(null);
  };

  const confirmPhaseUpdate = async () => {
    if (!selectedApp) return;
    try {
      const targetPhase = isRejectAction ? 'Rejected' : getNextPhase(selectedApp.phase);

      if (!targetPhase) {
        setErrorMessage('Cannot update phase');
        return;
      }

      // Important: Backend expects target phase string
      await updateApplicationPhase(selectedApp.studentId || selectedApp.id, targetPhase, phaseNotes);

      setShowPhaseModal(false);
      setSelectedApp(null);
      setPhaseNotes('');
      setIsRejectAction(false);
      setSuccessMessage(`Application ${isRejectAction ? 'rejected' : 'moved to next phase'} successfully`);
      loadApplications();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to update phase: ' + (error.response?.data?.message || error.message));
    }
  };

  const getNextPhase = (currentPhase) => {
    const phaseOrder = ['Phase1_Televerification', 'Phase2_PanelInterview', 'Phase3_FinalSelection'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : 'Selected';
  };

  const toggleSubject = (subject) => {
    setFormData((prev) => ({
      ...prev,
      requestedSubjects: prev.requestedSubjects.includes(subject)
        ? prev.requestedSubjects.filter((s) => s !== subject)
        : [...prev.requestedSubjects, subject],
    }));
  };

  const handleEdit = (app) => {
    setSelectedApp(app);
    setFormData({
      name: app.name || '',
      schoolName: app.schoolName || '',
      address: app.address || '',
      district: app.district || '',
      medium: app.medium || '',
      email: app.email || '',
      yearOfStudy: app.yearOfStudying || '12th',
      publicMark: app.class11PublicMarks || '',
      subjectMarks: typeof app.subjectMarks === 'object'
        ? (typeof app.subjectMarks.text === 'string' ? app.subjectMarks.text : (app.subjectMarks.text ? JSON.stringify(app.subjectMarks.text) : JSON.stringify(app.subjectMarks)))
        : (app.subjectMarks || ''),
      phone: app.phoneNumber || '',
      guardianContact: app.parentName || '',
      requestedSubjects: Array.isArray(app.tutoringSubjects) ? app.tutoringSubjects : [],
    });
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-black flex items-center gap-4">
          Student Selection Process
          {!loading && applications.length > 0 && (
            <span className="bg-maatram-yellow/20 text-black px-4 py-1.5 rounded-full text-sm font-black border border-maatram-yellow/30">
              {applications.length} Students
            </span>
          )}
        </h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="material-icons-outlined">add</span>
          New Application
        </button>
      </div>

      {/* Phase Tabs - 3 Phases */}
      <div className="bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-2">
          {Object.entries(PHASES).map(([phase, config]) => (
            <button
              key={phase}
              onClick={() => setActiveTab(phase)}
              className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === phase
                ? 'bg-maatram-yellow text-black shadow-lg scale-[1.02] ring-4 ring-maatram-yellow/20'
                : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className={`material-icons-outlined text-xl ${activeTab === phase ? 'text-black' : 'text-gray-300'}`}>
                {config.icon}
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest leading-none mb-1 opacity-60">{config.label}</p>
                <p className="text-sm leading-none whitespace-nowrap">{config.sublabel}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in shadow-sm">
          <span className="material-icons-outlined text-green-600">check_circle</span>
          <p className="text-green-700 font-bold flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')}><span className="material-icons-outlined text-green-400">close</span></button>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in shadow-sm">
          <span className="material-icons-outlined text-red-600">error_outline</span>
          <p className="text-red-700 font-bold flex-1">{errorMessage}</p>
          <button onClick={() => setErrorMessage('')}><span className="material-icons-outlined text-red-400">close</span></button>
        </div>
      )}

      {/* Stats Summary Bar */}
      {!loading && (stats || applications.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-icons-outlined">people</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total in Phase</p>
              <p className="text-2xl font-black text-black">{applications.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-icons-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Selected</p>
              <p className="text-2xl font-black text-black">
                {applications.filter(a => a.teleStatus === 'SELECTED' || a.panelStatus === 'SELECTED' || a.finalStatus === 'SELECTED').length}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-icons-outlined">block</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Rejected</p>
              <p className="text-2xl font-black text-black">
                {applications.filter(a => a.finalStatus === 'REJECTED' || a.teleStatus === 'REJECTED' || a.panelStatus === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-maatram-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-sm">
          <span className="material-icons-outlined text-6xl mb-4 opacity-50">inbox</span>
          <p className="text-lg font-bold">No applications in this phase</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">
                      {app.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-black">{app.name}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-black tracking-wider uppercase border border-gray-200">
                          {app.kkId || 'P001'}
                        </span>
                        {app.finalStatus === 'REJECTED' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black uppercase">Rejected</span>
                        )}
                      </div>
                      {app.email && <p className="text-sm text-gray-500">{app.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Medium & District</p>
                      <p className="text-sm font-bold text-black">{app.medium || 'N/A'} | {app.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Contact</p>
                      <p className="text-sm font-bold text-black">{app.phoneNumber || 'N/A'}</p>
                      <p className="text-[11px] text-gray-600">Parent: {app.parentName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Academic</p>
                      <p className="text-sm font-bold text-black">{app.yearOfStudying || '12th'} | {app.schoolName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Marks (11th Public)</p>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-black">{app.class11PublicMarks || 'N/A'}</span>
                        <span className="text-[11px] text-gray-600 italic">{app.displayMarks}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Tutoring Subjects</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(app.tutoringSubjects || []).map((subject, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {app.phase1Notes && (
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tele-verification Notes</p>
                      <p className="text-sm text-gray-700">{app.phase1Notes}</p>
                    </div>
                  )}
                  {app.phase2Notes && (
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Panel Interview Notes</p>
                      <p className="text-sm text-gray-700">{app.phase2Notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {getNextPhase(app.phase) && app.finalStatus !== 'REJECTED' && app.phase !== 'Phase3_FinalSelectedStudents' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setPhaseNotes('');
                        setIsRejectAction(false);
                        setShowPhaseModal(true);
                      }}
                      className="px-4 py-2.5 bg-maatram-yellow text-black rounded-lg font-bold hover:bg-maatram-yellow-dark transition-all text-sm whitespace-nowrap shadow-sm"
                    >
                      Move to {PHASES[getNextPhase(app.phase)]?.label || 'Next'}
                    </button>
                  )}
                  {app.finalStatus !== 'REJECTED' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setPhaseNotes('');
                        setIsRejectAction(true);
                        setShowPhaseModal(true);
                      }}
                      className="px-4 py-2.5 bg-red-100 text-red-800 rounded-lg font-bold hover:bg-red-200 transition-all text-sm"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(app)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-outlined text-sm">edit</span>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enrollment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-black">{isEditing ? 'Edit Profile' : 'New Enrollment'}</h2>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-black">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">School *</label>
                  <input type="text" required value={formData.schoolName} onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Address *</label>
                <textarea required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" rows="2" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">District *</label>
                  <select required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold">
                    <option value="">Select district</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Medium *</label>
                  <select required value={formData.medium} onChange={(e) => setFormData({ ...formData, medium: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold">
                    <option value="">Select medium</option>
                    {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Public Mark *</label>
                  <input type="number" required value={formData.publicMark} onChange={(e) => setFormData({ ...formData, publicMark: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone *</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent *</label>
                  <input type="text" required value={formData.guardianContact} onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Tutoring Subjects *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SUBJECTS.map((subject) => (
                    <button type="button" key={subject} onClick={() => toggleSubject(subject)} className={`p-3 rounded-xl border text-xs font-black transition-all ${formData.requestedSubjects.includes(subject) ? 'bg-black text-white border-black shadow-lg scale-[1.05]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 px-8 py-5 bg-black text-white rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl active:scale-[0.98]">
                  {isEditing ? 'Save Changes' : 'Submit Enrollment'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-8 py-5 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-black">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase Update Modal */}
      {showPhaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-black text-black mb-6 tracking-tight">Update Application Phase</h2>
            <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
              <p className="text-sm font-bold text-gray-600 mb-2">Updating: <span className="text-black">{selectedApp.name}</span></p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${isRejectAction ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {isRejectAction ? 'Reject student' : `Move to ${PHASES[getNextPhase(selectedApp.phase)]?.label || 'Next'}`}
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
              <textarea value={phaseNotes} onChange={(e) => setPhaseNotes(e.target.value)} rows={4} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold text-black" placeholder="Add notes for this update..." />
            </div>
            <div className="flex gap-4">
              <button onClick={confirmPhaseUpdate} className={`flex-1 px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-[0.98] ${isRejectAction ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-maatram-yellow text-black hover:bg-maatram-yellow-dark'}`}>Confirm</button>
              <button onClick={() => setShowPhaseModal(false)} className="px-8 py-5 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-black transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Selection;
