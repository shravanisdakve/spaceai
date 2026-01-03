import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../Common/ui';
import { useAuth, User } from '../../hooks/useAuth';
import { User as UserIcon, BookOpen, Settings, Shield, Camera, X, Bell, Globe, Github, Linkedin, Twitter } from 'lucide-react';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onSave: (updates: Partial<User>) => Promise<void>;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, onSave }) => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'preferences' | 'security' | 'notifications'>('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (isOpen && currentUser) {
            setFormData({ ...currentUser });
        }
    }, [isOpen, currentUser]);

    const handleChange = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const TabButton = ({ id, icon: Icon, label }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === id
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <div className="flex flex-col gap-6 h-[70vh]">

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600">
                    <TabButton id="personal" icon={UserIcon} label="Personal" />
                    <TabButton id="education" icon={BookOpen} label="Education" />
                    <TabButton id="preferences" icon={Settings} label="Preferences" />
                    <TabButton id="notifications" icon={Bell} label="Notifications" />
                    <TabButton id="security" icon={Shield} label="Security" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">

                    {activeTab === 'personal' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden ring-2 ring-slate-600">
                                        {formData.photoURL ? (
                                            <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <UserIcon size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="absolute bottom-0 right-0 p-1.5 bg-violet-600 rounded-full text-white hover:bg-violet-500 transition-colors shadow-lg"
                                        onClick={() => {
                                            const url = prompt("Enter Image URL for Avatar:");
                                            if (url) handleChange('photoURL', url);
                                        }}
                                        title="Change Avatar"
                                    >
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Profile Photo</h3>
                                    <p className="text-xs text-slate-400">Click the camera icon to set a custom URL.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
                                    <Input value={formData.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} placeholder="First Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                                    <Input value={formData.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} placeholder="Last Name" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
                                    <Input value={formData.displayName || ''} onChange={e => handleChange('displayName', e.target.value)} placeholder="Display Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Date of Birth</label>
                                    <Input value={formData.dateOfBirth || ''} onChange={e => handleChange('dateOfBirth', e.target.value)} type="date" className="text-slate-200" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                                    <Input value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} placeholder="City, Country" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone (Optional)</label>
                                    <Input value={formData.phoneNumber || ''} onChange={e => handleChange('phoneNumber', e.target.value)} placeholder="+1 234 567 890" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Bio</label>
                                <textarea
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                                    rows={3}
                                    value={formData.bio || ''}
                                    onChange={e => handleChange('bio', e.target.value)}
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>

                            {/* Social Links */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">Social Links</label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Github size={16} className="absolute left-3 top-3 text-slate-500" />
                                        <Input className="pl-9" placeholder="GitHub URL" value={formData.githubUrl || ''} onChange={e => handleChange('githubUrl', e.target.value as any)} />
                                    </div>
                                    <div className="relative">
                                        <Linkedin size={16} className="absolute left-3 top-3 text-slate-500" />
                                        <Input className="pl-9" placeholder="LinkedIn URL" value={formData.linkedinUrl || ''} onChange={e => handleChange('linkedinUrl', e.target.value as any)} />
                                    </div>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-3 text-slate-500" />
                                        <Input className="pl-9" placeholder="Portfolio / Website" value={formData.websiteUrl || ''} onChange={e => handleChange('websiteUrl', e.target.value as any)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">University / School</label>
                                <Input value={formData.university || ''} onChange={e => handleChange('university', e.target.value)} placeholder="University Name" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Degree / Program</label>
                                    <Input value={formData.degree || ''} onChange={e => handleChange('degree', e.target.value)} placeholder="e.g. B.Sc, High School" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Year of Study</label>
                                    <Select value={formData.yearOfStudy || ''} onChange={e => handleChange('yearOfStudy', e.target.value)}>
                                        <option value="">Select Year</option>
                                        <option value="Freshman">Freshman / Year 1</option>
                                        <option value="Sophomore">Sophomore / Year 2</option>
                                        <option value="Junior">Junior / Year 3</option>
                                        <option value="Senior">Senior / Year 4</option>
                                        <option value="Graduate">Graduate</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Field of Study / Major</label>
                                    <Input value={formData.fieldOfStudy || ''} onChange={e => handleChange('fieldOfStudy', e.target.value)} placeholder="e.g. Computer Science" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">GPA (Optional)</label>
                                    <Input value={formData.gpa || ''} onChange={e => handleChange('gpa', e.target.value)} placeholder="e.g. 3.8" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Academic Goals</label>
                                <Input value={formData.academicGoals || ''} onChange={e => handleChange('academicGoals', e.target.value)} placeholder="What do you want to achieve?" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">App Theme</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${formData.theme === 'dark' || !formData.theme ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                                        <input type="radio" name="theme" className="hidden" checked={formData.theme !== 'light'} onChange={() => handleChange('theme', 'dark')} />
                                        <div className="font-medium text-white">Dark Mode</div>
                                        <div className="text-xs text-slate-400">Default immersive dark theme</div>
                                    </label>
                                    <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors opacity-50 cursor-not-allowed ${formData.theme === 'light' ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700'}`}>
                                        <input type="radio" name="theme" className="hidden" disabled />
                                        <div className="font-medium text-white">Light Mode</div>
                                        <div className="text-xs text-slate-400">Coming soon</div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Preferred Study Language</label>
                                <Select value={formData.studyLanguage || 'English'} onChange={e => handleChange('studyLanguage', e.target.value)}>
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Mandarin">Mandarin</option>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Learning Style</label>
                                <Select value={formData.learningStyle || ''} onChange={e => handleChange('learningStyle', e.target.value)}>
                                    <option value="">Select Style</option>
                                    <option value="Visual">Visual (Images, Diagrams)</option>
                                    <option value="Auditory">Auditory (Listening, Discussing)</option>
                                    <option value="Reading">Reading/Writing</option>
                                    <option value="Kinesthetic">Kinesthetic (Hands-on)</option>
                                </Select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <p className="text-xs text-slate-400 mb-2">Manage how we communicate with you.</p>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                                    <p className="text-xs text-slate-400">Receive weekly summaries and major updates.</p>
                                </div>
                                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Study Reminders</h4>
                                    <p className="text-xs text-slate-400">Get nudges to stick to your schedule.</p>
                                </div>
                                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Achievement Sounds</h4>
                                    <p className="text-xs text-slate-400">Play a sound when you unlock a badge.</p>
                                </div>
                                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-white">Two-Factor Authentication</h4>
                                        <p className="text-xs text-slate-400">Add an extra layer of security to your account.</p>
                                    </div>
                                    <div className="h-6 w-11 bg-slate-700 rounded-full relative cursor-not-allowed opacity-50">
                                        <div className="absolute left-1 top-1 h-4 w-4 bg-slate-500 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-yellow-500/80 mt-2">Currently unavailable for this account type.</p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-medium text-white mb-2">Change Password</h4>
                                <div className="space-y-2">
                                    <Input placeholder="Current Password" type="password" disabled />
                                    <Input placeholder="New Password" type="password" disabled />
                                    <Button disabled className="w-full text-xs">Update Password (Disabled)</Button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Password management is handled by the administrator or disabled in this demo.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSave} isLoading={isSaving}>Save Changes</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileEditModal;
