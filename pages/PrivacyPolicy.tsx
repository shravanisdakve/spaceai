import React from 'react';
import { PageHeader } from '../components/ui';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-xl p-8 ring-1 ring-slate-700 shadow-lg">
        <PageHeader title="Privacy Policy" subtitle="Your privacy is important to us." />

        <div className="prose prose-invert mt-8">
          <p>
            It is NexusAI's policy to respect your privacy regarding any information we may collect from you across our website.
          </p>

          <h2>1. Information we collect</h2>
          <p>
            Log data: When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.
          </p>
          <p>
            Personal Information: We may ask for personal information, such as your name and email address.
          </p>

          <h2>2. Legal bases for processing</h2>
          <p>
            We will process your personal information lawfully, fairly and in a transparent manner. We collect and process information about you only where we have legal bases for doing so.
          </p>

          <h2>3. Security of your personal information</h2>
          <p>
            We will protect personal information by reasonable security safeguards against loss or theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>

          <h2>4. How long we keep your personal information</h2>
          <p>
            We keep your personal information only for as long as we need to. This time period may depend on what we are using your information for, in accordance with this privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
