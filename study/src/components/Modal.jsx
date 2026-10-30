import { useEffect } from 'react'

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header"><div><p className="eyebrow">WORKSPACE ACCESS</p><h2 id="modal-title">{title}</h2></div><button className="modal-close" aria-label="Close dialog" onClick={onClose}>×</button></header>
        {children}
      </section>
    </div>
  )
}

export default Modal
