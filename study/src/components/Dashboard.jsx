import Button from './Button'
import Icon from './Icon'

function Dashboard({ tasks, userName, onViewTasks }) {
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In progress').length
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueTasks = tasks.filter((task) => task.status !== 'Done' && new Date(`${task.dueDate}T00:00:00`) < today).length
  const upcomingTasks = [...tasks].filter((task) => task.status !== 'Done').sort((first, second) => first.dueDate.localeCompare(second.dueDate)).slice(0, 4)
  const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase()
  const firstName = userName.split(' ')[0]

  return (
    <section className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div><p className="eyebrow">{dateLabel}</p><h1>Good morning, {firstName} <span className="wave">✦</span></h1><p className="page-subtitle">Here’s a look at your team’s work today.</p></div>
        <Button variant="secondary" className="date-button"><Icon name="calendar" /> This week <span className="date-chevron">⌄</span></Button>
      </div>

      <div className="stats-grid">
        <article className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon icon-lilac"><Icon name="checklist" /></span></div><div className="stat-value">{tasks.length}</div><div className="stat-foot"><span className="trend-neutral">Across your workspace</span></div><div className="sparkline spark-purple"><svg viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 27 C12 25 12 20 24 22 S42 28 52 16 S68 18 75 13 S91 19 98 8 S110 12 120 3" /></svg></div></article>
        <article className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon icon-blue"><Icon name="chart" /></span></div><div className="stat-value">{inProgressTasks}</div><div className="stat-foot"><span className="trend-positive">Moving forward</span></div><div className="sparkline spark-green"><svg viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 26 C10 25 15 14 24 20 S39 25 47 15 S64 19 75 10 S88 17 96 10 S110 12 120 2" /></svg></div></article>
        <article className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon icon-orange"><Icon name="calendar" /></span></div><div className="stat-value">{overdueTasks}</div><div className="stat-foot"><span className={overdueTasks ? 'trend-warning' : 'trend-positive'}>{overdueTasks ? 'Needs attention' : 'All caught up'}</span></div><div className="sparkline spark-orange"><svg viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 23 C12 17 16 26 26 18 S43 24 52 12 S67 19 77 17 S88 7 98 12 S110 9 120 4" /></svg></div></article>
        <article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon icon-green"><Icon name="check" /></span></div><div className="stat-value">{completedTasks}</div><div className="stat-foot"><span className="trend-positive">Nice work, team</span></div><div className="health-track"><span style={{ width: tasks.length ? `${Math.round(completedTasks / tasks.length * 100)}%` : '0%' }} /></div></article>
      </div>

      <div className="dashboard-grid">
        <article className="panel activity-panel">
          <div className="panel-heading"><div><h2>Task activity</h2><p>A snapshot of work moving through your team</p></div><button className="more-button" aria-label="More activity options"><Icon name="more" /></button></div>
          <div className="chart-summary"><strong>{tasks.length}</strong><span className="chart-period">tasks in this workspace</span></div>
          <div className="chart-wrap"><div className="chart-y-labels"><span>500</span><span>400</span><span>300</span><span>200</span><span>100</span></div><div className="chart-content"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><svg className="activity-chart" viewBox="0 0 600 180" preserveAspectRatio="none" role="img" aria-label="Illustrative task activity trend from April to October"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6753d7" stopOpacity=".17" /><stop offset="100%" stopColor="#6753d7" stopOpacity="0" /></linearGradient></defs><path className="chart-area" d="M0 137 C42 127 48 110 86 119 S136 143 171 106 S211 97 257 104 S314 79 343 88 S394 47 430 65 S483 77 515 42 S559 56 600 22 L600 180 L0 180Z" /><path className="chart-line" d="M0 137 C42 127 48 110 86 119 S136 143 171 106 S211 97 257 104 S314 79 343 88 S394 47 430 65 S483 77 515 42 S559 56 600 22" /></svg><div className="chart-x-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div></div></div>
        </article>
        <article className="panel members-panel">
          <div className="panel-heading"><div><h2>Up next</h2><p>Your team’s upcoming tasks</p></div><button className="more-button" aria-label="More task options"><Icon name="more" /></button></div>
          <div className="recent-members">{upcomingTasks.map((task) => <div className="recent-member" key={task.id}><span className={`task-mini-icon mini-${task.priority.toLowerCase()}`}><Icon name="checklist" size={15} /></span><span className="user-identity"><strong>{task.title}</strong><small>{task.assignee} · Due {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${task.dueDate}T00:00:00`))}</small></span><span className={`status-dot status-dot-${task.status.toLowerCase().replaceAll(' ', '-')}`} title={task.status} /></div>)}</div>
          <button className="view-all-link" onClick={onViewTasks}>View all tasks <span>→</span></button>
        </article>
      </div>

      <div className="dashboard-bottom">
        <article className="panel getting-started"><span className="getting-started-icon"><Icon name="checklist" size={20} /></span><div><h2>Make progress together</h2><p>Keep priorities clear and make every task count.</p></div><Button variant="secondary" onClick={onViewTasks}>Manage tasks</Button></article>
      </div>
      <footer className="page-footer"><span>© 2026 Taskflow</span><span>Make great things happen <span className="footer-spark">✦</span></span><button onClick={onViewTasks}>Help center</button></footer>
    </section>
  )
}

export default Dashboard
