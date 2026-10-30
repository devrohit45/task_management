import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from './components/Button'
import Dashboard from './components/Dashboard'
import EmployeesPage from './components/EmployeesPage'
import Icon from './components/Icon'
import LoginPage from './components/LoginPage'
import Modal from './components/Modal'
import ProfilePage from './components/ProfilePage'
import ProjectForm from './components/ProjectForm'
import ProjectPage from './components/ProjectPage'
import TaskForm from './components/TaskForm'
import TaskTable from './components/TaskTable'
import roleLabel from './utils/roleLabel'
import { logout } from './features/auth/authSlice'
import {
  clearTaskData,
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  fetchProjectOptions,
  fetchProjects,
  fetchTasks,
  fetchUsers,
  updateProject,
  updateTask,
} from './features/tasks/tasksSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()
  const { account, token } = useSelector((state) => state.auth)
  const {
    items: tasks,
    projects,
    projectOptions,
    users,
    status: tasksStatus,
    projectsStatus,
    projectOptionsStatus,
    usersStatus,
    mutationStatus,
    error: taskError,
  } = useSelector((state) => state.tasks)
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')
  const [projectStatusFilter, setProjectStatusFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!account || !token) {
      dispatch(clearTaskData())
      return
    }

    dispatch(fetchTasks())
    dispatch(fetchUsers())
    dispatch(fetchProjects())
    dispatch(fetchProjectOptions())
  }, [dispatch, account, token])

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.description} ${task.assignee} ${task.projectName}`.toLowerCase().includes(search.toLowerCase())
    const matchesProject = projectFilter === 'All' || task.projectId?.toString() === projectFilter
    return matchesSearch && matchesProject && (statusFilter === 'All' || task.status === statusFilter)
  }), [tasks, search, statusFilter, projectFilter])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearTaskData())
    setModal(null)
    setActivePage('Overview')
  }

  const saveTask = async (values) => {
    try {
      if (modal?.task) {
        await dispatch(updateTask({ id: modal.task.id, values })).unwrap()
        setNotice(`“${values.title}” has been updated.`)
      } else {
        await dispatch(createTask(values)).unwrap()
        setNotice(`“${values.title}” has been created.`)
      }
      setModal(null)
    } catch {
      // The failed request is shown from the task slice.
    }
  }

  const saveProject = async (values) => {
    try {
      if (modal?.project) {
        await dispatch(updateProject({ id: modal.project.id, values })).unwrap()
        setNotice(`“${values.name}” has been updated.`)
      } else {
        await dispatch(createProject(values)).unwrap()
        setNotice(`“${values.name}” has been created.`)
      }
      dispatch(fetchProjectOptions())
      setModal(null)
    } catch {
      // The failed request is shown from the task slice.
    }
  }

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete “${project.name}”? Projects with tasks must be empty first.`)) return
    try {
      await dispatch(deleteProject(project.id)).unwrap()
      dispatch(fetchProjectOptions())
      setNotice(`“${project.name}” has been deleted.`)
    } catch {
      // The failed request is shown from the task slice.
    }
  }

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete “${task.title}”? This action cannot be undone.`)) return
    try {
      await dispatch(deleteTask(task.id)).unwrap()
      setNotice(`“${task.title}” has been deleted.`)
    } catch {
      // The failed request is shown from the task slice.
    }
  }

  if (!account) return <LoginPage />
  const canManageTeam = ['admin', 'manager'].includes(account.role)
  const canManageTask = (task) => canManageTeam || task.createdById === account.id || task.assigneeId === account.id

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setActivePage('Overview') }}>
          <span className="brand-mark"><Icon name="grid" /></span>
          <span>PROMOTION KART<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-switcher">
          <span className="workspace-avatar">{account.name.trim().charAt(0).toUpperCase()}</span>
          <span className="workspace-copy"><strong>{account.name}</strong><small>{roleLabel(account.role)} workspace</small></span>
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
          <button className={`nav-link ${activePage === 'Projects' ? 'is-active' : ''}`} onClick={() => setActivePage('Projects')}><Icon name="grid" /><span>Projects</span><span className="nav-count">{projects.length}</span></button>
          {account.role === 'admin' && <button className={`nav-link ${activePage === 'Employees' ? 'is-active' : ''}`} onClick={() => setActivePage('Employees')}><Icon name="users" /><span>Employees</span><span className="nav-count">{users.filter((user) => user.role === 'employee').length}</span></button>}
        </nav>
        <div className="sidebar-bottom">
          <button className={`nav-link ${activePage === 'Profile' ? 'is-active' : ''}`} onClick={() => setActivePage('Profile')}><Icon name="users" /><span>Profile</span></button>
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
          {taskError && (
            <div className="storage-alert" role="alert">
              <span>{taskError}</span>
              <button type="button" onClick={() => { dispatch(fetchTasks()); dispatch(fetchUsers()); dispatch(fetchProjects()); dispatch(fetchProjectOptions()) }}>Retry</button>
            </div>
          )}
          {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
          {activePage === 'Overview' ? (
            tasksStatus === 'loading' && tasks.length === 0
              ? <div className="loading-state" role="status">Loading your workspace…</div>
              : <Dashboard tasks={tasks} userName={account.name} role={account.role} onViewTasks={() => { setProjectFilter('All'); setActivePage('Tasks') }} />
          ) : activePage === 'Profile' ? (
            <ProfilePage onCancel={() => setActivePage('Overview')} />
          ) : activePage === 'Employees' && account.role === 'admin' ? (
            <EmployeesPage onCreated={(employee) => setNotice(`${employee.name} has been added to the team.`)} />
          ) : activePage === 'Projects' ? (
            projectsStatus === 'loading' && projects.length === 0
              ? <div className="loading-state" role="status">Loading projects…</div>
              : <ProjectPage
                projects={projects}
                statusFilter={projectStatusFilter}
                onFilter={setProjectStatusFilter}
                canManageProjects={canManageTeam}
                onCreate={() => setModal({ project: null })}
                onEdit={(project) => setModal({ project })}
                onDelete={handleDeleteProject}
                onViewTasks={(project) => {
                  setProjectFilter(project.id.toString())
                  setActivePage('Tasks')
                }}
              />
          ) : (
            <section className="tasks-page">
              <div className="page-heading">
                <div><p className="eyebrow">{roleLabel(account.role).toUpperCase()} WORKSPACE</p><h1>{canManageTeam ? 'Team tasks' : 'My tasks'}</h1><p className="page-subtitle">{canManageTeam ? 'Plan, assign, and track work across your team.' : 'Review and update the tasks assigned to you.'}</p></div>
                <Button onClick={() => setModal({ task: null })} disabled={usersStatus === 'loading' || users.length === 0}><Icon name="plus" /> New task</Button>
              </div>
              {tasksStatus === 'loading' && <div className="loading-state" role="status">Loading tasks…</div>}
              {projectOptionsStatus === 'succeeded' && projectOptions.length === 0 && (
                <div className="project-required-note" role="status">
                  <Icon name="grid" />
                  <span>{canManageTeam ? 'No active projects yet. You can still create personal tasks.' : 'You can create personal tasks now, or ask a manager to assign you to an active project.'}</span>
                  {canManageTeam && <Button variant="secondary" onClick={() => setActivePage('Projects')}>View projects</Button>}
                </div>
              )}
              <TaskTable tasks={filteredTasks} projects={projects} projectFilter={projectFilter} onProjectFilter={setProjectFilter} search={search} onSearch={setSearch} statusFilter={statusFilter} onFilter={setStatusFilter} onEdit={(task) => setModal({ task })} onDelete={handleDeleteTask} canManageTask={canManageTask} />
            </section>
          )}
        </div>
      </main>

      {modal && (
        <Modal
          title={activePage === 'Projects'
            ? modal.project ? 'Edit project' : 'Create a project'
            : modal.task ? 'Edit task' : 'Create a task'}
          onClose={() => setModal(null)}
        >
          {activePage === 'Projects' ? (
            <ProjectForm project={modal.project} users={users} isSaving={mutationStatus === 'loading'} onCancel={() => setModal(null)} onSubmit={saveProject} />
          ) : (
            <TaskForm
              task={modal.task}
              users={users}
              projects={modal.task && !projectOptions.some((project) => project.id === modal.task.projectId)
                ? [...projectOptions, projects.find((project) => project.id === modal.task.projectId)].filter(Boolean)
                : projectOptions}
              accountId={account.id}
              role={account.role}
              isSaving={mutationStatus === 'loading'}
              onCancel={() => setModal(null)}
              onSubmit={saveTask}
            />
          )}
        </Modal>
      )}
    </div>
  )
}

export default App
