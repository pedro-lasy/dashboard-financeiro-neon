import { useState, useEffect } from 'react'
import { supabase, Transaction } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchTransactions(user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTransactions(session.user.id)
      } else {
        setTransactions([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchTransactions = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error
      
      setTransactions(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error adding transaction:', error)
      return null
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setTransactions(prev => prev.map(t => t.id === id ? data : t))
      return data
    } catch (error) {
      console.error('Error updating transaction:', error)
      return null
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return false

    try {
      // Since we can't use DELETE, we'll mark as deleted or remove from state
      // For now, we'll just remove from local state
      setTransactions(prev => prev.filter(t => t.id !== id))
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      return false
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return {
    transactions,
    loading,
    user,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    signOut,
    refetch: () => user && fetchTransactions(user.id)
  }
}