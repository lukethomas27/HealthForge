import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Loader2, AlertCircle, Clock, ChevronDown, ChevronUp, CheckCircle, Heart, AlertTriangle } from 'lucide-react';
import { fetchSharedDataByToken } from '../lib/queries';

const CATEGORY_STYLES = {
  medication: { border: 'border-teal-400', icon: '\u{1F48A}' },
  environment: { border: 'border-green-400', icon: '\u{1F33F}' },
  activity: { border: 'border-blue-400', icon: '\u{1F6B6}' },
  diet: { border: 'border-orange-400', icon: '\u{1F34E}' },
  warning: { border: 'border-red-400', icon: '\u26A0' },
  followup: { border: 'border-purple-400', icon: '\u{1F4C5}' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function sortActions(actions) {
  return [...actions].sort((a, b) => {
    if (a.category === 'warning' && b.category !== 'warning') return -1;
    if (a.category !== 'warning' && b.category === 'warning') return 1;
    return 0;
  });
}

export default function InvitePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [readingLevels, setReadingLevels] = useState({});

  useEffect(() => {
    async function loadSharedData() {
      try {
        const sharedData = await fetchSharedDataByToken(token);
        setData(sharedData);
        if (sharedData.sessions.length > 0) {
          setExpandedSessionId(sharedData.sessions[0].id);
        }
      } catch (err) {
        setError(err.message || 'Invalid or expired invite link');
      } finally {
        setLoading(false);
      }
    }
    loadSharedData();
  }, [token]);

  const toggleSession = (id) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const setReadingLevel = (sessionId, level) => {
    setReadingLevels((prev) => ({ ...prev, [sessionId]: level }));
  };

  const getReadingLevel = (sessionId) => readingLevels[sessionId] || 'plain';

  const getInsightText = (insights, level) => {
    if (!insights) return '';
    if (level === 'simple') return insights.simpleSummary || insights.plainSummary || '';
    if (level === 'detail') return insights.summary || insights.plainSummary || '';
    return insights.plainSummary || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
        <div className="text-center">
          <Loader2 className="animate-spin text-teal-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-medium">Verifying secure link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F4EF] p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Expired</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { patient, sessions, accessType } = data;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#F7F4EF', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="font-bold text-lg" style={{ fontFamily: 'Georgia, serif', color: '#0B1929' }}>
              HealthForge Shared
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
            <Shield size={14} />
            Secure Access
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h1 className="text-2xl mb-2" style={{ fontFamily: 'Georgia, serif', color: '#0B1929' }}>
            Health Update: {patient.name}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {patient.name} has shared their {accessType === 'full_history' ? 'health history' : 'recent visit'} with you. 
            This information is shared securely and can be revoked at any time.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#0B1929' }}>
            {accessType === 'full_history' ? 'Visit History' : 'Shared Visit'}
          </h2>

          {sessions.map((session) => {
            const insights = session.insights;
            const isExpanded = expandedSessionId === session.id;
            const currentLevel = getReadingLevel(session.id);
            const sessionActions = insights?.actionsForPatient || [];

            return (
              <div key={session.id} className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                <button
                  onClick={() => toggleSession(session.id)}
                  className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900 mb-1">{formatDate(session.date)}</div>
                      <div className="text-sm text-gray-500">Visit with Dr. Emily Chen</div>
                      {!isExpanded && insights?.plainSummary && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 break-words italic">
                          "{insights.plainSummary}"
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </button>

                {isExpanded && insights && (
                  <div className="px-6 pb-6 border-t border-gray-50 bg-white">
                    {/* Reading Level Tabs */}
                    <div className="flex gap-4 mb-4 mt-4">
                      {['simple', 'plain', 'detail'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setReadingLevel(session.id, level)}
                          className={`text-sm pb-1 capitalize ${
                            currentLevel === level
                              ? 'border-b-2 border-teal-500 text-teal-600 font-medium'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {level === 'simple' ? 'Simpler' : level === 'plain' ? 'Plain' : 'Detailed'}
                        </button>
                      ))}
                    </div>

                    <div className="bg-teal-50/50 p-4 rounded-lg leading-relaxed text-gray-700 mb-6 border border-teal-100">
                      {getInsightText(insights, currentLevel)}
                    </div>

                    {sessionActions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                          Action Plan
                        </h4>
                        <div className="space-y-2">
                          {sortActions(sessionActions).map((action, idx) => {
                            const style = CATEGORY_STYLES[action.category] || CATEGORY_STYLES.followup;
                            return (
                              <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-white shadow-sm ${style.border}`}>
                                <span className="text-lg flex-shrink-0 w-6 text-center">{style.icon}</span>
                                <span className="text-sm text-gray-700 break-words mt-0.5">{action.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
