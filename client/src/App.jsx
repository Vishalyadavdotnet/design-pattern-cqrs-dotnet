import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserPlus, Edit2, Trash2, Settings, Terminal, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Info, HelpCircle
} from 'lucide-react';

export default function App() {
  // Configuration
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('cqrs_api_url') || 'http://localhost:5000';
  });
  const [apiStatus, setApiStatus] = useState('unknown'); // 'unknown', 'connected', 'failed'

  // Data State
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Modals & Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // CQRS Learning Flow Logs
  const [cqrsLogs, setCqrsLogs] = useState([]);

  // Save API URL helper
  const handleSaveApiUrl = (url) => {
    const sanitizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    setApiUrl(sanitizedUrl);
    localStorage.setItem('cqrs_api_url', sanitizedUrl);
    addLog('System', `API Base URL updated to: ${sanitizedUrl}`, 'info');
    testConnection(sanitizedUrl);
  };

  // Add a CQRS trace log
  const addLog = useCallback((source, message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setCqrsLogs(prev => [{ id: Date.now(), timestamp, source, message, type }, ...prev].slice(0, 50));
  }, []);

  // Test API Connection
  const testConnection = async (urlToTest = apiUrl) => {
    setApiStatus('testing');
    try {
      addLog('MediatR', `Testing connection by sending ping to ${urlToTest}/api/users...`, 'system');
      const response = await fetch(`${urlToTest}/api/users?pageNumber=1&pageSize=1`);
      if (response.ok) {
        setApiStatus('connected');
        addLog('MediatR', `Connection successful! API is active.`, 'success');
      } else {
        throw new Error(`API responded with status ${response.status}`);
      }
    } catch (err) {
      setApiStatus('failed');
      addLog('MediatR', `Connection failed: ${err.message}. Make sure the .NET API is running and CORS is enabled.`, 'error');
    }
  };

  // Fetch Users (GetAllUsersQuery)
  const fetchUsers = useCallback(async (page = pageNumber) => {
    setLoading(true);
    setGeneralError('');
    
    // Log CQRS dispatch
    addLog('Query Dispatch', `Sending GetAllUsersQuery { PageNumber: ${page}, PageSize: ${pageSize} }`, 'query');
    addLog('MediatR Pipeline', `LoggingBehavior -> Starting execution for GetAllUsersQuery`, 'pipeline');
    
    try {
      const response = await fetch(`${apiUrl}/api/users?pageNumber=${page}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      setUsers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
      setPageNumber(data.pageNumber || 1);
      
      // Log CQRS handle completion
      addLog('MediatR Pipeline', `LoggingBehavior -> Completed GetAllUsersQuery successfully`, 'pipeline');
      addLog('Query Handler', `GetAllUsersQueryHandler -> Fetched ${data.items?.length || 0} users (Total: ${data.totalCount})`, 'handler');
    } catch (err) {
      setGeneralError('Failed to fetch users. Check console and verify API connection.');
      addLog('MediatR Pipeline', `LoggingBehavior -> Request failed: ${err.message}`, 'error');
      setApiStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, pageNumber, pageSize, addLog]);

  // Initial load
  useEffect(() => {
    testConnection().then(() => {
      fetchUsers(1);
    });
  }, [apiUrl]);

  // Create User (CreateUserCommand)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError('');
    setSuccessMessage('');
    
    // Log CQRS dispatch
    addLog('Command Dispatch', `Sending CreateUserCommand { Name: "${formData.name}", Email: "${formData.email}" }`, 'command');
    addLog('MediatR Pipeline', `LoggingBehavior -> Starting execution for CreateUserCommand`, 'pipeline');
    addLog('MediatR Pipeline', `ValidationBehavior -> Validating inputs...`, 'pipeline');

    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email })
      });

      if (response.ok) {
        const id = await response.json();
        
        // Log Success
        addLog('MediatR Pipeline', `ValidationBehavior -> Success. No validation errors.`, 'pipeline');
        addLog('MediatR Pipeline', `LoggingBehavior -> Completed CreateUserCommand successfully`, 'pipeline');
        addLog('Command Handler', `CreateUserCommandHandler -> Saved User "${formData.name}" to database. Generated ID: ${id}`, 'success');
        
        setSuccessMessage('User created successfully!');
        setFormData({ id: '', name: '', email: '' });
        setShowCreateModal(false);
        fetchUsers(1);
      } else {
        const errData = await response.json();
        if (response.status === 400 && errData.errors) {
          setValidationErrors(errData.errors);
          setGeneralError(errData.detail || 'Validation failed.');
          
          // Log Validation Error
          addLog('MediatR Pipeline', `ValidationBehavior -> Failed. Threw CustomValidationException.`, 'error');
          Object.entries(errData.errors).forEach(([field, msgs]) => {
            addLog('Validation Exception', `${field}: ${msgs.join(', ')}`, 'error');
          });
        } else {
          setGeneralError(errData.detail || 'An unexpected error occurred.');
          addLog('MediatR Pipeline', `LoggingBehavior -> Command failed: ${errData.detail || 'Unknown error'}`, 'error');
        }
      }
    } catch (err) {
      setGeneralError('Failed to connect to the backend server.');
      addLog('MediatR Pipeline', `LoggingBehavior -> Command execution failed: ${err.message}`, 'error');
    }
  };

  // Update User (UpdateUserCommand)
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setGeneralError('');
    setSuccessMessage('');
    
    // Log CQRS dispatch
    addLog('Command Dispatch', `Sending UpdateUserCommand { Id: "${formData.id}", Name: "${formData.name}", Email: "${formData.email}" }`, 'command');
    addLog('MediatR Pipeline', `LoggingBehavior -> Starting execution for UpdateUserCommand`, 'pipeline');
    addLog('MediatR Pipeline', `ValidationBehavior -> Validating inputs...`, 'pipeline');

    try {
      const response = await fetch(`${apiUrl}/api/users/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: formData.id, name: formData.name, email: formData.email })
      });

      if (response.status === 204) {
        // Log Success
        addLog('MediatR Pipeline', `ValidationBehavior -> Success. No validation errors.`, 'pipeline');
        addLog('MediatR Pipeline', `LoggingBehavior -> Completed UpdateUserCommand successfully`, 'pipeline');
        addLog('Command Handler', `UpdateUserCommandHandler -> Updated User ID ${formData.id} in repository`, 'success');
        
        setSuccessMessage('User updated successfully!');
        setFormData({ id: '', name: '', email: '' });
        setShowEditModal(false);
        fetchUsers(pageNumber);
      } else {
        const errData = await response.json();
        if (response.status === 400 && errData.errors) {
          setValidationErrors(errData.errors);
          setGeneralError(errData.detail || 'Validation failed.');
          
          addLog('MediatR Pipeline', `ValidationBehavior -> Failed. Threw CustomValidationException.`, 'error');
        } else {
          setGeneralError(errData.detail || 'An unexpected error occurred.');
          addLog('MediatR Pipeline', `LoggingBehavior -> Command failed: ${errData.detail || 'Unknown error'}`, 'error');
        }
      }
    } catch (err) {
      setGeneralError('Failed to connect to the backend server.');
      addLog('MediatR Pipeline', `LoggingBehavior -> Command execution failed: ${err.message}`, 'error');
    }
  };

  // Delete User (DeleteUserCommand)
  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    
    setGeneralError('');
    setSuccessMessage('');
    
    // Log CQRS dispatch
    addLog('Command Dispatch', `Sending DeleteUserCommand { Id: "${id}" }`, 'command');
    addLog('MediatR Pipeline', `LoggingBehavior -> Starting execution for DeleteUserCommand`, 'pipeline');

    try {
      const response = await fetch(`${apiUrl}/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.status === 204) {
        addLog('MediatR Pipeline', `LoggingBehavior -> Completed DeleteUserCommand successfully`, 'pipeline');
        addLog('Command Handler', `DeleteUserCommandHandler -> Deleted User ID ${id} from repository`, 'success');
        
        setSuccessMessage('User deleted successfully!');
        fetchUsers(1);
      } else {
        const errData = await response.json();
        setGeneralError(errData.detail || 'Failed to delete user.');
        addLog('MediatR Pipeline', `LoggingBehavior -> Command failed: ${errData.detail}`, 'error');
      }
    } catch (err) {
      setGeneralError('Failed to connect to the backend server.');
      addLog('MediatR Pipeline', `LoggingBehavior -> Command execution failed: ${err.message}`, 'error');
    }
  };

  const openCreateModal = () => {
    setFormData({ id: '', name: '', email: '' });
    setValidationErrors({});
    setGeneralError('');
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setFormData({ id: user.id, name: user.name, email: user.email });
    setValidationErrors({});
    setGeneralError('');
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              CQ
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                CQRS Learning Hub
                <span className="text-xs font-normal py-0.5 px-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  .NET 10 Web API
                </span>
              </h1>
              <p className="text-xs text-slate-400">Clean Architecture vertical slice demonstration</p>
            </div>
          </div>

          {/* Connection Status & Settings */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className={`h-2.5 w-2.5 rounded-full ${
                apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                apiStatus === 'failed' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
              }`} />
              <input 
                type="text" 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                onBlur={(e) => handleSaveApiUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiUrl(e.target.value)}
                className="bg-transparent border-none text-xs focus:ring-0 outline-none text-slate-200 w-44 font-mono"
                placeholder="API Base URL"
              />
              <button 
                onClick={() => testConnection()}
                className="text-slate-400 hover:text-white transition-colors"
                title="Test Connection"
              >
                <RefreshCw size={14} className={apiStatus === 'testing' ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Main UI (Users List) */}
        <section className="flex-1 flex flex-col gap-6">
          
          {/* Status Banners */}
          {generalError && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <XCircle className="text-rose-500 shrink-0" size={18} />
              <div className="text-sm">{generalError}</div>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-emerald-500 shrink-0" size={18} />
              <div className="text-sm">{successMessage}</div>
            </div>
          )}

          {/* User Directory Table Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-400" size={20} />
                <h2 className="text-base font-semibold text-white">Users Directory</h2>
              </div>
              <button 
                onClick={openCreateModal}
                disabled={apiStatus === 'failed'}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <UserPlus size={16} />
                Create User
              </button>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800/50 bg-slate-900/20 text-slate-400 font-medium">
                    <th className="py-3 px-6">ID</th>
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Created At</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-400">
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw size={18} className="animate-spin text-indigo-500" />
                          <span>Dispatching GetAllUsersQuery...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-slate-500">
                        <Users size={48} className="mx-auto text-slate-700 mb-3" />
                        <p className="text-sm font-medium text-slate-400">No users inside repository</p>
                        <p className="text-xs text-slate-500 mt-1">Click the "Create User" command to insert your first record.</p>
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-900/30 transition-colors group">
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 truncate max-w-[120px]" title={user.id}>
                          {user.id}
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-200">
                          {user.name}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {user.email}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(user)}
                              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {users.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  Showing page <span className="font-semibold text-slate-200">{pageNumber}</span> of <span className="font-semibold text-slate-200">{totalPages}</span> (Total {totalCount} records)
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { fetchUsers(pageNumber - 1); }}
                    disabled={pageNumber === 1 || loading}
                    className="p-2 border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:hover:border-slate-800 text-slate-300 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => { fetchUsers(pageNumber + 1); }}
                    disabled={pageNumber === totalPages || loading}
                    className="p-2 border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:hover:border-slate-800 text-slate-300 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: CQRS pipeline flow logger */}
        <aside className="w-full lg:w-96 flex flex-col gap-6">
          
          {/* CQRS Flow Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[560px]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Terminal className="text-indigo-400 animate-pulse" size={18} />
                <h2 className="text-sm font-semibold text-white font-mono">CQRS Pipeline Visualizer</h2>
              </div>
              <button 
                onClick={() => setCqrsLogs([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-3 bg-slate-950/80">
              {cqrsLogs.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-600 p-4">
                  <HelpCircle size={28} className="mb-2" />
                  <p>Send a Create, Update, Delete command or Query list to see the MediatR request flow trace here in real time!</p>
                </div>
              ) : (
                cqrsLogs.map(log => (
                  <div key={log.id} className="border-l-2 pl-3 py-0.5 border-slate-800 hover:bg-slate-900/40 rounded transition-colors">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>[{log.timestamp}]</span>
                      <span className={`px-1.5 py-0.5 rounded font-sans text-[8px] uppercase tracking-wider ${
                        log.type === 'query' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        log.type === 'command' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        log.type === 'pipeline' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        log.type === 'handler' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        log.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>{log.source}</span>
                    </div>
                    <p className={`mt-1 font-medium leading-relaxed ${
                      log.type === 'error' ? 'text-rose-400' :
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'query' ? 'text-cyan-400' :
                      log.type === 'command' ? 'text-amber-400' :
                      'text-slate-300'
                    }`}>{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Create New User (Command)</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full bg-slate-950 border ${
                    validationErrors.Name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500/20 outline-none text-slate-200 transition-colors`}
                  placeholder="Enter name"
                />
                {validationErrors.Name && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.Name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="text" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full bg-slate-950 border ${
                    validationErrors.Email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500/20 outline-none text-slate-200 transition-colors`}
                  placeholder="name@example.com"
                />
                {validationErrors.Email && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.Email[0]}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-3 text-sm">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                >
                  Dispatch Command
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Edit User details (Command)</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5 font-mono">User ID (ReadOnly)</label>
                <input 
                  type="text" 
                  value={formData.id}
                  disabled
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full bg-slate-950 border ${
                    validationErrors.Name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500/20 outline-none text-slate-200 transition-colors`}
                  placeholder="Enter name"
                />
                {validationErrors.Name && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.Name[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="text" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full bg-slate-950 border ${
                    validationErrors.Email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  } rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-indigo-500/20 outline-none text-slate-200 transition-colors`}
                  placeholder="name@example.com"
                />
                {validationErrors.Email && (
                  <p className="text-xs text-rose-500 mt-1">{validationErrors.Email[0]}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-3 text-sm">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                >
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
