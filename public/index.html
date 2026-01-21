<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PetRecord - Veterinary Health Records</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a' },
            accent: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b' },
            slate: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a' }
          },
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
    .upload-zone { border: 2px dashed #cbd5e1; transition: all 0.2s; }
    .upload-zone:hover, .upload-zone.drag-over { border-color: #0d9488; background: #f0fdfa; }
    .spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .gradient-bg { background: linear-gradient(135deg, #115e59 0%, #0f766e 50%, #0d9488 100%); }
  </style>
</head>
<body class="bg-slate-50">
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, createContext, useContext, useCallback } = React;

    // SVG Icon Components
    const Icons = {
      Logo: () => (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <rect width="40" height="40" rx="8" fill="#0d9488"/>
          <path d="M12 16c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-2zM22 16c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-2zM17 24c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-2z" fill="white"/>
        </svg>
      ),
      Plus: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>,
      ArrowLeft: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      ArrowRight: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Upload: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Share: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>,
      Alert: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Pill: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 117-7l7 7a4.95 4.95 0 11-7 7zM8.5 8.5l7 7" strokeLinecap="round"/></svg>,
      Syringe: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2l4 4M15 5l6 6M7 11l-4 4 6 6 4-4M11 11l6 6M9 13l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Activity: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      FileText: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round"/></svg>,
      Heart: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
      Scale: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Calendar: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>,
      Check: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      X: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>,
      Clock: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>,
      Shield: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      Chip: ({className="w-4 h-4"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>,
      Download: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Mail: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      Copy: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
      FileText: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      TrendingUp: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
      BarChart: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
      Mic: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      MicOff: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Play: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      Square: ({className="w-5 h-5"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
      Dog: ({className="w-8 h-8"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.344-2.5" strokeLinecap="round"/><ellipse cx="12" cy="14" rx="6" ry="5"/><path d="M9 14.5v1M15 14.5v1M12 16.5v1.5" strokeLinecap="round"/></svg>,
      Cat: ({className="w-8 h-8"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4.97 0 9-3.134 9-7s-4.03-7-9-7-9 3.134-9 7 4.03 7 9 7z"/><path d="M3 8V5.5C3 4.12 4.12 3 5.5 3S8 4.12 8 5.5V8M21 8V5.5C21 4.12 19.88 3 18.5 3S16 4.12 16 5.5V8" strokeLinecap="round"/><circle cx="9" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/><path d="M12 16v1.5M10 18.5h4" strokeLinecap="round"/></svg>,
      Pet: ({className="w-8 h-8"}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8.35 3c-1.8 0-3.1 1.56-2.9 3.35.1.87.4 1.71.8 2.48M15.65 3c1.8 0 3.1 1.56 2.9 3.35-.1.87-.4 1.71-.8 2.48"/><ellipse cx="12" cy="14" rx="8" ry="7"/><path d="M9 13v2M15 13v2M10 18h4" strokeLinecap="round"/></svg>,
    };

    const SpeciesIcon = ({ species, size = "md" }) => {
      const sizeClasses = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-12 h-12" };
      const Icon = species === 'DOG' ? Icons.Dog : species === 'CAT' ? Icons.Cat : Icons.Pet;
      return <Icon className={`${sizeClasses[size]} text-primary-700`} />;
    };

    // Auth Context
    const AuthContext = createContext(null);
    function AuthProvider({ children }) {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [token, setToken] = useState(localStorage.getItem('petrecord_token'));

      useEffect(() => {
        if (token) {
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(setUser)
            .catch(() => { localStorage.removeItem('petrecord_token'); setToken(null); })
            .finally(() => setLoading(false));
        } else { setLoading(false); }
      }, [token]);

      const login = async (email, password) => {
        const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem('petrecord_token', data.token);
        setToken(data.token);
        setUser(data.user);
      };

      const register = async (email, password, firstName, lastName) => {
        const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, firstName, lastName }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem('petrecord_token', data.token);
        setToken(data.token);
        setUser(data.user);
      };

      const logout = () => { localStorage.removeItem('petrecord_token'); setToken(null); setUser(null); };

      return <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
    }
    const useAuth = () => useContext(AuthContext);

    const api = {
      get: (url) => fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('petrecord_token')}` } }).then(r => r.json()),
      post: async (url, data) => {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('petrecord_token')}` }, body: JSON.stringify(data) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Request failed');
        return json;
      },
      upload: (url, formData) => fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('petrecord_token')}` }, body: formData }).then(r => r.json()),
    };

    // View PDF with authentication
    async function viewPdf(docId, filename) {
      try {
        const res = await fetch(`/api/documents/${docId}/file`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('petrecord_token')}` }
        });
        if (!res.ok) throw new Error('Failed to load document');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (err) {
        alert('Failed to open document: ' + err.message);
      }
    }

    // Login Page
    function LoginPage({ onSwitch }) {
      const { login } = useAuth();
      const [email, setEmail] = useState('demo@petrecord.com');
      const [password, setPassword] = useState('demo123');
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try { await login(email, password); } catch (err) { setError(err.message); } finally { setLoading(false); }
      };

      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4"><Icons.Logo /></div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome to PetRecord</h1>
              <p className="text-slate-500 mt-1">Comprehensive veterinary health management</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-slate-600">Don't have an account? <button onClick={onSwitch} className="text-primary-600 font-semibold hover:text-primary-700">Create Account</button></p>
            </div>
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700 font-medium mb-1">Demo Credentials</p>
              <p className="text-sm text-slate-500 font-mono">demo@petrecord.com / demo123</p>
            </div>
          </div>
        </div>
      );
    }

    // Register Page
    function RegisterPage({ onSwitch }) {
      const { register } = useAuth();
      const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try { await register(form.email, form.password, form.firstName, form.lastName); } catch (err) { setError(err.message); } finally { setLoading(false); }
      };

      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4"><Icons.Logo /></div>
              <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
              <p className="text-slate-500 mt-1">Start managing health records</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label><input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label><input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" required /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" required /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" required minLength={6} /></div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">{loading ? 'Creating account...' : 'Create Account'}</button>
            </form>
            <div className="mt-6 text-center"><p className="text-slate-600">Already have an account? <button onClick={onSwitch} className="text-primary-600 font-semibold hover:text-primary-700">Sign In</button></p></div>
          </div>
        </div>
      );
    }

    // Header
    function Header({ onBack }) {
      const { user, logout } = useAuth();
      return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && <button onClick={onBack} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm"><Icons.ArrowLeft className="w-4 h-4" /> Back</button>}
              <div className="flex items-center gap-2.5">
                <Icons.Logo />
                <span className="font-bold text-lg text-slate-900">PetRecord</span>
              </div>
            </div>
            {user && <div className="flex items-center gap-4"><span className="text-sm text-slate-500 hidden sm:block">{user.email}</span><button onClick={logout} className="text-sm text-slate-600 hover:text-slate-900 font-medium">Sign Out</button></div>}
          </div>
        </header>
      );
    }

    // Dashboard
    function Dashboard({ onSelectPet }) {
      const { user } = useAuth();
      const [pets, setPets] = useState([]);
      const [loading, setLoading] = useState(true);
      const [showAddPet, setShowAddPet] = useState(false);
      const [showEmailSetup, setShowEmailSetup] = useState(false);
      const [aiEnabled, setAiEnabled] = useState(false);

      useEffect(() => {
        api.get('/api/pets').then(setPets).finally(() => setLoading(false));
        fetch('/api/status').then(r => r.json()).then(data => setAiEnabled(data.aiEnabled)).catch(() => {});
      }, []);

      const handleAddPet = async (petData) => { 
        try {
          const newPet = await api.post('/api/pets', petData); 
          setPets([newPet, ...pets]); 
          setShowAddPet(false); 
        } catch (err) {
          console.error('Failed to add pet:', err);
          alert('Failed to add patient: ' + err.message);
        }
      };

      if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-slate-500">Loading...</div></div>;

      return (
        <div className="min-h-screen bg-slate-50">
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName}</h1>
                <p className="text-slate-500">Manage your patients' health records</p>
              </div>
              <button onClick={() => setShowEmailSetup(true)} className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 font-medium transition-colors"><Icons.Mail className="w-4 h-4" /> Email Forwarding</button>
              <button onClick={() => setShowAddPet(true)} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 font-medium transition-colors"><Icons.Plus /> Add Patient</button>
            </div>

            {!aiEnabled && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Icons.Alert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div><p className="text-amber-800 font-medium">AI Document Extraction Disabled</p><p className="text-amber-700 text-sm">Add ANTHROPIC_API_KEY to Railway variables to enable automatic data extraction.</p></div>
              </div>
            )}

            {aiEnabled && (
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl flex items-start gap-3">
                <Icons.Check className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div><p className="text-primary-800 font-medium">AI-Powered Document Processing Active</p><p className="text-primary-700 text-sm">Upload vet records to automatically extract vaccinations, medications, lab results, and more.</p></div>
              </div>
            )}

            {pets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4"><SpeciesIcon species="OTHER" size="lg" /></div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No patients yet</h3>
                <p className="text-slate-500 mb-6">Add your first patient to start tracking their health records</p>
                <button onClick={() => setShowAddPet(true)} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">Add Your First Patient</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pets.map(pet => (
                  <div key={pet.id} onClick={() => onSelectPet(pet)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors"><SpeciesIcon species={pet.species} size="md" /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">{pet.name}</h3>
                        <p className="text-slate-600 text-sm truncate">{pet.breed}</p>
                        <p className="text-slate-400 text-sm">{pet.sex?.replace(/_/g, ' ')}{pet.weightKg ? ` · ${pet.weightKg} kg` : ''}</p>
                      </div>
                      <Icons.ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
                    </div>
                    {(pet.allergies?.length > 0 || pet.medications?.length > 0) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        {pet.allergies?.length > 0 && <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">{pet.allergies.length} Allergies</span>}
                        {pet.medications?.length > 0 && <span className="px-2.5 py-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-xs font-medium">{pet.medications.length} Active Meds</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
          {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)} onSave={handleAddPet} />}
          {showEmailSetup && <EmailSetupModal onClose={() => setShowEmailSetup(false)} />}
        </div>
      );
    }

    // Add Pet Modal
    // Email Setup Modal
    function EmailSetupModal({ onClose }) {
      const [emailData, setEmailData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [copied, setCopied] = useState(false);

      useEffect(() => {
        api.get('/api/email/forwarding-address').then(data => {
          setEmailData(data);
          setLoading(false);
        }).catch(() => setLoading(false));
      }, []);

      const copyAddress = () => {
        navigator.clipboard.writeText(emailData?.forwardingAddress || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      const regenerateAddress = async () => {
        setLoading(true);
        const data = await api.post('/api/email/regenerate-address', {});
        setEmailData(data);
        setLoading(false);
      };

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Email Forwarding</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>

            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-primary-800 text-sm">
                <strong>Auto-import vet records!</strong> Forward emails from your vet to the address below. 
                We'll automatically extract and save vaccination records, lab results, prescriptions, and more.
              </p>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Loading...</div>
            ) : emailData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Forwarding Address</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={emailData.forwardingAddress} 
                      className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
                    />
                    <button 
                      onClick={copyAddress} 
                      className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                    >
                      {copied ? <Icons.Check className="w-4 h-4" /> : <Icons.Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">How it works:</h4>
                  <ol className="text-sm text-slate-600 space-y-2">
                    <li className="flex gap-2"><span className="bg-primary-100 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">1</span> Receive an email from your vet (appointment summary, lab results, etc.)</li>
                    <li className="flex gap-2"><span className="bg-primary-100 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">2</span> Forward the email to your unique address above</li>
                    <li className="flex gap-2"><span className="bg-primary-100 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">3</span> AI automatically extracts and saves the medical data</li>
                    <li className="flex gap-2"><span className="bg-primary-100 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">4</span> View the new records in your pet's timeline</li>
                  </ol>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-1">Works best with:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Appointment summaries and discharge notes</li>
                    <li>• Vaccination certificates</li>
                    <li>• Lab result notifications</li>
                    <li>• Prescription confirmations</li>
                    <li>• PDF attachments from your vet</li>
                  </ul>
                </div>

                <button 
                  onClick={regenerateAddress}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Generate new forwarding address
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-red-500">Failed to load forwarding address</div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-200">
              <button onClick={onClose} className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">Done</button>
            </div>
          </div>
        </div>
      );
    }

    function AddPetModal({ onClose, onSave }) {
      const [form, setForm] = useState({ name: '', species: 'DOG', breed: '', sex: 'MALE', dateOfBirth: '', weightKg: '' });
      const [loading, setLoading] = useState(false);
      const handleSubmit = async (e) => { 
        e.preventDefault(); 
        setLoading(true); 
        try {
          await onSave({ ...form, weightKg: form.weightKg ? parseFloat(form.weightKg) : null }); 
        } finally {
          setLoading(false); 
        }
      };

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-slate-900">Add New Patient</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Patient Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Species *</label><select value={form.species} onChange={e => setForm({...form, species: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="DOG">Canine</option><option value="CAT">Feline</option><option value="BIRD">Avian</option><option value="OTHER">Other</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Sex *</label><select value={form.sex} onChange={e => setForm({...form, sex: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="MALE">Male (Intact)</option><option value="FEMALE">Female (Intact)</option><option value="MALE_NEUTERED">Male (Neutered)</option><option value="FEMALE_SPAYED">Female (Spayed)</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Breed</label><input type="text" value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Weight (kg)</label><input type="number" step="0.1" value={form.weightKg} onChange={e => setForm({...form, weightKg: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium">{loading ? 'Adding...' : 'Add Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    // Upload Modal
    function UploadModal({ pet, onClose, onSuccess }) {
      const [dragOver, setDragOver] = useState(false);
      const [file, setFile] = useState(null);
      const [uploading, setUploading] = useState(false);
      const [result, setResult] = useState(null);
      const [error, setError] = useState('');

      const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f && (f.type === 'application/pdf' || f.type.startsWith('image/'))) { setFile(f); setError(''); } else { setError('Please upload a PDF or image'); } }, []);
      const handleFileSelect = (e) => { if (e.target.files[0]) { setFile(e.target.files[0]); setError(''); } };
      const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('document', file);
        try { 
          const res = await fetch(`/api/pets/${pet.id}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('petrecord_token')}` },
            body: formData
          });
          const data = await res.json();
          if (!res.ok || data.error) { 
            setError(data.error || 'Upload failed'); 
          } else { 
            setResult(data); 
          } 
        } catch (err) { 
          setError('Network error: ' + err.message); 
        } finally { 
          setUploading(false); 
        }
      };
      const handleClose = () => { if (result) onSuccess(); onClose(); };

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-slate-900">Upload Medical Record</h2><button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button></div>
            {!result ? (
              <>
                <div className="mb-5 p-4 bg-primary-50 border border-primary-200 rounded-lg"><p className="text-primary-800 text-sm"><strong>AI-Powered Extraction:</strong> Upload a PDF or photo and we'll automatically extract and categorize all medical data.</p></div>
                <div className={`upload-zone rounded-xl p-8 text-center mb-5 ${dragOver ? 'drag-over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
                  {file ? (
                    <div><div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-primary-600"><Icons.FileText /></div><p className="font-medium text-slate-900">{file.name}</p><p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p><button onClick={() => setFile(null)} className="mt-3 text-red-600 text-sm font-medium hover:text-red-700">Remove</button></div>
                  ) : (
                    <div><div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-slate-400"><Icons.Upload /></div><p className="font-medium text-slate-900 mb-1">Drop your medical record here</p><p className="text-sm text-slate-500 mb-4">PDF, JPG, or PNG accepted</p><label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer font-medium">Browse Files<input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileSelect} /></label></div>
                  )}
                </div>
                {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
                <div className="flex gap-3">
                  <button onClick={handleClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                  <button onClick={handleUpload} disabled={!file || uploading} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2">
                    {uploading ? <><svg className="spinner w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>Processing...</> : 'Upload & Extract'}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-5 p-4 bg-accent-50 border border-accent-200 rounded-lg flex items-start gap-3"><Icons.Check className="w-5 h-5 text-accent-600 mt-0.5" /><p className="text-accent-800 font-medium">{result.message}</p></div>
                <h3 className="font-semibold text-slate-900 mb-4">Extracted Data</h3>
                <div className="space-y-3 mb-6">
                  {result.saved.records?.length > 0 && <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg"><p className="font-medium text-slate-900">Medical Record</p><p className="text-sm text-slate-600">{result.extracted.document_type} — {result.extracted.date_of_service}</p></div>}
                  {result.saved.vaccinations?.length > 0 && <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg"><p className="font-medium text-accent-900">Vaccinations ({result.saved.vaccinations.length})</p>{result.saved.vaccinations.map((v, i) => <p key={i} className="text-sm text-accent-700">• {v.name} — {v.date}</p>)}</div>}
                  {result.saved.medications?.length > 0 && <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg"><p className="font-medium text-primary-900">Medications ({result.saved.medications.length})</p>{result.saved.medications.map((m, i) => <p key={i} className="text-sm text-primary-700">• {m.drug_name} {m.dose}</p>)}</div>}
                  {result.saved.labs?.length > 0 && <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg"><p className="font-medium text-violet-900">Lab Results</p>{result.saved.labs.map((l, i) => <p key={i} className="text-sm text-violet-700">• {l.panel}</p>)}</div>}
                  {result.saved.allergies?.length > 0 && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="font-medium text-red-900">Allergies ({result.saved.allergies.length})</p>{result.saved.allergies.map((a, i) => <p key={i} className="text-sm text-red-700">• {a.allergen}</p>)}</div>}
                  {result.saved.conditions?.length > 0 && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg"><p className="font-medium text-amber-900">Conditions ({result.saved.conditions.length})</p>{result.saved.conditions.map((c, i) => <p key={i} className="text-sm text-amber-700">• {c.condition}</p>)}</div>}
                  {result.extracted.weight_kg && <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg"><p className="font-medium text-teal-900">Weight Updated</p><p className="text-sm text-teal-700">{result.extracted.weight_kg} kg</p></div>}
                </div>
                <button onClick={handleClose} className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Done</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Pet Profile
    function PetProfile({ pet: initialPet, onBack }) {
      const [pet, setPet] = useState(initialPet);
      const [activeTab, setActiveTab] = useState('overview');
      const [timeline, setTimeline] = useState([]);
      const [documents, setDocuments] = useState([]);
      const [recordings, setRecordings] = useState([]);
      const [showShare, setShowShare] = useState(false);
      const [showUpload, setShowUpload] = useState(false);
      const [showRecord, setShowRecord] = useState(false);
      const [selectedDoc, setSelectedDoc] = useState(null);
      const [selectedRecording, setSelectedRecording] = useState(null);
      const [showInsuranceExport, setShowInsuranceExport] = useState(false);
      const [showReferralExport, setShowReferralExport] = useState(false);
      const [labTrends, setLabTrends] = useState(null);

      const refreshPet = () => { 
        api.get(`/api/pets/${pet.id}`).then(setPet); 
        api.get(`/api/pets/${pet.id}/timeline`).then(setTimeline);
        api.get(`/api/pets/${pet.id}/documents`).then(setDocuments);
        api.get(`/api/pets/${pet.id}/recordings`).then(setRecordings);
        api.get(`/api/pets/${pet.id}/lab-trends`).then(data => {
          console.log('Lab trends loaded:', data);
          setLabTrends(data);
        }).catch(err => console.error('Lab trends error:', err));
      };
      useEffect(() => { refreshPet(); }, [pet.id]);

      const age = pet.dateOfBirth ? Math.floor((new Date() - new Date(pet.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null;

      return (
        <div className="min-h-screen bg-slate-50">
          <Header onBack={onBack} />
          <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-primary-50 rounded-xl"><SpeciesIcon species={pet.species} size="lg" /></div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{pet.name}</h1>
                    <p className="text-slate-600">{pet.breed}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                      <span>{pet.sex?.replace(/_/g, ' ')}</span>
                      {age !== null && <span>{age} years old</span>}
                      {pet.weightKg && <span>{pet.weightKg} kg</span>}
                      {pet.microchipId && <span className="flex items-center gap-1"><Icons.Chip /> {pet.microchipId}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setShowRecord(true)} className="flex-1 lg:flex-none px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium"><Icons.Mic className="w-4 h-4" /> Record</button>
                  <button onClick={() => setShowUpload(true)} className="flex-1 lg:flex-none px-4 py-2.5 bg-accent-600 text-white rounded-lg hover:bg-accent-700 flex items-center justify-center gap-2 font-medium"><Icons.Upload className="w-4 h-4" /> Upload</button>
                  <button onClick={() => setShowInsuranceExport(true)} className="flex-1 lg:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"><Icons.FileText className="w-4 h-4" /> Insurance</button>
                  <button onClick={() => setShowReferralExport(true)} className="flex-1 lg:flex-none px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2 font-medium"><Icons.FileText className="w-4 h-4" /> Referral</button>
                  <button onClick={() => setShowShare(true)} className="flex-1 lg:flex-none px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 font-medium"><Icons.Share className="w-4 h-4" /> Share</button>
                </div>
              </div>
            </div>

            {/* Allergies */}
            {pet.allergies?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-2"><Icons.Alert className="w-5 h-5" /> Known Allergies</div>
                <div className="flex flex-wrap gap-2">{pet.allergies.map((a, i) => <span key={i} className="px-3 py-1.5 bg-red-100 text-red-800 border border-red-200 rounded-full text-sm font-medium">{a.allergen} ({a.severity})</span>)}</div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
              {['overview', 'timeline', 'lab trends', 'documents', 'recordings', 'medications', 'vaccinations'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-slate-500 border-transparent hover:text-slate-900'}`}>
                  {tab === 'lab trends' && <Icons.TrendingUp className="w-4 h-4 inline mr-1" />}{tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Icons.Heart className="w-5 h-5 text-primary-600" /> Chronic Conditions</h3>
                  {!pet.conditions?.length ? <p className="text-slate-400 text-sm">No chronic conditions recorded</p> : (
                    <div className="space-y-3">{pet.conditions.map((c, i) => <div key={i} className="flex items-center justify-between"><span className="font-medium text-slate-900">{c.condition}</span><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-accent-100 text-accent-700'}`}>{c.status}</span></div>)}</div>
                  )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Icons.Pill className="w-5 h-5 text-primary-600" /> Active Medications</h3>
                  {!pet.medications?.filter(m => m.status === 'ACTIVE').length ? <p className="text-slate-400 text-sm">No active medications</p> : (
                    <div className="space-y-3">{pet.medications.filter(m => m.status === 'ACTIVE').map((m, i) => <div key={i} className="flex items-center justify-between text-sm"><div><span className="font-medium text-slate-900">{m.drug_name}</span>{m.dose && <span className="text-slate-500 ml-1">{m.dose}</span>}</div><span className="text-slate-500">{m.frequency}</span></div>)}</div>
                  )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Icons.Syringe className="w-5 h-5 text-primary-600" /> Recent Vaccinations</h3>
                  {!pet.vaccinations?.length ? <p className="text-slate-400 text-sm">No vaccinations recorded</p> : (
                    <div className="space-y-3">{pet.vaccinations.slice(0, 5).map((v, i) => { const expired = v.valid_until && new Date(v.valid_until) < new Date(); return <div key={i} className="flex items-center justify-between text-sm"><span className="font-medium text-slate-900">{v.vaccine_name}</span><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${expired ? 'bg-red-100 text-red-700' : 'bg-accent-100 text-accent-700'}`}>{expired ? 'Expired' : 'Current'}</span></div>; })}</div>
                  )}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Icons.Scale className="w-5 h-5 text-primary-600" /> Weight History</h3>
                  {!pet.weightHistory?.length ? <p className="text-slate-400 text-sm">No weight records</p> : (
                    <div className="space-y-3">{pet.weightHistory.slice(0, 5).map((w, i) => <div key={i} className="flex items-center justify-between text-sm"><span className="text-slate-500">{w.date}</span><span className="font-medium text-slate-900">{w.weight_kg} kg</span></div>)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {timeline.length === 0 ? (
                  <div className="text-center py-12"><div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-slate-400"><Icons.Calendar /></div><p className="text-slate-500 mb-4">No records yet</p><button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Upload First Record</button></div>
                ) : (
                  <div className="space-y-6">{timeline.map((event, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < timeline.length - 1 && <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-200" />}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${event.type === 'record' ? 'bg-slate-100 text-slate-600' : event.type === 'vaccination' ? 'bg-accent-100 text-accent-600' : 'bg-violet-100 text-violet-600'}`}>
                        {event.type === 'record' ? <Icons.FileText /> : event.type === 'vaccination' ? <Icons.Syringe /> : <Icons.Activity />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-3 mb-1"><span className="font-semibold text-slate-900">{event.subtype}</span><span className="text-sm text-slate-500">{event.date}</span></div>
                        {event.data.summary && <p className="text-slate-600 text-sm">{event.data.summary}</p>}
                        {event.data.facility_name && <p className="text-slate-400 text-xs mt-1">{event.data.facility_name}</p>}
                        {event.data.diagnosis && <p className="text-amber-700 text-sm mt-1"><strong>Diagnosis:</strong> {event.data.diagnosis}</p>}
                        {event.data.treatment && <p className="text-accent-700 text-sm"><strong>Treatment:</strong> {event.data.treatment}</p>}
                      </div>
                    </div>
                  ))}</div>
                )}
                {documents.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-3">📎 {documents.length} uploaded document{documents.length > 1 ? 's' : ''} - <button onClick={() => setActiveTab('documents')} className="text-primary-600 font-medium hover:underline">View in Documents tab</button></p>
                  </div>
                )}
              </div>
            )}

            {/* Lab Trends */}
            {activeTab === 'lab trends' && (
              <div className="space-y-6">
                {!labTrends || labTrends.trends?.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.TrendingUp className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Lab Results Yet</h3>
                    <p className="text-slate-500 mb-6">Upload lab reports to see trends over time</p>
                    <button onClick={() => setShowUpload(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Upload Lab Report</button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <Icons.TrendingUp className="w-5 h-5 text-violet-600" /> Lab Value Trends
                        </h3>
                        <span className="text-sm text-slate-500">{labTrends.totalTests} tests tracked • {labTrends.totalDataPoints} data points</span>
                      </div>
                      <p className="text-sm text-slate-600">Tracking lab values over time helps identify trends in chronic conditions like kidney disease, diabetes, and thyroid disorders.</p>
                    </div>
                    
                    {/* Group by category */}
                    {['Kidney', 'Liver', 'Metabolic', 'CBC', 'Thyroid', 'Electrolytes', 'Pancreas', 'Other'].map(category => {
                      const categoryTrends = labTrends.trends?.filter(t => t.category === category) || [];
                      if (categoryTrends.length === 0) return null;
                      return (
                        <div key={category} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h4 className="font-semibold text-slate-900">{category} Panel</h4>
                          </div>
                          <div className="p-4 grid gap-6 md:grid-cols-2">
                            {categoryTrends.map(trend => (
                              <LabTrendChart key={trend.name} trend={trend} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Medications */}
            {activeTab === 'medications' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-5 border-b border-slate-200"><h3 className="font-semibold text-slate-900">Medications</h3></div>
                {!pet.medications?.length ? <div className="p-12 text-center text-slate-500">No medications recorded</div> : (
                  <div className="divide-y divide-slate-100">{pet.medications.map((m, i) => (
                    <div key={i} className="p-5 flex items-center justify-between">
                      <div><div className="font-medium text-slate-900">{m.drug_name}</div><div className="text-sm text-slate-600">{m.dose} · {m.frequency}</div>{m.indication && <div className="text-xs text-slate-500 mt-1">Indication: {m.indication}</div>}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${m.status === 'ACTIVE' ? 'bg-accent-100 text-accent-700' : 'bg-slate-100 text-slate-600'}`}>{m.status}</span>
                    </div>
                  ))}</div>
                )}
              </div>
            )}

            {/* Vaccinations */}
            {activeTab === 'vaccinations' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-5 border-b border-slate-200"><h3 className="font-semibold text-slate-900">Vaccination Records</h3></div>
                {!pet.vaccinations?.length ? <div className="p-12 text-center text-slate-500">No vaccinations recorded</div> : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-left text-sm text-slate-600"><tr><th className="p-4 font-medium">Vaccine</th><th className="p-4 font-medium">Date Administered</th><th className="p-4 font-medium">Valid Until</th><th className="p-4 font-medium">Status</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">{pet.vaccinations.map((v, i) => { const expired = v.valid_until && new Date(v.valid_until) < new Date(); return <tr key={i}><td className="p-4 font-medium text-slate-900">{v.vaccine_name}</td><td className="p-4 text-slate-600">{v.administration_date}</td><td className="p-4 text-slate-600">{v.valid_until || '—'}</td><td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${expired ? 'bg-red-100 text-red-700' : 'bg-accent-100 text-accent-700'}`}>{expired ? 'Expired' : 'Current'}</span></td></tr>; })}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Uploaded Documents</h3>
                  <button onClick={() => setShowUpload(true)} className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 font-medium flex items-center gap-1"><Icons.Upload className="w-4 h-4" /> Upload</button>
                </div>
                {!documents?.length ? <div className="p-12 text-center text-slate-500">No documents uploaded yet</div> : (
                  <div className="divide-y divide-slate-100">
                    {documents.map((doc, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                            <Icons.FileText />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{doc.filename}</p>
                            <p className="text-sm text-slate-500">{doc.uploadDate} · {doc.extracted?.document_type?.replace(/_/g, ' ') || 'Document'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedDoc(doc)} className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg font-medium">View Details</button>
                          <button onClick={() => viewPdf(doc.id, doc.filename)} className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-1"><Icons.Download className="w-4 h-4" /> Open PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recordings */}
            {activeTab === 'recordings' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Exam Recordings</h3>
                  <button onClick={() => setShowRecord(true)} className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium flex items-center gap-1"><Icons.Mic className="w-4 h-4" /> Record</button>
                </div>
                {!recordings?.length ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400"><Icons.Mic className="w-8 h-8" /></div>
                    <p className="text-slate-500 mb-2">No exam recordings yet</p>
                    <p className="text-slate-400 text-sm mb-4">Record conversations with your vet for AI transcription and summary</p>
                    <button onClick={() => setShowRecord(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Start First Recording</button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recordings.map((rec, i) => (
                      <div key={i} className="p-4 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedRecording(rec)}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                              <Icons.Mic />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{rec.title}</p>
                              <p className="text-sm text-slate-500">{rec.recordedAt} · {Math.floor(rec.duration / 60)}:{(rec.duration % 60).toString().padStart(2, '0')}</p>
                            </div>
                          </div>
                          <span className="text-primary-600 text-sm font-medium">View details →</span>
                        </div>
                        {rec.summary && <p className="text-sm text-slate-600 ml-13 pl-13">{rec.summary}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
          {showShare && <ShareModal pet={pet} onClose={() => setShowShare(false)} />}
          {showUpload && <UploadModal pet={pet} onClose={() => setShowUpload(false)} onSuccess={refreshPet} />}
          {showRecord && <RecordModal pet={pet} onClose={() => setShowRecord(false)} onSuccess={refreshPet} />}
          {selectedDoc && <DocumentDetailModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
          {selectedRecording && <RecordingDetailModal recording={selectedRecording} onClose={() => setSelectedRecording(null)} />}
          {showInsuranceExport && <InsuranceExportModal pet={pet} onClose={() => setShowInsuranceExport(false)} />}
          {showReferralExport && <ReferralExportModal pet={pet} onClose={() => setShowReferralExport(false)} />}
        </div>
      );
    }

    // Lab Trend Chart Component
    function LabTrendChart({ trend }) {
      const { name, unit, referenceRange, dataPoints, category } = trend;
      
      if (!dataPoints || dataPoints.length === 0) return null;
      
      // Calculate chart dimensions
      const width = 280;
      const height = 140;
      const padding = { top: 20, right: 15, bottom: 30, left: 45 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      
      // Get min/max values
      const values = dataPoints.map(d => d.value);
      let minVal = Math.min(...values);
      let maxVal = Math.max(...values);
      
      // Include reference range in scale if available
      if (referenceRange) {
        minVal = Math.min(minVal, referenceRange.min * 0.9);
        maxVal = Math.max(maxVal, referenceRange.max * 1.1);
      }
      
      // Add padding to range
      const range = maxVal - minVal || 1;
      minVal = minVal - range * 0.1;
      maxVal = maxVal + range * 0.1;
      
      // Scale functions
      const xScale = (i) => padding.left + (i / (dataPoints.length - 1 || 1)) * chartWidth;
      const yScale = (v) => padding.top + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;
      
      // Build path
      const pathD = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
      
      // Get latest value status
      const latestPoint = dataPoints[dataPoints.length - 1];
      const hasAbnormal = dataPoints.some(d => d.flag);
      const latestAbnormal = latestPoint.flag;
      
      // Color based on status
      const lineColor = latestAbnormal === 'high' ? '#dc2626' : latestAbnormal === 'low' ? '#2563eb' : '#10b981';
      const bgColor = latestAbnormal === 'high' ? 'bg-red-50' : latestAbnormal === 'low' ? 'bg-blue-50' : 'bg-green-50';
      const borderColor = latestAbnormal === 'high' ? 'border-red-200' : latestAbnormal === 'low' ? 'border-blue-200' : 'border-green-200';
      
      return (
        <div className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h5 className="font-medium text-slate-900">{name}</h5>
              <p className="text-xs text-slate-500">{unit}{referenceRange ? ` • Ref: ${referenceRange.min}-${referenceRange.max}` : ''}</p>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${latestAbnormal === 'high' ? 'text-red-600' : latestAbnormal === 'low' ? 'text-blue-600' : 'text-green-600'}`}>
                {latestPoint.value.toFixed(1)}
              </span>
              {latestAbnormal && (
                <span className={`ml-1 text-xs font-medium ${latestAbnormal === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                  {latestAbnormal === 'high' ? '↑ HIGH' : '↓ LOW'}
                </span>
              )}
            </div>
          </div>
          
          <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Reference range band */}
            {referenceRange && (
              <rect
                x={padding.left}
                y={yScale(referenceRange.max)}
                width={chartWidth}
                height={yScale(referenceRange.min) - yScale(referenceRange.max)}
                fill="#10b981"
                opacity="0.1"
              />
            )}
            
            {/* Reference range lines */}
            {referenceRange && (
              <>
                <line x1={padding.left} y1={yScale(referenceRange.max)} x2={width - padding.right} y2={yScale(referenceRange.max)} stroke="#10b981" strokeDasharray="4 2" strokeWidth="1" opacity="0.5" />
                <line x1={padding.left} y1={yScale(referenceRange.min)} x2={width - padding.right} y2={yScale(referenceRange.min)} stroke="#10b981" strokeDasharray="4 2" strokeWidth="1" opacity="0.5" />
              </>
            )}
            
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(pct => (
              <line key={pct} x1={padding.left} y1={padding.top + chartHeight * pct} x2={width - padding.right} y2={padding.top + chartHeight * pct} stroke="#e2e8f0" strokeWidth="1" />
            ))}
            
            {/* Line */}
            <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Data points */}
            {dataPoints.map((d, i) => (
              <g key={i}>
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.value)}
                  r={dataPoints.length <= 6 ? 5 : 3}
                  fill={d.flag === 'high' ? '#dc2626' : d.flag === 'low' ? '#2563eb' : '#10b981'}
                  stroke="white"
                  strokeWidth="2"
                />
              </g>
            ))}
            
            {/* Y axis labels */}
            <text x={padding.left - 5} y={padding.top + 4} textAnchor="end" className="text-[10px] fill-slate-500">{maxVal.toFixed(1)}</text>
            <text x={padding.left - 5} y={padding.top + chartHeight} textAnchor="end" className="text-[10px] fill-slate-500">{minVal.toFixed(1)}</text>
            
            {/* X axis labels (dates) */}
            {dataPoints.length <= 6 ? (
              dataPoints.map((d, i) => (
                <text key={i} x={xScale(i)} y={height - 5} textAnchor="middle" className="text-[9px] fill-slate-500">
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              ))
            ) : (
              <>
                <text x={padding.left} y={height - 5} textAnchor="start" className="text-[9px] fill-slate-500">
                  {new Date(dataPoints[0].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </text>
                <text x={width - padding.right} y={height - 5} textAnchor="end" className="text-[9px] fill-slate-500">
                  {new Date(dataPoints[dataPoints.length - 1].date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </text>
              </>
            )}
          </svg>
          
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{dataPoints.length} result{dataPoints.length > 1 ? 's' : ''}</span>
            {hasAbnormal && <span className="text-amber-600">⚠ Abnormal values detected</span>}
          </div>
        </div>
      );
    }

    // Insurance Export Modal
    function InsuranceExportModal({ pet, onClose }) {
      const [loading, setLoading] = useState(false);
      const [form, setForm] = useState({
        startDate: '',
        endDate: '',
        claimReason: '',
        insuranceCompany: '',
        policyNumber: ''
      });

      const insuranceCompanies = [
        'Trupanion', 'Nationwide', 'Healthy Paws', 'Embrace', 'Petplan',
        'ASPCA', 'Lemonade', 'Pets Best', 'Figo', 'Spot', 'Other'
      ];

      const downloadPdf = async () => {
        setLoading(true);
        try {
          console.log('Downloading insurance PDF for pet:', pet.id);
          const token = localStorage.getItem('petrecord_token');
          if (!token) throw new Error('Not logged in');
          
          const response = await fetch(`/api/pets/${pet.id}/export/insurance-claim/pdf`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('PDF error response:', errorText);
            throw new Error(errorText || 'Failed to generate PDF');
          }
          
          const blob = await response.blob();
          console.log('Received blob:', blob.size, 'bytes');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${pet.name}-insurance-claim-${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          onClose();
        } catch (err) {
          console.error('PDF download error:', err);
          alert('Error: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Insurance Claim Export</h2>
                <p className="text-sm text-slate-500">Generate a PDF for insurance claims</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Generating for: {pet.name}</strong><br />
                  This will create a formatted PDF with medical history, diagnoses, treatments, and medications for your insurance claim.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Company</label>
                <select 
                  value={form.insuranceCompany} 
                  onChange={e => setForm({...form, insuranceCompany: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select company...</option>
                  {insuranceCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Policy Number</label>
                <input 
                  type="text" 
                  value={form.policyNumber}
                  onChange={e => setForm({...form, policyNumber: e.target.value})}
                  placeholder="e.g., PET-123456"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Claim Start Date</label>
                  <input 
                    type="date" 
                    value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Claim End Date</label>
                  <input 
                    type="date" 
                    value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Claim</label>
                <textarea 
                  value={form.claimReason}
                  onChange={e => setForm({...form, claimReason: e.target.value})}
                  placeholder="e.g., Emergency surgery for foreign body removal"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Tip:</strong> Leave date fields empty to include all records. Most insurance claims require records from the specific treatment period.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
              <button 
                onClick={downloadPdf} 
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {loading ? 'Generating...' : <><Icons.Download className="w-4 h-4" /> Download PDF</>}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Referral Export Modal
    function ReferralExportModal({ pet, onClose }) {
      const [loading, setLoading] = useState(false);
      const [form, setForm] = useState({
        referralReason: '',
        referringVet: '',
        referringClinic: '',
        specialtyType: '',
        urgency: 'routine',
        additionalNotes: ''
      });

      const specialties = [
        'Internal Medicine', 'Surgery', 'Oncology', 'Cardiology', 'Dermatology',
        'Neurology', 'Ophthalmology', 'Orthopedics', 'Emergency/Critical Care',
        'Radiology/Imaging', 'Dentistry', 'Behavior', 'Nutrition', 'Other'
      ];

      const downloadPdf = async () => {
        setLoading(true);
        try {
          console.log('Downloading referral PDF for pet:', pet.id);
          const token = localStorage.getItem('petrecord_token');
          if (!token) throw new Error('Not logged in');
          
          const response = await fetch(`/api/pets/${pet.id}/export/referral-summary/pdf`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('PDF error response:', errorText);
            throw new Error(errorText || 'Failed to generate PDF');
          }
          
          const blob = await response.blob();
          console.log('Received blob:', blob.size, 'bytes');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${pet.name}-referral-summary-${new Date().toISOString().split('T')[0]}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          onClose();
        } catch (err) {
          console.error('PDF download error:', err);
          alert('Error: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Referral Summary Export</h2>
                <p className="text-sm text-slate-500">Generate a professional referral packet</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                <p className="text-violet-800 text-sm">
                  <strong>Patient: {pet.name}</strong><br />
                  Creates a comprehensive referral summary including signalment, medical history, current medications, allergies, and recent diagnostics.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialty Type *</label>
                <select 
                  value={form.specialtyType} 
                  onChange={e => setForm({...form, specialtyType: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select specialty...</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Referral *</label>
                <textarea 
                  value={form.referralReason}
                  onChange={e => setForm({...form, referralReason: e.target.value})}
                  placeholder="e.g., Persistent lameness in right forelimb, suspect cruciate ligament injury. Requesting orthopedic evaluation."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                <div className="flex gap-3">
                  {['routine', 'urgent', 'emergency'].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setForm({...form, urgency: u})}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium capitalize transition-colors ${
                        form.urgency === u 
                          ? u === 'emergency' ? 'border-red-500 bg-red-50 text-red-700'
                            : u === 'urgent' ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-green-500 bg-green-50 text-green-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Referring Veterinarian</label>
                  <input 
                    type="text" 
                    value={form.referringVet}
                    onChange={e => setForm({...form, referringVet: e.target.value})}
                    placeholder="Dr. Jane Smith"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Referring Clinic</label>
                  <input 
                    type="text" 
                    value={form.referringClinic}
                    onChange={e => setForm({...form, referringClinic: e.target.value})}
                    placeholder="Happy Paws Veterinary"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes for Specialist</label>
                <textarea 
                  value={form.additionalNotes}
                  onChange={e => setForm({...form, additionalNotes: e.target.value})}
                  placeholder="Any specific concerns or questions for the specialist..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
              <button 
                onClick={downloadPdf} 
                disabled={loading || !form.specialtyType || !form.referralReason}
                className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {loading ? 'Generating...' : <><Icons.Download className="w-4 h-4" /> Download PDF</>}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Document Detail Modal
    function DocumentDetailModal({ doc, onClose }) {
      const ext = doc.extracted || {};
      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{ext.document_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Document'}</h2>
                <p className="text-sm text-slate-500">{ext.date_of_service} · {ext.facility_name}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {ext.provider_name && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Provider</p>
                  <p className="font-medium text-slate-900">{ext.provider_name}</p>
                </div>
              )}
              
              {ext.visit_summary && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Visit Summary</p>
                  <p className="text-slate-900">{ext.visit_summary}</p>
                </div>
              )}
              
              {ext.chief_complaint && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Chief Complaint</p>
                  <p className="text-slate-900">{ext.chief_complaint}</p>
                </div>
              )}
              
              {ext.diagnosis && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">Diagnosis</p>
                  <p className="font-medium text-amber-900">{ext.diagnosis}</p>
                </div>
              )}
              
              {ext.treatment && (
                <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg">
                  <p className="text-sm text-accent-700">Treatment</p>
                  <p className="text-accent-900">{ext.treatment}</p>
                </div>
              )}
              
              {ext.vaccinations?.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">Vaccinations</p>
                  {ext.vaccinations.map((v, i) => (
                    <p key={i} className="text-green-900">• {v.name} {v.date && `(${v.date})`} {v.valid_until && `- Valid until ${v.valid_until}`}</p>
                  ))}
                </div>
              )}
              
              {ext.medications_prescribed?.length > 0 && (
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-primary-700 mb-2">Medications Prescribed</p>
                  {ext.medications_prescribed.map((m, i) => (
                    <p key={i} className="text-primary-900">• {m.drug_name} {m.dose} - {m.frequency} {m.indication && `(${m.indication})`}</p>
                  ))}
                </div>
              )}
              
              {ext.lab_results?.results?.length > 0 && (
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
                  <p className="text-sm text-violet-700 mb-2">{ext.lab_results.panel_name || 'Lab Results'}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-violet-700"><th className="pr-4 py-1">Test</th><th className="pr-4 py-1">Value</th><th className="pr-4 py-1">Range</th><th className="py-1">Flag</th></tr></thead>
                      <tbody className="text-violet-900">
                        {ext.lab_results.results.map((r, i) => (
                          <tr key={i} className={r.flag ? 'font-medium' : ''}>
                            <td className="pr-4 py-1">{r.test}</td>
                            <td className="pr-4 py-1">{r.value} {r.unit}</td>
                            <td className="pr-4 py-1">{r.range}</td>
                            <td className="py-1">{r.flag && <span className={`px-1.5 py-0.5 rounded text-xs ${r.flag === 'H' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{r.flag}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {ext.lab_results.interpretation && <p className="mt-2 text-sm text-violet-800 italic">{ext.lab_results.interpretation}</p>}
                </div>
              )}
              
              {ext.allergies_noted?.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Allergies Noted</p>
                  {ext.allergies_noted.map((a, i) => (
                    <p key={i} className="text-red-900">• {a.allergen} {a.severity && `(${a.severity})`} {a.reaction && `- ${a.reaction}`}</p>
                  ))}
                </div>
              )}
              
              {ext.conditions_noted?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 mb-2">Conditions Noted</p>
                  {ext.conditions_noted.map((c, i) => (
                    <p key={i} className="text-amber-900">• {c.condition} {c.status && `(${c.status})`}</p>
                  ))}
                </div>
              )}
              
              {ext.weight_kg && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Weight</p>
                  <p className="font-medium text-slate-900">{ext.weight_kg} kg</p>
                </div>
              )}
              
              {ext.follow_up && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">Follow-up Instructions</p>
                  <p className="text-blue-900">{ext.follow_up}</p>
                </div>
              )}
              
              {ext.notes && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="text-slate-900">{ext.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Close</button>
              <button onClick={() => viewPdf(doc.id, doc.filename)} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2">
                <Icons.Download className="w-4 h-4" /> View Original PDF
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Record Modal - Audio recording with transcription
    function RecordModal({ pet, onClose, onSuccess }) {
      const [recording, setRecording] = useState(false);
      const [mediaRecorder, setMediaRecorder] = useState(null);
      const [audioChunks, setAudioChunks] = useState([]);
      const [duration, setDuration] = useState(0);
      const [processing, setProcessing] = useState(false);
      const [result, setResult] = useState(null);
      const [error, setError] = useState('');
      const [title, setTitle] = useState(`Exam - ${new Date().toLocaleDateString()}`);
      const timerRef = React.useRef(null);

      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          const chunks = [];
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          
          recorder.onstop = () => {
            setAudioChunks(chunks);
            stream.getTracks().forEach(track => track.stop());
          };
          
          recorder.start(1000);
          setMediaRecorder(recorder);
          setRecording(true);
          setDuration(0);
          
          timerRef.current = setInterval(() => {
            setDuration(d => d + 1);
          }, 1000);
        } catch (err) {
          setError('Could not access microphone. Please allow microphone access.');
        }
      };

      const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
          setRecording(false);
          clearInterval(timerRef.current);
        }
      };

      const processRecording = async () => {
        if (audioChunks.length === 0) return;
        
        setProcessing(true);
        setError('');
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('duration', duration.toString());
        formData.append('title', title);
        
        try {
          const res = await fetch(`/api/pets/${pet.id}/recordings`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('petrecord_token')}` },
            body: formData
          });
          const data = await res.json();
          
          if (!res.ok || data.error) {
            setError(data.error || 'Failed to process recording');
          } else {
            setResult(data);
          }
        } catch (err) {
          setError('Network error: ' + err.message);
        } finally {
          setProcessing(false);
        }
      };

      const handleClose = () => {
        if (recording) stopRecording();
        clearInterval(timerRef.current);
        if (result) onSuccess();
        onClose();
      };

      const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Record Exam Conversation</h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>

            {!result ? (
              <>
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm"><strong>Voice Recording:</strong> Record your conversation with the vet. Audio will be transcribed and summarized by AI to extract key medical information.</p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Recording Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g., Annual Checkup" />
                </div>

                <div className="bg-slate-50 rounded-xl p-8 text-center mb-5">
                  {!recording && audioChunks.length === 0 && (
                    <>
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Mic className="w-10 h-10 text-red-600" />
                      </div>
                      <p className="text-slate-600 mb-4">Tap to start recording</p>
                      <button onClick={startRecording} className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 font-medium flex items-center gap-2 mx-auto">
                        <Icons.Mic className="w-5 h-5" /> Start Recording
                      </button>
                    </>
                  )}
                  
                  {recording && (
                    <>
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Icons.Mic className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-3xl font-mono text-slate-900 mb-2">{formatTime(duration)}</p>
                      <p className="text-red-600 font-medium mb-4">Recording...</p>
                      <button onClick={stopRecording} className="px-6 py-3 bg-slate-800 text-white rounded-full hover:bg-slate-900 font-medium flex items-center gap-2 mx-auto">
                        <Icons.Square className="w-5 h-5" /> Stop Recording
                      </button>
                    </>
                  )}
                  
                  {!recording && audioChunks.length > 0 && !processing && (
                    <>
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Check className="w-10 h-10 text-green-600" />
                      </div>
                      <p className="text-slate-900 font-medium mb-1">Recording Complete</p>
                      <p className="text-slate-500 mb-4">{formatTime(duration)} recorded</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => { setAudioChunks([]); setDuration(0); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium">Discard</button>
                        <button onClick={processRecording} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Process & Transcribe</button>
                      </div>
                    </>
                  )}
                  
                  {processing && (
                    <>
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="spinner w-10 h-10 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      </div>
                      <p className="text-slate-900 font-medium mb-1">Processing...</p>
                      <p className="text-slate-500 text-sm">Transcribing audio and extracting medical data</p>
                    </>
                  )}
                </div>

                {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

                <div className="flex gap-3">
                  <button onClick={handleClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-5 p-4 bg-accent-50 border border-accent-200 rounded-lg flex items-start gap-3">
                  <Icons.Check className="w-5 h-5 text-accent-600 mt-0.5" />
                  <div>
                    <p className="text-accent-800 font-medium">{result.message}</p>
                  </div>
                </div>

                <div className="mb-5 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Summary</p>
                  <p className="text-slate-900">{result.summary}</p>
                </div>

                {result.extracted?.diagnosis && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">Diagnosis</p>
                    <p className="text-amber-900">{result.extracted.diagnosis}</p>
                  </div>
                )}

                {result.extracted?.treatment_plan && (
                  <div className="mb-3 p-3 bg-accent-50 border border-accent-200 rounded-lg">
                    <p className="text-sm text-accent-700">Treatment Plan</p>
                    <p className="text-accent-900">{result.extracted.treatment_plan}</p>
                  </div>
                )}

                {result.extracted?.medications_mentioned?.length > 0 && (
                  <div className="mb-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-sm text-primary-700 mb-1">Medications Mentioned</p>
                    {result.extracted.medications_mentioned.map((m, i) => (
                      <p key={i} className="text-primary-900 text-sm">• {m.drug_name} {m.dose && `${m.dose}`} {m.frequency && `- ${m.frequency}`}</p>
                    ))}
                  </div>
                )}

                <button onClick={handleClose} className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Done</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Recording Detail Modal
    function RecordingDetailModal({ recording, onClose }) {
      const ext = recording.extracted || {};
      
      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{recording.title}</h2>
                <p className="text-sm text-slate-500">{recording.recordedAt} · {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {recording.summary && (
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-primary-700 font-medium mb-1">AI Summary</p>
                  <p className="text-primary-900">{recording.summary}</p>
                </div>
              )}

              {ext.chief_complaint && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Chief Complaint</p>
                  <p className="text-slate-900">{ext.chief_complaint}</p>
                </div>
              )}

              {ext.findings && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Examination Findings</p>
                  <p className="text-slate-900">{ext.findings}</p>
                </div>
              )}

              {ext.diagnosis && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">Diagnosis</p>
                  <p className="font-medium text-amber-900">{ext.diagnosis}</p>
                </div>
              )}

              {ext.treatment_plan && (
                <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg">
                  <p className="text-sm text-accent-700">Treatment Plan</p>
                  <p className="text-accent-900">{ext.treatment_plan}</p>
                </div>
              )}

              {ext.medications_mentioned?.length > 0 && (
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-primary-700 mb-2">Medications Mentioned</p>
                  {ext.medications_mentioned.map((m, i) => (
                    <p key={i} className="text-primary-900">• {m.drug_name} {m.dose && m.dose} {m.frequency && `- ${m.frequency}`} {m.indication && `(${m.indication})`}</p>
                  ))}
                </div>
              )}

              {ext.vaccinations_mentioned?.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">Vaccinations Mentioned</p>
                  {ext.vaccinations_mentioned.map((v, i) => (
                    <p key={i} className="text-green-900">• {v.name} - {v.status}</p>
                  ))}
                </div>
              )}

              {ext.concerns_noted?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 mb-2">Health Concerns</p>
                  {ext.concerns_noted.map((c, i) => (
                    <p key={i} className="text-amber-900">• {c}</p>
                  ))}
                </div>
              )}

              {ext.follow_up && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">Follow-up</p>
                  <p className="text-blue-900">{ext.follow_up}</p>
                </div>
              )}

              {ext.questions_asked?.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Questions Asked</p>
                  {ext.questions_asked.map((q, i) => (
                    <p key={i} className="text-slate-700">• {q}</p>
                  ))}
                </div>
              )}

              <div className="p-4 bg-slate-100 rounded-lg">
                <p className="text-sm text-slate-500 font-medium mb-2">Full Transcript</p>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{recording.transcript}</p>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-200">
              <button onClick={onClose} className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Close</button>
            </div>
          </div>
        </div>
      );
    }

    // Share Modal
    function ShareModal({ pet, onClose }) {
      const [shareData, setShareData] = useState(null);
      const [loading, setLoading] = useState(false);
      const [copied, setCopied] = useState(false);
      const [duration, setDuration] = useState('24h');
      const [activeShares, setActiveShares] = useState([]);
      const [showManage, setShowManage] = useState(false);
      
      useEffect(() => {
        api.get('/api/share/my-shares').then(shares => {
          setActiveShares(shares.filter(s => s.petId === pet.id && !s.isExpired));
        }).catch(() => {});
      }, [pet.id]);

      const createShare = async () => { 
        setLoading(true); 
        const data = await api.post('/api/share/quick-share', { petId: pet.id, duration, permissionLevel: 'FULL_ACCESS' }); 
        setShareData(data); 
        setActiveShares([...activeShares, { id: data.token.id, shareUrl: data.shareUrl, validUntil: data.token.validUntil }]);
        setLoading(false); 
      };
      
      const copyLink = () => { navigator.clipboard.writeText(shareData.shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
      
      const revokeShare = async (tokenId) => {
        await api.post(`/api/share/${tokenId}/revoke`);
        setActiveShares(activeShares.filter(s => s.id !== tokenId));
      };
      
      const formatExpiry = (date) => {
        if (!date) return 'No expiration';
        const d = new Date(date);
        const now = new Date();
        const diff = d - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Less than 1 hour';
        if (hours < 24) return `${hours} hours`;
        return `${Math.floor(hours / 24)} days`;
      };

      const durations = [
        { value: '1h', label: '1 Hour', desc: 'Quick ER visit' },
        { value: '24h', label: '24 Hours', desc: 'Same-day appointment' },
        { value: '72h', label: '3 Days', desc: 'Specialist consult' },
        { value: '7d', label: '7 Days', desc: 'Extended care' },
      ];

      return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Share {pet.name}'s Records</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X /></button>
            </div>
            
            {!shareData ? (
              <div className="p-5">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-600">
                    <Icons.Share className="w-7 h-7" />
                  </div>
                  <p className="text-slate-600">Generate a secure, time-limited link to share with veterinary professionals.</p>
                </div>
                
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Access Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    {durations.map(d => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          duration === d.value 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{d.label}</div>
                        <div className="text-xs text-slate-500">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-5">
                  <h4 className="font-medium text-primary-900 mb-2">What gets shared:</h4>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>✓ Complete medical history</li>
                    <li>✓ Allergies & conditions</li>
                    <li>✓ Current medications</li>
                    <li>✓ Vaccination records</li>
                    <li>✓ Lab results</li>
                    <li>✓ Exam recordings & notes</li>
                  </ul>
                </div>
                
                <button 
                  onClick={createShare} 
                  disabled={loading} 
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Generating...' : 'Generate Secure Link'}
                </button>
                
                {activeShares.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <button 
                      onClick={() => setShowManage(!showManage)}
                      className="flex items-center justify-between w-full text-sm text-slate-600 hover:text-slate-900"
                    >
                      <span>{activeShares.length} active share{activeShares.length > 1 ? 's' : ''}</span>
                      <span className="text-primary-600 font-medium">{showManage ? 'Hide' : 'Manage'}</span>
                    </button>
                    {showManage && (
                      <div className="mt-3 space-y-2">
                        {activeShares.map(share => (
                          <div key={share.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                            <div className="text-sm">
                              <div className="text-slate-700">Expires in {formatExpiry(share.validUntil)}</div>
                            </div>
                            <button 
                              onClick={() => revokeShare(share.id)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Revoke
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5">
                <div className="bg-slate-50 rounded-xl p-6 text-center mb-5">
                  <img src={shareData.qrCode} alt="QR Code" className="w-52 h-52 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 font-medium">Scan to access records</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Share Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={shareData.shareUrl} 
                      readOnly 
                      className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono" 
                    />
                    <button 
                      onClick={copyLink} 
                      className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                    >
                      {copied ? <><Icons.Check className="w-4 h-4" /> Copied</> : 'Copy'}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg mb-4">
                  <Icons.Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Access expires in <strong>{duration === '1h' ? '1 hour' : duration === '24h' ? '24 hours' : duration === '72h' ? '3 days' : '7 days'}</strong></span>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShareData(null)} 
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Create Another
                  </button>
                  <button 
                    onClick={onClose} 
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Shared View
    function SharedView({ token }) {
      const [data, setData] = useState(null);
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(true);

      useEffect(() => { fetch(`/api/share/access/${token}`, { method: 'POST' }).then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error))).then(setData).catch(e => setError(e)).finally(() => setLoading(false)); }, [token]);

      if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading records...</div>;
      if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-600">{error}</div>;

      const pet = data.pet;

      return (
        <div className="min-h-screen bg-slate-50">
          <div className="gradient-bg text-white py-8">
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex items-center gap-2 text-primary-200 text-sm mb-6"><Icons.Shield /> Secure health record shared via PetRecord</div>
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/10 rounded-xl"><SpeciesIcon species={pet.species} size="lg" /></div>
                <div><h1 className="text-3xl font-bold">{pet.name}</h1><p className="text-primary-200">{pet.breed} · {pet.sex} · {pet.weightKg} kg</p></div>
              </div>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
            {data.allergies?.length > 0 && <div className="bg-red-50 border border-red-200 rounded-xl p-5"><h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2"><Icons.Alert /> Known Allergies</h3><div className="flex flex-wrap gap-2">{data.allergies.map((a, i) => <span key={i} className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">{a.allergen}</span>)}</div></div>}
            {data.conditions?.length > 0 && <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"><h3 className="font-semibold text-slate-900 mb-4">Conditions</h3>{data.conditions.map((c, i) => <div key={i} className="flex justify-between py-3 border-b border-slate-100 last:border-0"><span className="font-medium text-slate-900">{c.condition}</span><span className="text-sm text-slate-500">{c.status}</span></div>)}</div>}
            {data.activeMedications?.length > 0 && <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"><h3 className="font-semibold text-slate-900 mb-4">Current Medications</h3>{data.activeMedications.map((m, i) => <div key={i} className="py-3 border-b border-slate-100 last:border-0"><div className="font-medium text-slate-900">{m.drug_name}</div><div className="text-sm text-slate-600">{m.dose} · {m.frequency}</div></div>)}</div>}
            {data.vaccinations?.length > 0 && <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"><h3 className="font-semibold text-slate-900 mb-4">Vaccination Records</h3>{data.vaccinations.map((v, i) => <div key={i} className="flex justify-between py-3 border-b border-slate-100 last:border-0"><span className="font-medium text-slate-900">{v.vaccine_name}</span><span className="text-sm text-slate-500">{v.administration_date}</span></div>)}</div>}
            {data.medicalRecords?.length > 0 && <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"><h3 className="font-semibold text-slate-900 mb-4">Medical Records</h3>{data.medicalRecords.map((r, i) => <div key={i} className="py-4 border-b border-slate-100 last:border-0"><div className="flex justify-between items-start mb-1"><span className="font-medium text-slate-900">{r.record_type}</span><span className="text-sm text-slate-500">{r.date_of_service}</span></div>{r.summary && <p className="text-sm text-slate-600">{r.summary}</p>}{r.facility_name && <p className="text-xs text-slate-400 mt-1">{r.facility_name}</p>}</div>)}</div>}
            <div className="text-center pt-6"><Icons.Logo /><p className="text-sm text-slate-500 mt-2">Powered by PetRecord</p></div>
          </div>
        </div>
      );
    }

    // Main App
    function App() {
      const { isAuthenticated, loading } = useAuth();
      const [view, setView] = useState('login');
      const [selectedPet, setSelectedPet] = useState(null);

      const path = window.location.pathname;
      // Share URLs are now handled by server-rendered share.html
      if (path.startsWith('/share/')) {
        window.location.reload(); // Let server handle it
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading shared records...</div>;
      }

      if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading...</div>;

      if (!isAuthenticated) return view === 'login' ? <LoginPage onSwitch={() => setView('register')} /> : <RegisterPage onSwitch={() => setView('login')} />;
      if (selectedPet) return <PetProfile pet={selectedPet} onBack={() => setSelectedPet(null)} />;
      return <Dashboard onSelectPet={setSelectedPet} />;
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<AuthProvider><App /></AuthProvider>);
  </script>
</body>
</html>
