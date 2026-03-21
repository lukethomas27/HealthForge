import { Stethoscope, User } from 'lucide-react';

function Spinner() {
  return (
    <div
      className="w-4 h-4 border-2 border-gray-300 rounded-full"
      style={{ borderTopColor: '#00C9A7', animation: 'spin 0.8s linear infinite' }}
    />
  );
}

export default function RoleSwitcherDock({ currentUser, onSwitchRole, loading }) {
  const isDoctor = currentUser?.role === 'doctor';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="text-center mb-1">
        <span className="text-xs text-gray-400" style={{ fontFamily: 'system-ui, sans-serif' }}>
          Viewing as
        </span>
      </div>
      <div className="bg-white shadow-lg rounded-lg px-2 py-2 flex items-center gap-2">
        {/* Doctor button */}
        <button
          onClick={() => !isDoctor && !loading && onSwitchRole('doctor')}
          disabled={loading && !isDoctor}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            isDoctor
              ? 'text-white shadow-sm'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
          style={isDoctor ? { backgroundColor: '#0B1929', color: 'white' } : { color: '#0B1929' }}
        >
          {loading && !isDoctor ? <Spinner /> : <Stethoscope className="w-4 h-4" />}
          <span>Dr. Emily Chen</span>
        </button>

        {/* Patient button */}
        <button
          onClick={() => isDoctor && !loading && onSwitchRole('patient')}
          disabled={loading && isDoctor}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
            !isDoctor
              ? 'text-white shadow-sm'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
          style={!isDoctor ? { backgroundColor: '#0B1929', color: 'white' } : { color: '#0B1929' }}
        >
          {loading && isDoctor ? <Spinner /> : <User className="w-4 h-4" />}
          <span>Sarah Kim</span>
        </button>
      </div>
    </div>
  );
}
