import { useState, useEffect } from 'react';
import {
  studentRejected,  
  fetchApplicationsByPhase,
  fetchRejectedApplications,
  createApplication,
  updateStudent,
  phaseAdvanced,
  selectionStats
} from '../services/selectionApi';

const PHASES = {
  phase1: {
    label: 'phase 1',
    sublabel: 'Tele-verification',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'phone',
    description: 'Phone verification in progress'
  },
  phase2: {
    label: 'phase 2',
    sublabel: 'Panel Interview',
    color: 'bg-purple-100 text-purple-800',
    icon: 'groups',
    description: 'Final panel interview'
  },
  phase3: {
    label: 'phase 3',
    sublabel: 'Final Selection',
    color: 'bg-green-100 text-green-800',
    icon: 'inbox',
    description: 'Students cleared for scheduling'
  },
};

const MEDIUMS = ['Tamil', 'English'];
const DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
  'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai',
  'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
  'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];
const SUBJECTS = ['Physics', 'Maths', 'Chemistry', 'Biology', 'Computer Science', 'Business Maths', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English'];

const createSubjectInputs = () => Array.from({ length: 6 }, () => ({ subject: '', mark: '' }));

const Selection = () => {
  const [activeTab, setActiveTab] = useState('phase1');
  const [applications, setApplications] = useState([]);
  const [applicationStats , setApplicationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [overallRejectedApplications, setOverallRejectedApplications] = useState([]);
  const [phaseNotes, setPhaseNotes] = useState('');
  const [isRejectAction, setIsRejectAction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [subjectInputs, setSubjectInputs] = useState(createSubjectInputs());

  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    address: '',
    district: '',
    medium: '',
    email: '',
    yearOfStudying: '12th',
    publicMark: '',
    subjectMarks: {},
    phoneNumber: '',
    parentName: '',
    tutoringSubjects: [],
  });

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const loadApplications = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const applicationStats = await selectionStats();
      setApplicationStats(applicationStats);

      const rejectedResponse = await fetchRejectedApplications();
      setOverallRejectedApplications(Array.isArray(rejectedResponse?.applications) ? rejectedResponse.applications : []);

      const response = await fetchApplicationsByPhase(activeTab);
      console.log(response);
      const mappedData = Array.isArray(response?.applications) ? response.applications : [];
      console.log(mappedData);
      setApplications(mappedData);
      setStats(response?.stats || null);
    }
    catch (error) {
      console.error('Failed to load applications:', error);
      setErrorMessage(error.response?.data?.message || error.selectionResponse?.data?.message || 'Failed to load applications');
      setApplications([]);
      setStats(null);
    }
    finally {
      setLoading(false);
    }
  };

  const buildApplicationPayload = (data) => ({
    name: data.name,
    schoolName: data.schoolName,
    address: data.address,
    district: data.district,
    medium: data.medium,
    email: data.email,
    yearOfStudying: data.yearOfStudying || '12th',
    publicMark: data.publicMark,
    subjectMarks: data.subjectMarks || {},
    phoneNumber: data.phoneNumber,
    parentName: data.parentName,
    tutoringSubjects: Array.isArray(data.tutoringSubjects) ? data.tutoringSubjects : [],
  });

  // Form submit handling
  const handleSubmit = async (e) => {
    e.preventDefault();

    const subjectMarksObject = {};
    subjectInputs.forEach((item) => {
      const subject = item.subject?.trim();
      const markValue = item.mark?.toString().trim();

      if (subject && markValue !== '') {
        subjectMarksObject[subject] = Number(markValue);
      }
    });

    try {
      const payload = buildApplicationPayload({
        ...formData,
        subjectMarks: subjectMarksObject,
      });

      if (isEditing) {
        await updateStudent(selectedApp.id, payload);
        setSuccessMessage('Profile updated successfully');
      }
      else {
        await createApplication(payload);
        setSuccessMessage('Application created successfully');
      }
      setShowForm(false);
      resetForm();
      loadApplications();
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    catch (error) {
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
      yearOfStudying: '12th',
      publicMark: '',
      subjectMarks: {},
      phoneNumber: '',
      parentName: '',
      tutoringSubjects: [],
    });
    setSubjectInputs(createSubjectInputs());
    setIsEditing(false);
    setSelectedApp(null);
  };

  const confirmPhaseUpdate = async () => {
    if (!selectedApp) return;

    try {
      if (isRejectAction) {
        await studentRejected(selectedApp.id, phaseNotes);
        setSuccessMessage('Application rejected successfully');
      }
      else {
        const targetPhase = activeTab;

        if (!['phase1', 'phase2'].includes(targetPhase)) {
          setErrorMessage('Cannot update phase');
          return;
        }

        await phaseAdvanced(selectedApp.id, targetPhase, phaseNotes);
        setSuccessMessage('Application moved to next phase successfully');
      }

      setShowPhaseModal(false);
      setSelectedApp(null);
      setPhaseNotes('');
      setIsRejectAction(false);
      loadApplications();
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    catch (error) {
      setErrorMessage('Failed to update phase: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleSubject = (subject) => {
    setFormData((prev) => ({
      ...prev,
      tutoringSubjects: prev.tutoringSubjects.includes(subject)
        ? prev.tutoringSubjects.filter((s) => s !== subject)
        : [...prev.tutoringSubjects, subject],
    }));
  };

  const handleEdit = (app) => {
    setSelectedApp(app);
    const existingMarks = app.student?.subjectMarks || {};
    const mappedInputs = Object.entries(existingMarks).slice(0, 6).map(([subject, mark]) => ({
      subject,
      mark: mark ?? '',
    }));

    while (mappedInputs.length < 6) {
      mappedInputs.push({ subject: '', mark: '' });
    }

    setFormData({
      name: app.student?.name || app.name || '',
      schoolName: app.student?.schoolName || app.schoolName || '',
      address: app.student?.address || app.address || '',
      district: app.student?.district || app.district || '',
      medium: app.student?.medium || app.medium || '',
      email: app.student?.email || app.email || '',
      yearOfStudying: app.student?.yearOfStudying || '12th',
      publicMark: app.student?.class11PublicMarks ?? '',
      subjectMarks: { ...existingMarks },
      phoneNumber: app.student?.phoneNumber || '',
      parentName: app.student?.parentName || '',
      tutoringSubjects: Array.isArray(app.student?.tutoringSubjects) ? app.student.tutoringSubjects : [],
    });
    setSubjectInputs(mappedInputs);
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Stats Summary Bar */}
        {loading ? 
        (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
               <span className="material-icons-outlined">people</span>
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Applications</p>
               <p className="text-2xl font-black text-black">
                 ...
              </p>
             </div>
           </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <span className="material-icons-outlined">check_circle</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Selected</p>
                <p className="text-2xl font-black text-black">
                  ...
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
                  ...
                </p>
              </div>
            </div>
          </div>
        ): 
        ( <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-icons-outlined">people</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Applications</p>
              <p className="text-2xl font-black text-black">
                {applicationStats?.totalApplications || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <span className="material-icons-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Selected</p>
              <p className="text-2xl font-black text-black">
                {applicationStats?.selected || 0}
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
                {applicationStats?.rejected || 0}
              </p>
            </div>
          </div>
        </div>
        )}

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

      {/* Current Phase Students Summary */}
      {!loading && applications.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <p className="text-[11px] uppercase tracking-widest font-black text-blue-600 mb-1">Current Phase</p>
              <h3 className="text-xl font-black text-gray-900">{applications.length} Students</h3>
        </div>
      )}

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
            <div key={app.student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold">
                      {app.student.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-black">{app.student.name}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-black tracking-wider uppercase border border-gray-200">
                          {app.student.kkId || 'P001'}
                        </span>
                        {(app.teleStatus === 'REJECTED' || app.panelStatus === 'REJECTED') && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black uppercase">Rejected</span>
                        )}
                      </div>
                      {app.student.email && <p className="text-sm text-gray-500">{app.student.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Medium & District</p>
                      <p className="text-sm font-bold text-black">{app.student.medium || 'N/A'} | {app.student.district || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Contact</p>
                      <p className="text-sm font-bold text-black">{app.student.phoneNumber || 'N/A'}</p>
                      <p className="text-[11px] text-gray-600">Parent: {app.student.parentName || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Academic</p>
                      <p className="text-sm font-bold text-black">{app.student.yearOfStudying || '12th'} | {app.student.schoolName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider">Marks (11th Public)</p>
                      <span className="text-lg font-black text-black">{app.student.class11PublicMarks || 'N/A'}</span>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {app.student.subjectMarks && Object.entries(app.student.subjectMarks).map(([subject, mark], idx) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                            {subject}: {mark}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <div className="w-full">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider text-right">Tutoring Subjects</p>
                        <div className="flex flex-wrap justify-end gap-1.5 mt-1 w-full">
                          {(app.student.tutoringSubjects || []).map((subject, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm">
                              {subject}
                            </span>
                          ))}
                        </div>
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
                  {activeTab !== 'phase3' && (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setPhaseNotes('');
                        setIsRejectAction(false);
                        setShowPhaseModal(true);
                      }}
                      className="px-4 py-2.5 bg-maatram-yellow text-black rounded-lg font-bold hover:bg-maatram-yellow-dark transition-all text-sm whitespace-nowrap shadow-sm"
                    >
                      Move to Next Phase
                    </button>
                  )}

                  {!(app.teleStatus === 'REJECTED' || app.panelStatus === 'REJECTED') && (
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

      {/* Overall Rejected Students */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-black text-red-600 mb-1">Rejected Students</p>
              <h3 className="text-xl font-black text-black">Overall rejections</h3>
              <p className="text-sm text-gray-500">Students rejected in any phase of the selection flow.</p>
            </div>
            <span className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-black border border-red-100">
              {overallRejectedApplications.length} total
            </span>
          </div>

          {overallRejectedApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-red-100 bg-red-50/60 p-8 text-center text-gray-500">
              <span className="material-icons-outlined text-4xl mb-3 text-red-300">block</span>
              <p className="text-sm font-bold text-gray-600">No rejected students yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {overallRejectedApplications.map((app) => (
                <article key={app.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-black">{app.student?.name || 'Unknown student'}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">Rejected</span>
                      </div>
                      <p className="text-sm text-gray-500">{app.student?.email || 'No email provided'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-white border border-gray-200 text-[10px] font-black tracking-widest uppercase text-gray-500">
                      {app.student?.kkId || 'P001'}
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm text-gray-700">
                    <div className="rounded-xl bg-white border border-gray-100 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Contact</p>
                      <p><span className="font-bold text-gray-500">Phone:</span> {app.student?.phoneNumber || 'N/A'}</p>
                      <p><span className="font-bold text-gray-500">Parent:</span> {app.student?.parentName || 'N/A'}</p>
                      <p><span className="font-bold text-gray-500">Address:</span> {app.student?.address || 'N/A'}</p>
                    </div>

                    <div className="rounded-xl bg-white border border-gray-100 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Academic</p>
                      <p><span className="font-bold text-gray-500">Medium:</span> {app.student?.medium || 'N/A'}</p>
                      <p><span className="font-bold text-gray-500">District:</span> {app.student?.district || 'N/A'}</p>
                      <p><span className="font-bold text-gray-500">School:</span> {app.student?.schoolName || 'N/A'}</p>
                      <p><span className="font-bold text-gray-500">Class:</span> {app.student?.yearOfStudying || 'N/A'}</p>
                      <p><span className="font-bold text-gray-500">Public mark:</span> {app.student?.class11PublicMarks || 'N/A'}</p>
                    </div>

                    <div className="rounded-xl bg-white border border-gray-100 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">Subjects & Notes</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(app.student?.tutoringSubjects || []).length ?
                          (app.student.tutoringSubjects || []).map((subject, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider">{subject}</span>
                          )) :
                          <span className="text-gray-500 text-xs">No subjects listed</span>
                        }
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {app.student?.subjectMarks && Object.entries(app.student.subjectMarks).map(([subject, mark], idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-wider">{subject}: {mark}</span>
                        ))}
                      </div>
                      {(app.phase1Notes || app.phase2Notes) && (
                        <p className="mt-3 text-xs text-gray-600">{app.phase1Notes || app.phase2Notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                    {app.teleStatus === 'REJECTED' && <span className="px-2.5 py-1 rounded-lg bg-yellow-100 text-yellow-700">Rejected in Tele Verification</span>}
                    {app.panelStatus === 'REJECTED' && <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700">Rejected in Panel Interview</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enrollment Form */}
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Public Mark *</label>
                  <input type="number" required value={formData.publicMark} onChange={(e) => setFormData({ ...formData, publicMark: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
              </div>

              {/* Subject Marks Section */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    11th Exam Subject Marks
                  </label>
                </div>

                <div className="space-y-3">
                  {subjectInputs.map((item, idx) => (
                    <div key={idx} className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          Subject {idx + 1}
                        </label>

                        <input
                          type="text"
                          placeholder="Enter Subject"
                          value={item.subject}
                          readOnly={isEditing}
                          onChange={(e) => {
                            const updated = [...subjectInputs];
                            updated[idx].subject = e.target.value;
                            setSubjectInputs(updated);
                          }}
                          className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-lg"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          Mark
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={item.mark}
                          onChange={(e) => {
                            const updated = [...subjectInputs];
                            updated[idx].mark = e.target.value;
                            setSubjectInputs(updated);
                          }}
                          className="w-full px-3 py-3 bg-gray-50 border border-gray-100 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone *</label>
                  <input type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent *</label>
                  <input type="text" required value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-maatram-yellow/20 outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Tutoring Subjects *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SUBJECTS.map((subject) => (
                    <button type="button" key={subject} onClick={() => toggleSubject(subject)} className={`p-3 rounded-xl border text-xs font-black transition-all ${formData.tutoringSubjects.includes(subject) ? 'bg-black text-white border-black shadow-lg scale-[1.05]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
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
              <p className="text-sm font-bold text-gray-600 mb-2">Updating: <span className="text-black">{selectedApp?.student?.name || selectedApp?.name || 'Selected student'}</span></p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${isRejectAction ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  {isRejectAction ? 'Reject student' : `Move to next phase`}
                </span>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes </label>
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
