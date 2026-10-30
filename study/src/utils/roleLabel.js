const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
}

export default function roleLabel(role) {
  return roleLabels[role] ?? role
}
