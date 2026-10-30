import { useMemo, useState } from 'react'
import Button from './components/Button'
import Dashboard from './components/Dashboard'
import Icon from './components/Icon'
import LoginPage from './components/LoginPage'
import Modal from './components/Modal'
import TaskForm from './components/TaskForm'
import TaskTable from './components/TaskTable'
import './App.css'

const STORAGE_KEY = 'taskflow-tasks'
const SESSION_KEY = 'taskflow-account-session'

function getSessionAccount() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (!saved) return null
    const account = JSON.parse(saved)
    if (typeof account.email !== 'string' || typeof account.name !== 'string' || typeof account.role !== 'string') {
      throw new Error('Saved account data has an invalid format.')
    }
    return account
  } catch (error) {
    console.error('Unable to restore the saved account:', error)
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

const starterTasks = [
  { id: 't-1', title: 'Refresh onboarding experience', description: 'Simplify the first-run flow and update welcome screens.', assignee: 'Olivia Rhye', status: 'In progress', priority: 'High', dueDate: '2026-11-02' },
  { id: 't-2', title: 'Review Q4 campaign assets', description: 'Collect feedback from the team on the campaign creative.', assignee: 'Phoenix Baker', status: 'In review', priority: 'High', dueDate: '2026-10-31' },
  { id: 't-3', title: 'Update customer help center', description: 'Bring the product guides up to date with the latest release.', assignee: 'Lana Steiner', status: 'To do', priority: 'Medium', dueDate: '2026-11-06' },
  { id: 't-4', title: 'Prepare monthly product report', description: 'Summarize key metrics and product updates for October.', assignee: 'Demi Wilkinson', status: 'Done', priority: 'Medium', dueDate: '2026-10-24' },
  { id: 't-5', title: 'Audit accessibility contrast', description: 'Check the core application screens against WCAG guidelines.', assignee: 'Candice Wu', status: 'In progress', priority: 'Low', dueDate: '2026-11-10' },
  { id: 't-6', title: 'Plan customer interview round', description: 'Schedule five customer interviews for the next research cycle.', assignee: 'Natali Craig', status: 'To do', priority: 'Low', dueDate: '2026-11-12' },
]

function getSavedTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return { tasks: starterTasks, error: '' }
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed) || !parsed.every((task) => (
      task &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      typeof task.assignee === 'string' &&
      typeof task.status === 'string' &&
      typeof task.priority === 'string' &&
      typeof task.dueDate === 'string'
    ))) {
      throw new Error('Saved task data has an invalid format.')
    }
    return { tasks: parsed, error: '' }
  } catch (error) {
    console.error('Unable to load saved tasks:', error)
    return { tasks: starterTasks, error: 'Saved task data could not be loaded. The demo task list is shown instead.' }
  }
}

function App() {
  const [initialData] = useState(getSavedTasks)
  const [tasks, setTasks] = useState(initialData.tasks)
  const [storageError, setStorageError] = useState(initialData.error)
  const [account, setAccount] = useState(getSessionAccount)
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.description} ${task.assignee}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (statusFilter === 'All' || task.status === statusFilter)
  }), [tasks, search, statusFilter])

  const saveTasks = (nextTasks) => {
    setTasks(nextTasks)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks))
      setStorageError('')
    } catch (error) {
      console.error('Unable to save tasks:', error)
      setStorageError('Changes could not be saved in this browser. Check your storage settings.')
    }
  }

  const handleLogin = (signedInAccount) => {
    const accountSession = {
      name: signedInAccount.name,
      email: signedInAccount.email,
      role: signedInAccount.role,
      initials: signedInAccount.initials,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(accountSession))
    setAccount(accountSession)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAccount(null)
    setActivePage('Overview')
  }

  const saveTask = (values) => {
    if (modal?.task) {
      saveTasks(tasks.map((task) => task.id === modal.task.id ? { ...task, ...values } : task))
      setNotice(`“${values.title}” has been updated.`)
    } else {
      saveTasks([{ ...values, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...tasks])
      setNotice(`“${values.title}” has been created.`)
    }
    setModal(null)
  }

  const deleteTask = (task) => {
    if (!window.confirm(`Delete “${task.title}”? This action cannot be undone.`)) return
    saveTasks(tasks.filter((entry) => entry.id !== task.id))
    setNotice(`“${task.title}” has been deleted.`)
  }

  if (!account) return <LoginPage onLogin={handleLogin} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActivePage('Overview') }}>
          <span className="brand-mark"><Icon name="grid" /></span>
          <span>taskflow<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-switcher">
          <span className="workspace-avatar">A</span>
          <span className="workspace-copy"><strong>Acme Studio</strong><small>{account.role} workspace</small></span>
          <Icon name="chevrons" />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            { label: 'Overview', icon: 'home' },
            { label: 'Tasks', icon: 'checklist', count: tasks.length },
          ].map((item) => (
            <button key={item.label} className={`nav-link ${activePage === item.label ? 'is-active' : ''}`} onClick={() => setActivePage(item.label)}>
              <Icon name={item.icon} /><span>{item.label}</span>{item.count !== undefined && <span className="nav-count">{item.count}</span>}
            </button>
          ))}
          <button className="nav-link" onClick={() => setNotice('Projects are coming soon.')}><Icon name="grid" /><span>Projects</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link" onClick={() => setNotice('Settings are coming soon.')}><Icon name="settings" /><span>Settings</span></button>
          <div className="sidebar-profile">
            <span className="profile-avatar">{account.initials}</span>
            <span className="profile-copy"><strong>{account.name}</strong><small>{account.email}</small></span>
            <button className="icon-button profile-menu" aria-label="Log out" title="Log out" onClick={handleLogout}><Icon name="logout" /></button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Acme Studio</span><Icon name="chevronRight" /><strong>{activePage}</strong></div>
          <div className="topbar-actions">
            <span className="today-label">{new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up.')}><Icon name="bell" /><span /></button>
            <button className="topbar-avatar" aria-label="Log out" title="Log out" onClick={handleLogout}>{account.initials}</button>
          </div>
        </header>

        <div className="page-content">
          {storageError && <div className="storage-alert" role="alert">{storageError}</div>}
          {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
          {activePage === 'Overview' ? (
            <Dashboard tasks={tasks} userName={account.name} onViewTasks={() => setActivePage('Tasks')} />
          ) : (
            <section className="tasks-page">
              <div className="page-heading">
                <div><p className="eyebrow">YOUR WORKSPACE</p><h1>Tasks</h1><p className="page-subtitle">Plan, prioritize, and keep your team moving forward.</p></div>
                <Button onClick={() => setModal({ task: null })}><Icon name="plus" /> New task</Button>
              </div>
              <TaskTable tasks={filteredTasks} search={search} onSearch={setSearch} statusFilter={statusFilter} onFilter={setStatusFilter} onEdit={(task) => setModal({ task })} onDelete={deleteTask} />
            </section>
          )}
        </div>
      </main>

      {modal && (
        <Modal title={modal.task ? 'Edit task' : 'Create a task'} onClose={() => setModal(null)}>
          <TaskForm task={modal.task} onCancel={() => setModal(null)} onSubmit={saveTask} />
        </Modal>
      )}
    </div>
  )
}

export default App
