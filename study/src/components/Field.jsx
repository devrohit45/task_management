function Field({ label, id, hint, ...inputProps }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}

export default Field
