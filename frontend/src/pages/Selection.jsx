import { useState, useEffect } from 'react';
import {
  fetchPhase1,
  fetchPhase2,
  fetchPhase3,
  fetchApplicationsByPhase,
  createApplication,
  updateApplicationPhase,
} from '../services/api';

const PHASES = {
  Phase1_Selection: { label: 'Phase 1', sublabel: 'New Applications', color: 'bg-blue-100 text-blue-800', icon: 'assignment', description: 'Initial student applications' },
  Phase2_Televerification: { label: 'Phase 2', sublabel: 'Tele-verification', color: 'bg-yellow-100 text-yellow-800', icon: 'phone', description: 'Phone verification in progress' },
  Phase3_PanelInterview: { label: 'Phase 3', sublabel: 'Panel Interview', color: 'bg-purple-100 text-purple-800', icon: 'groups', description: 'Final panel interview' },
};

const MEDIUMS = ['Tamil', 'English'];
const DISTRICTS = ['Chennai', 'Coimbatore', 'Other'];
const SUBJECTS = ['Physics', 'Maths', 'Chemistry', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English'];

const Selection = () => {
  const [activeTab, setActiveTab] = useState('Phase1_Selection');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [phaseNotes, setPhaseNotes] = useState('');
  const [isRejectAction, setIsRejectAction] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guardianContact: '',
    medium: '',
    district: '',
    requestedSubjects: [],
  });

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'Phase1_Selection') {
        data = await fetchPhase1();
      } else if (activeTab === 'Phase2_Televerification') {
        data = await fetchPhase2();
      } else if (activeTab === 'Phase3_PanelInterview') {
        data = await fetchPhase3();
      } else {
        data = await fetchApplicationsByPhase(activeTab);
      }
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createApplication(formData);
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        guardianContact: '',
        medium: '',
        district: '',
        requestedSubjects: [],
      });
      loadApplications();
    } catch (error) {
      alert('Failed to create application: ' + (error.response?.data?.message || error.message));
    }
  };

  const confirmPhaseUpdate = async () => {
    if (!selectedApp) return;
    try {
      const targetPhase = isRejectAction ? 'Rejected' : getNextPhase(selectedApp.phase);

      if (!targetPhase) {
        alert('Cannot update phase');
        return;
      }

      await updateApplicationPhase(selectedApp.id, targetPhase, phaseNotes);
      setShowPhaseModal(false);
      setSelectedApp(null);
      setPhaseNotes('');
      setIsRejectAction(false);
      loadApplications();
    } catch (error) {
      alert('Failed to update phase: ' + (error.response?.data?.message || error.message));
    }
  };

  const getNextPhase = (currentPhase) => {
    const phaseOrder = ['Phase1_Selection', 'Phase2_Televerification', 'Phase3_PanelInterview', 'Selected'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    return currentIndex < phaseOrder.length - 1 ? phaseOrder[currentIndex + 1] : null;
  };

  const toggleSubject = (subject) => {
    setFormData((prev) => ({
      ...prev,
      requestedSubjects: prev.requestedSubjects.includes(subject)
        ? prev.requestedSubjects.filter((s) => s !== subject)
        : [...prev.requestedSubjects, subject],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-black">Student Selection Process</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="material-icons-outlined">add</span>
          New Application
        </button>
      </div>

      {/* Phase Tabs - 3 Phases with equal spacing */}
      <div className="">
        <div className="flex justify-between gap-4 ">
          {Object.entries(PHASES).map(([phase, config]) => (
            <button
              key={phase}
              onClick={() => setActiveTab(phase)}
              className={`  flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === phase
                ? 'bg-maatram-yellow text-black shadow-md'
                : ' bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="material-icons-outlined text-xl">{config.icon}</span>
              <span className="text-sm">{config.label}: {config.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-maatram-yellow border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500">
          <span className="material-icons-outlined text-6xl mb-4 opacity-50">inbox</span>
          <p className="text-lg font-bold">No applications in this phase</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">{app.name}</h3>
                      {app.email && <p className="text-sm text-gray-500">{app.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Medium</p>
                      <p className="font-bold text-black">{app.medium || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">District</p>
                      <p className="font-bold text-black">{app.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {(app.requestedSubjects || []).map((subject) => (
                          <span key={subject} className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {app.phase1Notes && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phase 1 Notes</p>
                      <p className="text-sm text-gray-700">{app.phase1Notes}</p>
                    </div>
                  )}
                  {app.phase2TeleverificationNotes && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Televerification Notes</p>
                      <p className="text-sm text-gray-700">{app.phase2TeleverificationNotes}</p>
                    </div>
                  )}
                  {app.phase3PanelInterviewNotes && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Panel Interview Notes</p>
                      <p className="text-sm text-gray-700">{app.phase3PanelInterviewNotes}</p>
                    </div>
                  )}

                  {app.student && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-bold text-green-800">
                        ✓ Student created: {app.student.name} (ID: {app.student.id.slice(0, 8)}...)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {getNextPhase(app.phase) && app.phase !== 'Rejected' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setPhaseNotes('');
                        setIsRejectAction(false);
                        setShowPhaseModal(true);
                      }}
                      className="px-4 py-2 bg-maatram-yellow text-black rounded-lg font-bold hover:bg-maatram-yellow-dark transition-colors text-sm"
                    >
                      Move to {PHASES[getNextPhase(app.phase)]?.label || 'Next'}
                    </button>
                  )}
                  {app.phase !== 'Rejected' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setPhaseNotes('');
                        setIsRejectAction(true);
                        setShowPhaseModal(true);
                      }}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-bold hover:bg-red-200 transition-colors text-sm"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Application Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">New Student Application</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-black"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Guardian Contact</label>
                <input
                  type="tel"
                  value={formData.guardianContact}
                  onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Medium</label>
                  <select
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                  >
                    <option value="">Select medium</option>
                    {MEDIUMS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Requested Subjects</label>
                <div className="grid grid-cols-4 gap-2">
                  {SUBJECTS.map((subject) => (
                    <label key={subject} className="flex items-center gap-2 p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.requestedSubjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                        className="rounded"
                      />
                      <span className="text-sm font-bold">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Create Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase Update Modal */}
      {showPhaseModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Update Phase</h2>
              <button
                onClick={() => {
                  setShowPhaseModal(false);
                  setSelectedApp(null);
                  setPhaseNotes('');
                  setIsRejectAction(false);
                }}
                className="text-gray-400 hover:text-black"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Application: <span className="font-bold">{selectedApp.name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Current Phase: <span className="font-bold">{PHASES[selectedApp.phase]?.label} - {PHASES[selectedApp.phase]?.sublabel}</span>
              </p>
              {isRejectAction ? (
                <p className="text-sm text-red-600 font-bold">⚠️ This will reject the application</p>
              ) : (
                <p className="text-sm text-gray-600">
                  Next Phase: <span className="font-bold">{PHASES[getNextPhase(selectedApp.phase)]?.label} - {PHASES[getNextPhase(selectedApp.phase)]?.sublabel}</span>
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
              <textarea
                value={phaseNotes}
                onChange={(e) => setPhaseNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maatram-yellow focus:border-transparent"
                placeholder="Add notes for this phase..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmPhaseUpdate}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-colors ${isRejectAction
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-maatram-yellow text-black hover:bg-maatram-yellow-dark'
                  }`}
              >
                {isRejectAction ? 'Confirm Rejection' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowPhaseModal(false);
                  setSelectedApp(null);
                  setPhaseNotes('');
                  setIsRejectAction(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Selection;
