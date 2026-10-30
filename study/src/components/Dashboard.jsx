import Button from './Button'
import Icon from './Icon'
import roleLabel from '../utils/roleLabel'

function Dashboard({ tasks, userName, role, onViewTasks }) {
  const isManager = ['admin', 'manager'].includes(role)
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In progress').length
  const taskStatuses = [
    { label: 'To do', color: '#8879d3' },
    { label: 'In progress', color: '#5599c9' },
    { label: 'In review', color: '#dfaa61' },
    { label: 'Done', color: '#45ad83' },
  ].map((status) => ({
    ...status,
    count: tasks.filter((task) => task.status === status.label).length,
  }))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueTasks = tasks.filter((task) => task.status !== 'Done' && new Date(`${task.dueDate}T00:00:00`) < today).length
  const upcomingTasks = [...tasks].filter((task) => task.status !== 'Done').sort((first, second) => first.dueDate.localeCompare(second.dueDate)).slice(0, 4)
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()
  const firstName = userName.split(' ')[0]

  return (
    <section className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div><p className="eyebrow">{dateLabel} · {roleLabel(role).toUpperCase()} DASHBOARD</p><h1>{isManager ? `Good morning, ${firstName}` : `Your work, ${firstName}`} <span className="wave">✦</span></h1><p className="page-subtitle">{isManager ? 'Here’s a look at your team’s work today.' : 'Here’s your personal task overview.'}</p></div>
        <Button variant="secondary" className="date-button"><Icon name="calendar" /> This week <span className="date-chevron">⌄</span></Button>
      </div>

      <div className="stats-grid">
        <article className="stat-card"><div className="stat-top"><span>{isManager ? 'Team tasks' : 'My tasks'}</span><span className="stat-icon icon-lilac"><Icon name="checklist" /></span></div><div className="stat-value">{tasks.length}</div><div className="stat-foot"><span className="trend-neutral">{isManager ? 'Across your workspace' : 'Assigned or created by you'}</span></div><div className="sparkline spark-purple"><svg viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 27 C12 25 12 20 24 22 S42 28 52 16 S68 18 75 13 S91 19 98 8 S110 12 120 3" /></svg></div></article>
        <article className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon icon-blue"><Icon name="chart" /></span></div><div className="stat-value">{inProgressTasks}</div><div className="stat-foot"><span className="trend-positive">Moving forward</span></div><div className="sparkline spark-green"><svg viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 26 C10 25 15 14 24 20 S39 25 47 15 S64 19 75 10 S88 17 96 10 S110 12 120 2" /></svg></div></article>
        <article className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon icon-orange"><Icon name="calendar" /></span></div><div className="stat-value">{overdueTasks}</div><div className="stat-foot"><span className={overdueTasks ? 'trend-warning' : 'trend-positive'}>{overdueTasks ? 'Needs attention' : 'All caught up'}</span></div><div className="sparkline spark-orange"><svg viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 23 C12 17 16 26 26 18 S43 24 52 12 S67 19 77 17 S88 7 98 12 S110 9 120 4" /></svg></div></article>
        <article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon icon-green"><Icon name="check" /></span></div><div className="stat-value">{completedTasks}</div><div className="stat-foot"><span className="trend-positive">{isManager ? 'Nice work, team' : 'Nice work'}</span></div><div className="health-track"><span style={{ width: tasks.length ? `${Math.round(completedTasks / tasks.length * 100)}%` : '0%' }} /></div></article>
      </div>

      <div className={`dashboard-grid ${isManager ? '' : 'personal-dashboard-grid'}`}>
        {isManager && <article className="panel activity-panel">
          <div className="panel-heading"><div><h2>Team task breakdown</h2><p>Current status across your workspace</p></div></div>
          <div className="chart-summary"><strong>{tasks.length}</strong><span className="chart-period">tasks across your team</span></div>
          <div className="task-breakdown">{taskStatuses.map((status) => (
            <div className="task-breakdown-row" key={status.label}>
              <span>{status.label}</span>
              <div className="task-breakdown-track"><i style={{ width: tasks.length ? `${status.count / tasks.length * 100}%` : '0%', backgroundColor: status.color }} /></div>
              <strong>{status.count}</strong>
            </div>
          ))}</div>
        </article>}
        <article className="panel members-panel">
          <div className="panel-heading"><div><h2>{isManager ? 'Team workload' : 'My upcoming tasks'}</h2><p>{isManager ? 'Upcoming work across your team' : 'The next tasks on your list'}</p></div><button className="more-button" aria-label="More task options"><Icon name="more" /></button></div>
          <div className="recent-members">{upcomingTasks.map((task) => <div className="recent-member" key={task.id}><span className={`task-mini-icon mini-${task.priority.toLowerCase()}`}><Icon name="checklist" size={15} /></span><span className="user-identity"><strong>{task.title}</strong><small>{isManager ? `${task.assignee} · ` : ''}Due {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${task.dueDate}T00:00:00`))}</small></span><span className={`status-dot status-dot-${task.status.toLowerCase().replaceAll(' ', '-')}`} title={task.status} /></div>)}</div>
          <button className="view-all-link" onClick={onViewTasks}>View all tasks <span>→</span></button>
        </article>
      </div>

      <div className="dashboard-bottom">
        <article className="panel getting-started"><span className="getting-started-icon"><Icon name="checklist" size={20} /></span><div><h2>Make progress together</h2><p>Keep priorities clear and make every task count.</p></div><Button variant="secondary" onClick={onViewTasks}>Manage tasks</Button></article>
      </div>
      <footer className="page-footer"><span>© 2026 PROMOTION KART</span><span>Make great things happen <span className="footer-spark">✦</span></span><button onClick={onViewTasks}>Help center</button></footer>
    </section>
  )
}

export default Dashboard
