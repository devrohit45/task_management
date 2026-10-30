import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const API_URL = 'http://127.0.0.1:9000/api'

async function request(path, token, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    console.error(`Unable to reach the API for ${path}:`, error)
    throw new Error('Unable to reach the server. Please try again.', { cause: error })
  }

  let result
  try {
    result = await response.json()
  } catch (error) {
    console.error(`The API returned an invalid response for ${path}:`, error)
    throw new Error('The server returned an invalid response. Please try again.', { cause: error })
  }

  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    console.error(`The API returned an invalid response for ${path}:`, result)
    throw new Error('The server returned an invalid response. Please try again.')
  }

  if (!response.ok || result.status !== true) {
    throw new Error(result.message || 'The request could not be completed.')
  }

  return result
}

function requestFailed(error, rejectWithValue) {
  return rejectWithValue(error instanceof Error ? error.message : 'The request could not be completed.')
}

function taskPayload(values) {
  return {
    project_id: values.projectId ? Number(values.projectId) : null,
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    priority: values.priority,
    due_date: values.dueDate,
    assignee_id: values.assigneeId ? Number(values.assigneeId) : null,
  }
}

function projectPayload(values) {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    status: values.status,
    due_date: values.dueDate || null,
    assigned_to_id: values.assignedToId ? Number(values.assignedToId) : null,
  }
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const result = await request('/tasks', getState().auth.token)
      if (!Array.isArray(result.tasks)) throw new Error('The server returned an invalid task list.')
      return result.tasks
    } catch (error) {
      console.error('Unable to load tasks:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const fetchUsers = createAsyncThunk(
  'tasks/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const result = await request('/users', getState().auth.token)
      if (!Array.isArray(result.users)) throw new Error('The server returned an invalid user list.')
      return result.users
    } catch (error) {
      console.error('Unable to load task assignees:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const createEmployee = createAsyncThunk(
  'tasks/createEmployee',
  async (values, { getState, rejectWithValue }) => {
    try {
      const result = await request('/users', getState().auth.token, {
        method: 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          role: values.role,
        }),
      })
      if (!result.user) throw new Error('The server did not return the created employee.')
      return result.user
    } catch (error) {
      console.error('Unable to create employee account:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const updateEmployee = createAsyncThunk(
  'tasks/updateEmployee',
  async ({ id, values }, { getState, rejectWithValue }) => {
    try {
      const result = await request(`/users/${id}`, getState().auth.token, {
        method: 'PUT',
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
        }),
      })
      if (!result.user) throw new Error('The server did not return the updated team member.')
      return result.user
    } catch (error) {
      console.error('Unable to update team member:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const fetchProjects = createAsyncThunk(
  'tasks/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const result = await request('/projects', getState().auth.token)
      if (!Array.isArray(result.projects)) throw new Error('The server returned an invalid project list.')
      return result.projects
    } catch (error) {
      console.error('Unable to load projects:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const fetchProjectOptions = createAsyncThunk(
  'tasks/fetchProjectOptions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const result = await request('/projects/options', getState().auth.token)
      if (!Array.isArray(result.projects)) throw new Error('The server returned an invalid project list.')
      return result.projects
    } catch (error) {
      console.error('Unable to load task project options:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const createProject = createAsyncThunk(
  'tasks/createProject',
  async (values, { getState, rejectWithValue }) => {
    try {
      const result = await request('/projects', getState().auth.token, {
        method: 'POST',
        body: JSON.stringify(projectPayload(values)),
      })
      if (!result.project) throw new Error('The server did not return the created project.')
      return result.project
    } catch (error) {
      console.error('Unable to create project:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const updateProject = createAsyncThunk(
  'tasks/updateProject',
  async ({ id, values }, { getState, rejectWithValue }) => {
    try {
      const result = await request(`/projects/${id}`, getState().auth.token, {
        method: 'PUT',
        body: JSON.stringify(projectPayload(values)),
      })
      if (!result.project) throw new Error('The server did not return the updated project.')
      return result.project
    } catch (error) {
      console.error('Unable to update project:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const deleteProject = createAsyncThunk(
  'tasks/deleteProject',
  async (id, { getState, rejectWithValue }) => {
    try {
      await request(`/projects/${id}`, getState().auth.token, { method: 'DELETE' })
      return id
    } catch (error) {
      console.error('Unable to delete project:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (values, { getState, rejectWithValue }) => {
    try {
      const result = await request('/tasks', getState().auth.token, {
        method: 'POST',
        body: JSON.stringify(taskPayload(values)),
      })
      if (!result.task) throw new Error('The server did not return the created task.')
      return result.task
    } catch (error) {
      console.error('Unable to create task:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, values }, { getState, rejectWithValue }) => {
    try {
      const result = await request(`/tasks/${id}`, getState().auth.token, {
        method: 'PUT',
        body: JSON.stringify(taskPayload(values)),
      })
      if (!result.task) throw new Error('The server did not return the updated task.')
      return result.task
    } catch (error) {
      console.error('Unable to update task:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { getState, rejectWithValue }) => {
    try {
      await request(`/tasks/${id}`, getState().auth.token, { method: 'DELETE' })
      return id
    } catch (error) {
      console.error('Unable to delete task:', error)
      return requestFailed(error, rejectWithValue)
    }
  },
)

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    projects: [],
    projectOptions: [],
    users: [],
    status: 'idle',
    projectsStatus: 'idle',
    projectOptionsStatus: 'idle',
    usersStatus: 'idle',
    mutationStatus: 'idle',
    error: null,
  },
  reducers: {
    clearTaskData(state) {
      state.items = []
      state.projects = []
      state.projectOptions = []
      state.users = []
      state.status = 'idle'
      state.projectsStatus = 'idle'
      state.projectOptionsStatus = 'idle'
      state.usersStatus = 'idle'
      state.mutationStatus = 'idle'
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchUsers.pending, (state) => {
        state.usersStatus = 'loading'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
        state.usersStatus = 'succeeded'
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(createEmployee.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.users.push(action.payload)
        state.mutationStatus = 'succeeded'
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(updateEmployee.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const updatedUser = action.payload
        state.users = state.users.map((user) => user.id === updatedUser.id ? updatedUser : user)
        state.projects = state.projects.map((project) => ({
          ...project,
          ...(project.assignedToId === updatedUser.id ? { assignee: updatedUser.name } : {}),
          ...(project.createdById === updatedUser.id ? { createdBy: updatedUser.name } : {}),
        }))
        state.items = state.items.map((task) => ({
          ...task,
          ...(task.assigneeId === updatedUser.id ? { assignee: updatedUser.name } : {}),
          ...(task.createdById === updatedUser.id ? { createdBy: updatedUser.name } : {}),
        }))
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchProjects.pending, (state) => {
        state.projectsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload
        state.projectsStatus = 'succeeded'
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.projectsStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchProjectOptions.pending, (state) => {
        state.projectOptionsStatus = 'loading'
      })
      .addCase(fetchProjectOptions.fulfilled, (state, action) => {
        state.projectOptions = action.payload
        state.projectOptionsStatus = 'succeeded'
      })
      .addCase(fetchProjectOptions.rejected, (state, action) => {
        state.projectOptionsStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(createProject.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload)
        if (action.payload.status !== 'Completed') state.projectOptions.push(action.payload)
        state.mutationStatus = 'succeeded'
      })
      .addCase(createProject.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(updateProject.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.projects = state.projects.map((project) => project.id === action.payload.id ? action.payload : project)
        state.projectOptions = state.projectOptions
          .filter((project) => project.id !== action.payload.id || action.payload.status !== 'Completed')
          .map((project) => project.id === action.payload.id ? action.payload : project)
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(deleteProject.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((project) => project.id !== action.payload)
        state.projectOptions = state.projectOptions.filter((project) => project.id !== action.payload)
        state.mutationStatus = 'succeeded'
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(createTask.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.projects = state.projects.map((project) => project.id === action.payload.projectId
          ? { ...project, taskCount: project.taskCount + 1 }
          : project)
        state.mutationStatus = 'succeeded'
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(updateTask.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const previousTask = state.items.find((task) => task.id === action.payload.id)
        if (previousTask?.projectId !== action.payload.projectId) {
          state.projects = state.projects.map((project) => {
            if (project.id === previousTask?.projectId) return { ...project, taskCount: Math.max(0, project.taskCount - 1) }
            if (project.id === action.payload.projectId) return { ...project, taskCount: project.taskCount + 1 }
            return project
          })
        }
        state.items = state.items.map((task) => task.id === action.payload.id ? action.payload : task)
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(deleteTask.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const deletedTask = state.items.find((task) => task.id === action.payload)
        state.projects = state.projects.map((project) => project.id === deletedTask?.projectId
          ? { ...project, taskCount: Math.max(0, project.taskCount - 1) }
          : project)
        state.items = state.items.filter((task) => task.id !== action.payload)
        state.mutationStatus = 'succeeded'
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.payload ?? action.error.message
      })
  },
})

export const { clearTaskData } = tasksSlice.actions
export default tasksSlice.reducer
