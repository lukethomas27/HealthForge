import { useState } from 'react';
import { X, Mail, Shield, History, FileText, Loader2 } from 'lucide-react';
import { createShareInvite } from '../lib/queries';

export default function ShareModal({ patient, sessionId, sessionDate, onClose, onShareCreated }) {
  const [email, setEmail] = useState('');
  const [accessType, setAccessType] = useState(sessionId ? 'individual_session' : 'full_history');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const share = await createShareInvite(patient.id, email, accessType, accessType === 'individual_session' ? sessionId : null);
      
      const inviteLink = `${window.location.origin}/invite/${share.token}`;
      console.log('--- SIMULATED EMAIL ---');
      console.log(`To: ${email}`);
      console.log(`Subject: ${patient.name} has shared health data with you`);
      console.log(`Link: ${inviteLink}`);
      console.log('-----------------------');

      setSuccess({
        email,
        link: inviteLink
      });
      if (onShareCreated) onShareCreated(share);
    } catch (err) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Invite Sent!</h3>
            <p className="text-gray-600 mb-6">
              We've "sent" an invite to <span className="font-semibold">{success.email}</span>.
              (Check the browser console for the link)
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-teal-600" size={24} />
            Family Sharing
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="family@example.com"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What do you want to share?
            </label>
            <div className="space-y-3">
              {sessionId && (
                <button
                  type="button"
                  onClick={() => setAccessType('individual_session')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    accessType === 'individual_session'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${accessType === 'individual_session' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">This visit only</div>
                    <div className="text-sm text-gray-500">{sessionDate}</div>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setAccessType('full_history')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  accessType === 'full_history'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${accessType === 'full_history' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <History size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Full visit history</div>
                  <div className="text-sm text-gray-500">Access to all current and future visits</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Sending Invite...
              </>
            ) : (
              'Send Secure Invite'
            )}
          </button>
          
          <p className="mt-4 text-center text-xs text-gray-400">
            You can revoke access at any time from your settings.
          </p>
        </form>
      </div>
    </div>
  );
}
