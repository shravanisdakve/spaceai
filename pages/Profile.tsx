import React, { useState, useEffect } from 'react';
import { useAuth, User } from '../hooks/useAuth';
import { Button, Input, PageHeader } from '../components/Common/ui';
import { User as UserIcon, BookOpen, Settings, Shield, Edit2, Camera, Save, X, Share2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const Profile: React.FC = () => {
    const { currentUser, updateUserProfile } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'general' | 'education' | 'preferences' | 'security' | 'privacy'>('general');
    const [isLoading, setIsLoading] = useState(false);

    // Form state - initialized from currentUser
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (currentUser) {
            setFormData(currentUser);
        }
    }, [currentUser]);

    const handleInputChange = (field: keyof User | string, value: any) => {
        setFormData(prev => {
            // Handle nested updates (e.g. 'preferences.theme')
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...((prev as any)[parent] || {}),
                        [child]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateUserProfile(formData);
            showToast("Profile updated successfully!", "success");
        } catch (error) {
            showToast("Failed to update profile.", "error");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Sub-Components for Tabs ---

    const GeneralTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-4 ring-slate-800">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-slate-400">
                                {formData.displayName?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-violet-600 rounded-full hover:bg-violet-500 transition-colors shadow-lg">
                        <Camera size={16} className="text-white" />
                    </button>
                    {/* Placeholder for avatar upload logic */}
                </div>
                <div>
                    <h3 className="text-lg font-medium text-slate-100">Profile Photo</h3>
                    <p className="text-sm text-slate-400">This will be displayed on your profile.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                    <Input
                        value={formData.displayName || ''}
                        onChange={e => handleInputChange('displayName', e.target.value)}
                        placeholder="Public Display Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <Input
                        value={formData.email || ''}
                        disabled
                        className="opacity-50 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                    <Input
                        value={formData.firstName || ''}
                        onChange={e => handleInputChange('firstName', e.target.value)}
                        placeholder="First Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                    <Input
                        value={formData.lastName || ''}
                        onChange={e => handleInputChange('lastName', e.target.value)}
                        placeholder="Last Name"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                    <textarea
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500 resize-none h-24"
                        value={formData.bio || ''}
                        onChange={e => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us a little bit about yourself..."
                        maxLength={200}
                    />
                    <div className="text-right text-xs text-slate-500 mt-1">
                        {(formData.bio?.length || 0)}/200
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                    <Input
                        value={formData.location || ''}
                        onChange={e => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number (Optional)</label>
                    <Input
                        value={formData.phoneNumber || ''}
                        onChange={e => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
                    <Input
                        type="date"
                        value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Pronouns</label>
                    <Input
                        value={formData.pronouns || ''}
                        onChange={e => handleInputChange('pronouns', e.target.value)}
                        placeholder="e.g. they/them"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Website / Portfolio</label>
                    <Input
                        value={formData.website || ''}
                        onChange={e => handleInputChange('website', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
                {/* Socials */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700 pt-4 mt-2">
                    <p className="md:col-span-3 text-sm font-medium text-slate-300">Social Profiles</p>
                    <Input
                        value={formData.socials?.linkedin || ''}
                        onChange={e => handleInputChange('socials.linkedin', e.target.value)}
                        placeholder="LinkedIn URL"
                    />
                    <Input
                        value={formData.socials?.github || ''}
                        onChange={e => handleInputChange('socials.github', e.target.value)}
                        placeholder="GitHub URL"
                    />
                    <Input
                        value={formData.socials?.twitter || ''}
                        onChange={e => handleInputChange('socials.twitter', e.target.value)}
                        placeholder="Twitter URL"
                    />
                </div>
            </div>
        </div>
    );

    const EducationTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">University / Global Campus</label>
                    <Input
                        value={formData.university || ''}
                        onChange={e => handleInputChange('university', e.target.value)}
                        placeholder="University Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Degree Program</label>
                    <Input
                        value={formData.degree || ''}
                        onChange={e => handleInputChange('degree', e.target.value)}
                        placeholder="e.g. B.S. Computer Science"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Year of Study</label>
                    <select
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                        value={formData.yearOfStudy || ''}
                        onChange={e => handleInputChange('yearOfStudy', e.target.value)}
                    >
                        <option value="">Select Year</option>
                        <option value="Freshman">Freshman / 1st Year</option>
                        <option value="Sophomore">Sophomore / 2nd Year</option>
                        <option value="Junior">Junior / 3rd Year</option>
                        <option value="Senior">Senior / 4th Year</option>
                        <option value="Graduate">Graduate Student</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Field of Study</label>
                    <Input
                        value={formData.fieldOfStudy || ''}
                        onChange={e => handleInputChange('fieldOfStudy', e.target.value)}
                        placeholder="e.g. Artificial Intelligence"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">GPA (Optional)</label>
                    <Input
                        value={formData.gpa || ''}
                        onChange={e => handleInputChange('gpa', e.target.value)}
                        placeholder="e.g. 3.8"
                    />
                </div>
                <textarea
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500 resize-none h-24"
                    value={formData.academicGoals || ''}
                    onChange={e => handleInputChange('academicGoals', e.target.value)}
                    placeholder="What do you hope to achieve?"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Expected Graduation</label>
                <Input
                    type="date"
                    value={formData.expectedGraduation ? new Date(formData.expectedGraduation).toISOString().split('T')[0] : ''}
                    onChange={e => handleInputChange('expectedGraduation', e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Languages (Comma separated)</label>
                <Input
                    value={formData.languages?.join(', ') || ''}
                    onChange={e => handleInputChange('languages', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="English, Spanish, Python..."
                />
            </div>
        </div>
    );

    const PreferencesTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Preferred Study Language</label>
                    <select
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                        value={formData.preferences?.studyLanguage || 'English'}
                        onChange={e => handleInputChange('preferences.studyLanguage', e.target.value)}
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Hindi">Hindi</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">App Theme</label>
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${(!formData.preferences?.theme || formData.preferences?.theme === 'dark') ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            onClick={() => handleInputChange('preferences.theme', 'dark')}
                        >
                            Dark Mode
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${(formData.preferences?.theme === 'light') ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            onClick={() => handleInputChange('preferences.theme', 'light')}
                        >
                            Light Mode
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Learning Pace</label>
                    <select
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                        value={formData.preferences?.learningPace || 'Intermediate'}
                        onChange={e => handleInputChange('preferences.learningPace', e.target.value)}
                    >
                        <option value="Beginner">Beginner (Slow & Detailed)</option>
                        <option value="Intermediate">Intermediate (Balanced)</option>
                        <option value="Advanced">Advanced (Fast & Concise)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Learning Style</label>
                    <select
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                        value={formData.preferences?.learningStyle || 'Visual'}
                        onChange={e => handleInputChange('preferences.learningStyle', e.target.value)}
                    >
                        <option value="Visual">Visual (Images, Diagrams)</option>
                        <option value="Auditory">Auditory (Listening, Discussing)</option>
                        <option value="Reading">Reading/Writing</option>
                        <option value="Kinesthetic">Kinesthetic (Hands-on)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Study Session Duration</label>
                    <select
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                        value={formData.preferences?.studyDuration || 60}
                        onChange={e => handleInputChange('preferences.studyDuration', parseInt(e.target.value))}
                    >
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes</option>
                        <option value={90}>90 Minutes</option>
                        <option value={120}>2 Hours</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Notification Frequency</label>
                    <select
                        className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                        value={formData.preferences?.notificationFrequency || 'Daily'}
                        onChange={e => handleInputChange('preferences.notificationFrequency', e.target.value)}
                    >
                        <option value="Daily">Daily Summary</option>
                        <option value="Weekly">Weekly Digest</option>
                        <option value="As-needed">As Needed</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Interests (Comma separated)</label>
                <Input
                    value={formData.preferences?.interests?.join(', ') || ''}
                    onChange={e => handleInputChange('preferences.interests', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="e.g. Physics, Coding, History"
                />
            </div>
        </div >
    );

    const SecurityTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-700">
                <h4 className="text-lg font-medium text-white mb-4">Account Security</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-200 font-medium">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-400">Add an extra layer of security to your account.</p>
                        </div>
                        <div className="h-6 w-11 bg-slate-700 rounded-full cursor-not-allowed opacity-50 relative">
                            <div className="absolute left-1 top-1 h-4 w-4 bg-slate-400 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div>
                            <p className="text-slate-200 font-medium">Password</p>
                            <p className="text-xs text-slate-400">Last changed: Never</p>
                        </div>
                        <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                </div>
            </div>

            <div className="bg-red-900/10 p-6 rounded-xl ring-1 ring-red-900/50">
                <h4 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h4>
                <p className="text-sm text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full sm:w-auto">Default Account</Button>
            </div>
        </div>
    );

    const PrivacyTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-700">
                <h4 className="text-lg font-medium text-white mb-4">Privacy Settings</h4>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Profile Visibility</label>
                        <select
                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500"
                            value={formData.settings?.privacy?.profileVisibility || 'public'}
                            onChange={e => handleInputChange('settings.privacy.profileVisibility', e.target.value)}
                        >
                            <option value="public">Public (Visible to everyone)</option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private (Only me)</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                        <div>
                            <p className="text-slate-200 font-medium">Show GPA on Profile</p>
                            <p className="text-xs text-slate-400">Allow others to see your GPA.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={formData.settings?.privacy?.showGPA || false}
                            onChange={e => handleInputChange('settings.privacy.showGPA', e.target.checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                        <div>
                            <p className="text-slate-200 font-medium">Activity Feed Visibility</p>
                            <p className="text-xs text-slate-400">Share your study streaks and game activity.</p>
                        </div>
                        <input // Using simple checkbox for now, can be toggle component
                            type="checkbox"
                            checked={formData.settings?.privacy?.showActivity !== false} // Default true
                            onChange={e => handleInputChange('settings.privacy.showActivity', e.target.checked)}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl ring-1 ring-slate-700">
                <h4 className="text-lg font-medium text-white mb-4">Data Management</h4>
                <Button variant="outline" size="sm">Export My Data</Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="My Profile"
                subtitle="Manage your personal information and preferences."
            />
            {/* Social Invite Section */}
            <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-600/20 rounded-lg text-violet-400">
                        <Share2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Invite Friends</h3>
                        <p className="text-sm text-slate-400">Share NexusAI with your study group!</p>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        navigator.clipboard.writeText("Check out NexusAI: https://nexusai.edu");
                        showToast("Invite link copied to clipboard!", "success");
                    }}
                >
                    Copy Link
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'general' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <UserIcon size={18} className="mr-3" />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('education')}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'education' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <BookOpen size={18} className="mr-3" />
                        Education
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'preferences' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <Edit2 size={18} className="mr-3" />
                        Preferences
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'security' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <Shield size={18} className="mr-3" />
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${activeTab === 'privacy' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <Settings size={18} className="mr-3" />
                        Privacy
                    </button>
                    {/* Achievements Tab Button - optional based on design, maybe inside Insights */}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-slate-700 min-h-[500px] relative">
                        {activeTab === 'general' && <GeneralTab />}
                        {activeTab === 'education' && <EducationTab />}
                        {activeTab === 'preferences' && <PreferencesTab />}
                        {activeTab === 'security' && <SecurityTab />}
                        {activeTab === 'privacy' && <PrivacyTab />}

                        {/* Save Button (Floating or Fixed at bottom) */}
                        <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                            <Button
                                onClick={handleSave}
                                isLoading={isLoading}
                                className="px-8"
                            >
                                <Save size={18} className="mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
