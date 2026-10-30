import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const LOGIN_ENDPOINT = 'http://127.0.0.1:9000/api/login'
const PROFILE_ENDPOINT = 'http://127.0.0.1:9000/api/profile'
const SESSION_KEY = 'PROMOTION KART-account-session'

function getSavedSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (!saved) return null

    const session = JSON.parse(saved)
    const { account, token } = session ?? {}
    if (
      !account ||
      typeof account.name !== 'string' ||
      typeof account.email !== 'string' ||
      typeof account.role !== 'string' ||
      typeof account.initials !== 'string' ||
      typeof token !== 'string'
    ) {
      throw new Error('Saved account session has an invalid format.')
    }

    return { account, token }
  } catch (error) {
    console.error('Unable to restore the saved account session:', error)
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch (cleanupError) {
      console.error('Unable to clear the invalid account session:', cleanupError)
    }
    return null
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    let response
    try {
      response = await fetch(LOGIN_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ email: email.trim(), password }).toString(),
      })
    } catch (error) {
      console.error('Unable to reach the login service:', error)
      return rejectWithValue('Unable to reach the login service. Please try again.')
    }

    let result
    try {
      result = await response.json()
    } catch (error) {
      console.error('The login service returned an invalid response:', error)
      return rejectWithValue('The login service returned an invalid response. Please try again.')
    }

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      console.error('The login service returned an invalid response:', result)
      return rejectWithValue('The login service returned an invalid response. Please try again.')
    }

    if (!response.ok || result.status !== true) {
      return rejectWithValue(
        typeof result.message === 'string'
          ? result.message
          : 'Sign-in failed. Check your email and password.',
      )
    }

    const user = result.user
    if (
      !user ||
      typeof user.name !== 'string' ||
      !user.name.trim() ||
      typeof user.email !== 'string' ||
      typeof user.role !== 'string' ||
      typeof result.token !== 'string' ||
      !result.token
    ) {
      console.error('The login service returned incomplete account information:', result)
      return rejectWithValue('The login service returned incomplete account information.')
    }

    const account = {
      ...user,
      initials: user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join(''),
    }
    const session = { account, token: result.token }

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (error) {
      console.error('Unable to save the account session:', error)
      return rejectWithValue('Sign-in succeeded, but this browser could not save the session.')
    }

    return session
  },
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email }, { getState, rejectWithValue }) => {
    const { token, account } = getState().auth
    if (!token || !account) {
      return rejectWithValue('Your session has expired. Please sign in again.')
    }

    let response
    try {
      response = await fetch(PROFILE_ENDPOINT, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
    } catch (error) {
      console.error('Unable to reach the profile service:', error)
      return rejectWithValue('Unable to reach the profile service. Please try again.')
    }

    let result
    try {
      result = await response.json()
    } catch (error) {
      console.error('The profile service returned an invalid response:', error)
      return rejectWithValue('The profile service returned an invalid response. Please try again.')
    }

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      console.error('The profile service returned an invalid response:', result)
      return rejectWithValue('The profile service returned an invalid response. Please try again.')
    }

    if (!response.ok || result.status !== true) {
      return rejectWithValue(
        typeof result.message === 'string'
          ? result.message
          : 'Unable to update your profile. Please try again.',
      )
    }

    const user = result.user
    if (
      !user ||
      typeof user.name !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.role !== 'string'
    ) {
      console.error('The profile service returned incomplete account information:', result)
      return rejectWithValue('The profile service returned incomplete account information.')
    }

    const updatedAccount = {
      ...account,
      ...user,
      initials: user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join(''),
    }

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ account: updatedAccount, token }))
    } catch (error) {
      console.error('Unable to save the updated account session:', error)
    }

    return updatedAccount
  },
)

const savedSession = getSavedSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    account: savedSession?.account ?? null,
    token: savedSession?.token ?? null,
    status: 'idle',
    error: null,
    profileStatus: 'idle',
    profileError: null,
  },
  reducers: {
    loggedOut(state) {
      state.account = null
      state.token = null
      state.status = 'idle'
      state.error = null
      state.profileStatus = 'idle'
      state.profileError = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.account = action.payload.account
        state.token = action.payload.token
        state.status = 'succeeded'
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Sign-in failed.'
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = 'loading'
        state.profileError = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.account = action.payload
        state.profileStatus = 'succeeded'
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = 'failed'
        state.profileError = action.payload ?? action.error.message ?? 'Unable to update your profile.'
      })
  },
})

export const logout = () => async (dispatch, getState) => {
  const token = getState().auth.token
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Unable to clear the saved account session:', error)
  }
  dispatch(authSlice.actions.loggedOut())

  if (!token) return

  try {
    const response = await fetch('http://127.0.0.1:9000/api/logout', {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      console.error('The API could not revoke the current session:', response.status)
    }
  } catch (error) {
    console.error('Unable to reach the logout service:', error)
  }
}

export default authSlice.reducer
