import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../Common/ui'; // Adjust path as ui.tsx is now in Common
import { useAuth } from '../../contexts/AuthContext'; // Adjust path for AuthContext

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onSave: (newName: string) => Promise<void>;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, currentName, onSave }) => {
    const [newName, setNewName] = useState(currentName);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setNewName(currentName);
            setError(null);
        }
    }, [isOpen, currentName]);

    const handleSave = async () => {
        if (!newName.trim() || newName === currentName) {
            onClose();
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await onSave(newName.trim());
            onClose();
        } catch (err) {
            console.error("Profile save failed:", err);
            setError(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <div className="space-y-4">
                <div>
                    <label htmlFor="displayNameSidebar" className="block text-sm font-medium text-slate-300 mb-1">
                        Display Name
                    </label>
                    <Input
                        id="displayNameSidebar" // Use unique ID if needed
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter your display name"
                        disabled={isSaving}
                    />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={!newName.trim() || newName === currentName || isSaving}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileEditModal;
