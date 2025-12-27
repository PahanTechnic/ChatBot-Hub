import { supabase } from './supabase'

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session?.user || null
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      return { error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in signOut:', error)
    return { error }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('Error in signInWithEmail:', error)
    return { error }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signUpWithEmail(email: string, password: string, userData?: any) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })

    if (error) {
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('Error in signUpWithEmail:', error)
    return { error }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session)
  })
}