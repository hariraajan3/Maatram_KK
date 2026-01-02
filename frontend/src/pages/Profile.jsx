import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { fetchProfile, updateProfile } from '../services/api';
import { useAuth } from '../AuthContext';

const DISTRICTS = ['Chennai', 'Coimbatore', 'Other'];
const MEDIUMS = ['Tamil', 'English'];
const SUBJECTS = ['Physics', 'Maths', 'Chemistry', 'Commerce', 'Economics', 'Accounts', 'Tamil', 'English'];

const Profile = () => {
  const { onLogout } = useOutletContext();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({});

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProfile();
      setProfileData(data);

      const currentSubject = Array.isArray(data.tutoringSubjects) ? data.tutoringSubjects[0] : data.tutoringSubjects;

      setFormData({
        phoneNumber: data.phoneNumber || '',
        collegeOrCompany: data.collegeOrCompany || '',
        companyOrOrg: data.companyOrOrg || '',
        tutorAddress: data.tutorAddress || '',
        yearOfStudyingOrAlumni: data.yearOfStudyingOrAlumni || '',
        alumniOrYearStudying: data.alumniOrYearStudying || '',
        tutoringExperienceYears: data.tutoringExperienceYears || 0,
        tutoringDistrict: data.tutoringDistrict || '',
        tutoringMedium: data.tutoringMedium || '',
        tutoringSubjects: currentSubject || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const submitData = {
        ...formData,
        tutoringSubjects: formData.tutoringSubjects ? [formData.tutoringSubjects] : []
      };

      await updateProfile(submitData);
      await loadProfile();
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-maatram-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const role = profileData?.role;
  const initials = profileData?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Top Header - No Edit Button here */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-maatram-yellow flex items-center justify-center text-4xl font-black text-black">
          {initials}
        </div>

        <div className="flex-1 space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-black tracking-tight">{profileData?.name}</h1>
          <p className="text-gray-400 font-medium flex items-center justify-center md:justify-start gap-2">
            <span className="material-icons-outlined text-sm">alternate_email</span>
            {profileData?.email}
          </p>
          <div className="inline-flex items-center px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mt-2">
            {role?.replace('_', ' ')}
          </div>
        </div>

        <button onClick={onLogout} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
          <span className="material-icons-outlined">logout</span>
        </button>
      </div>

      {success && <div className="mb-6 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100">{success}</div>}
      {error && <div className="mb-6 px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          {/* Section Header with Edit Tool */}
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-xl">
                <span className="material-icons-outlined text-sky-500">person</span>
              </div>
              <h3 className="text-xl font-black text-black">General Information</h3>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-maatram-yellow text-black' : 'bg-gray-100 text-gray-400 hover:text-black'}`}
              title={isEditing ? 'Cancel Edit' : 'Edit Profile'}
            >
              <span className="material-icons-outlined">{isEditing ? 'close' : 'edit'}</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <DataField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} isEditing={isEditing} />

            {role === 'ADMIN' ? (
              <DataField label="Organization" name="companyOrOrg" value={formData.companyOrOrg} onChange={handleInputChange} isEditing={isEditing} />
            ) : (
              <DataField label="College / Company" name="collegeOrCompany" value={formData.collegeOrCompany} onChange={handleInputChange} isEditing={isEditing} />
            )}

            {/* Team Specifics */}
            {['TUTOR_LEAD', 'SELECTION_TEAM', 'ATTENDANCE_TRACKING_TEAM', 'CLASS_INSPECTION_TEAM'].includes(role) && (
              <DataField label="Academic / Alumni Status" name="yearOfStudyingOrAlumni" value={formData.yearOfStudyingOrAlumni} onChange={handleInputChange} isEditing={isEditing} />
            )}

            {/* Tutor Specifics */}
            {role === 'TUTOR' && (
              <>
                <DataField label="KK ID" value={profileData.kkId} readOnlyOnly />
                <DataField label="District" name="tutoringDistrict" value={formData.tutoringDistrict} onChange={handleInputChange} isEditing={isEditing} options={DISTRICTS} />
                <DataField label="Medium" name="tutoringMedium" value={formData.tutoringMedium} onChange={handleInputChange} isEditing={isEditing} options={MEDIUMS} />
                <DataField label="Subject" name="tutoringSubjects" value={formData.tutoringSubjects} onChange={handleInputChange} isEditing={isEditing} options={SUBJECTS} />
                <DataField label="Year / Alumni" name="alumniOrYearStudying" value={formData.alumniOrYearStudying} onChange={handleInputChange} isEditing={isEditing} />
                <DataField label="Experience (Years)" name="tutoringExperienceYears" value={formData.tutoringExperienceYears} onChange={handleInputChange} isEditing={isEditing} type="number" />
              </>
            )}
          </div>

          {role === 'TUTOR' && (
            <div className="space-y-4 pt-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Residential Address</label>
              {isEditing ? (
                <textarea
                  name="tutorAddress"
                  value={formData.tutorAddress}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-4 rounded-2xl border bg-white border-maatram-yellow shadow-inner ring-4 ring-maatram-yellow/5 font-bold text-sm outline-none"
                  placeholder="Enter full address"
                />
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-black/60 font-bold text-sm min-h-[60px]">
                  {formData.tutorAddress || 'No address provided'}
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4 animate-in slide-in-from-bottom-2">
            <button
              type="submit"
              disabled={saving}
              className="px-10 py-4 bg-maatram-yellow text-black rounded-2xl font-black shadow-xl hover:shadow-maatram-yellow/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-icons-outlined">check_circle</span>
              )}
              Update Profile
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const DataField = ({ label, name, value, onChange, isEditing, options, type = "text", readOnlyOnly }) => {
  if (readOnlyOnly) {
    return (
      <div className="space-y-1">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-50 text-gray-400 font-bold text-sm">
          {value || 'N/A'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      {!isEditing ? (
        <div className="p-4 border-b border-gray-100 font-bold text-black text-sm">
          {value || <span className="text-gray-300 font-medium">Not set</span>}
        </div>
      ) : (
        options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-4 rounded-2xl border bg-white border-maatram-yellow shadow-inner ring-4 ring-maatram-yellow/5 font-bold text-sm outline-none"
          >
            <option value="">Select {label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full p-4 rounded-2xl border bg-white border-maatram-yellow shadow-inner ring-4 ring-maatram-yellow/5 font-bold text-sm outline-none"
          />
        )
      )}
    </div>
  );
};

export default Profile;
