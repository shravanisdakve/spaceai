import React from 'react';
import { PageHeader } from '../components/Common/ui';

const Terms: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-xl p-8 ring-1 ring-slate-700 shadow-lg">
        <PageHeader title="Terms and Conditions" subtitle="Please read carefully" />

        <div className="prose prose-invert mt-8">
          <p>
            Welcome to NexusAI. These terms and conditions outline the rules and regulations for the use of NexusAI's Website.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use NexusAI if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2>License</h2>
          <p>
            Unless otherwise stated, NexusAI and/or its licensors own the intellectual property rights for all material on NexusAI. All intellectual property rights are reserved. You may access this from NexusAI for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Republish material from NexusAI</li>
            <li>Sell, rent or sub-license material from NexusAI</li>
            <li>Reproduce, duplicate or copy material from NexusAI</li>
            <li>Redistribute content from NexusAI</li>
          </ul>
          
          <h2>Your Privacy</h2>
          <p>Please read our Privacy Policy.</p>

          <h2>Reservation of Rights</h2>
          <p>
            We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
