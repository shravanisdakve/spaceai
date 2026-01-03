import React, { useState } from 'react';
import { createGroup } from '../../services/groupService';
import { Button, Input } from '../Common/ui';
import { X, Users, Tag } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
            await createGroup(name, description, tagList, isPrivate);
            showToast("Group created successfully!", "success");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showToast("Failed to create group", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-xl max-w-md w-full border border-slate-700 shadow-2xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-violet-500" /> Create Study Group
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Group Name</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Physics Pioneers"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                        <textarea
                            className="w-full bg-slate-800 border-none rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-violet-500 resize-none h-24 text-sm"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What is this group about?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Tags (Comma separated)</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                            <Input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="math, exam-prep, casual"
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 cursor-pointer" onClick={() => setIsPrivate(!isPrivate)}>
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={e => setIsPrivate(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 text-violet-600 focus:ring-violet-500 bg-slate-700"
                        />
                        <div>
                            <span className="block text-sm font-medium text-slate-200">Private Group</span>
                            <span className="block text-xs text-slate-500">Only invited members can join</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full bg-violet-600 hover:bg-violet-500"
                    >
                        Create Group
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
