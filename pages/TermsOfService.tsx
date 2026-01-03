import React from 'react';
import { PageHeader } from '../components/Common/ui';
import { Shield, FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Terms of Service"
                subtitle="Please read these terms carefully before using our platform."
            />

            <div className="bg-slate-800/50 p-8 rounded-xl ring-1 ring-slate-700 space-y-8 text-slate-300">
                <div className="flex items-center gap-3 text-violet-400 mb-2">
                    <FileText size={24} />
                    <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                </div>
                <p>
                    By accessing and using NexusAI ("the Service"), you agree to be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use our Service.
                </p>

                <div className="flex items-center gap-3 text-violet-400 mb-2">
                    <Shield size={24} />
                    <h2 className="text-xl font-semibold text-white">2. Educational Use</h2>
                </div>
                <p>
                    NexusAI is an educational support tool designed to assist with learning and productivity.
                    While we strive for accuracy, AI-generated content may occasionally be incorrect or misleading.
                    Always verify important information with trusted sources.
                </p>

                <div className="flex items-center gap-3 text-violet-400 mb-2">
                    <FileText size={24} />
                    <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
                </div>
                <p>
                    You are responsible for safeguarding your account credentials. You agree not to disclose your password to any third party.
                    You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>

                <div className="flex items-center gap-3 text-violet-400 mb-2">
                    <Shield size={24} />
                    <h2 className="text-xl font-semibold text-white">4. User Conduct</h2>
                </div>
                <p>
                    You agree not to misuse the Service or help anyone else do so. This includes disrupting the Service,
                    abusing the AI generation features, or attempting to access areas of the Service that you are not authorized to access.
                </p>

                <div className="flex items-center gap-3 text-violet-400 mb-2">
                    <FileText size={24} />
                    <h2 className="text-xl font-semibold text-white">5. Changes to Terms</h2>
                </div>
                <p>
                    We reserve the right to modify these terms at any time. We will always post the most current version on our website.
                    By continuing to use the Service after changes become effective, you agree to be bound by the revised terms.
                </p>
            </div>
        </div>
    );
};

export default TermsOfService;
