"use client"

import { useState, useEffect, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, PieChart, BarChart3, Eye, EyeOff, Trash2, Edit3, Sparkles, LogOut, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import { useTransactions } from '@/hooks/useTransactions'
import { Transaction } from '@/lib/supabase'
import AuthForm from '@/components/AuthForm'

const INCOME_CATEGORIES = [
  'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'
]

const EXPENSE_CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
  'Entretenimento', 'Compras', 'Contas', 'Investimentos', 'Outros'
]

const CATEGORY_COLORS = {
  'Salário': '#00FF88',
  'Freelance': '#00E5FF',
  'Investimentos': '#FFD700',
  'Vendas': '#FF6B6B',
  'Alimentação': '#FF8A65',
  'Transporte': '#64B5F6',
  'Moradia': '#81C784',
  'Saúde': '#F06292',
  'Educação': '#9575CD',
  'Entretenimento': '#FFB74D',
  'Compras': '#A1C181',
  'Contas': '#FF7043',
  'Outros': '#90A4AE'
}

export default function FinancialDashboard() {
  const { 
    transactions, 
    loading, 
    user, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    signOut 
  } = useTransactions()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Calculate totals
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      income,
      expenses,
      balance: income - expenses
    }
  }, [transactions])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const typeMatch = filterType === 'all' || transaction.type === filterType
      const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory
      const monthMatch = filterMonth === 'all' || transaction.date.startsWith(filterMonth)
      
      return typeMatch && categoryMatch && monthMatch
    })
  }, [transactions, filterType, filterCategory, filterMonth])

  // Prepare chart data
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {}
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount
      }
    })

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#90A4AE'
    }))
  }, [filteredTransactions])

  const monthlyData = useMemo(() => {
    const monthlyTotals: { [key: string]: { income: number, expenses: number } } = {}
    
    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7) // YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { income: 0, expenses: 0 }
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[month].income += transaction.amount
      } else {
        monthlyTotals[month].expenses += transaction.amount
      }
    })

    return Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receitas: data.income,
        gastos: data.expenses,
        saldo: data.income - data.expenses
      }))
  }, [transactions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category || !formData.description) {
      return
    }

    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date
    }

    let success = false

    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction.id, transactionData)
      success = !!result
      setEditingTransaction(null)
    } else {
      const result = await addTransaction(transactionData)
      success = !!result
    }

    if (success) {
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      
      setIsAddModalOpen(false)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    })
    setIsAddModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getAvailableMonths = () => {
    const months = [...new Set(transactions.map(t => t.date.substring(0, 7)))]
    return months.sort().reverse()
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#00FF88]/20 border-t-[#00FF88] rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Carregando suas finanças...</p>
        </div>
      </div>
    )
  }

  // Show auth form if no user
  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00FF88]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00FF88]/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#00FF88]/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-[#00FF88]/20">
                  <Sparkles className="w-6 h-6 text-[#00FF88]" />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Dashboard Financeiro
                </h1>
              </div>
              <p className="text-gray-400 text-base md:text-lg ml-14">Controle total das suas finanças com elegância</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={signOut}
                variant="outline"
                className="border-gray-600/50 text-white bg-gray-800/50 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm transition-all duration-300 px-4 py-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#00FF88] to-emerald-400 hover:from-[#00E57A] hover:to-emerald-300 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00FF88]/25 border-0 text-base">
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-slate-900 to-gray-900 border border-gray-700/50 text-white backdrop-blur-xl max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse"></div>
                      {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-200 font-medium">Tipo</Label>
                        <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData(prev => ({ ...prev, type: value, category: '' }))}>
                          <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-xl">
                            <SelectItem value="income" className="text-[#00FF88] hover:bg-[#00FF88]/10">Receita</SelectItem>
                            <SelectItem value="expense" className="text-red-400 hover:bg-red-400/10">Gasto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-gray-200 font-medium">Valor</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                          className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 focus:border-[#00FF88] transition-colors"
                          placeholder="0,00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-gray-200 font-medium">Categoria</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 transition-colors">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-xl">
                          {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(category => (
                            <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-200 font-medium">Descrição</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 focus:border-[#00FF88] transition-colors"
                        placeholder="Descrição da transação"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-gray-200 font-medium">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 focus:border-[#00FF88] transition-colors"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-[#00FF88] to-emerald-400 hover:from-[#00E57A] hover:to-emerald-300 text-black font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                        {editingTransaction ? 'Atualizar' : 'Adicionar'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsAddModalOpen(false)
                          setEditingTransaction(null)
                          setFormData({
                            type: 'expense',
                            amount: '',
                            category: '',
                            description: '',
                            date: new Date().toISOString().split('T')[0]
                          })
                        }}
                        className="border-gray-600/50 text-white bg-gray-800/50 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm transition-all duration-300"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 hover:border-[#00FF88]/30 transition-all duration-500 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00FF88]/10 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Saldo Total</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
                  >
                    {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                    <DollarSign className="h-4 w-4 text-[#00FF88]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold">
                  {balanceVisible ? (
                    <span className={`${totals.balance >= 0 ? 'text-[#00FF88]' : 'text-red-400'} transition-colors`}>
                      {formatCurrency(totals.balance)}
                    </span>
                  ) : (
                    <span className="text-gray-500">••••••</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 hover:border-[#00FF88]/30 transition-all duration-500 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00FF88]/10 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Receitas</CardTitle>
                <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-[#00FF88]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-[#00FF88]">
                  {formatCurrency(totals.income)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 hover:border-red-400/30 transition-all duration-500 backdrop-blur-xl hover:shadow-2xl hover:shadow-red-400/10 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Gastos</CardTitle>
                <div className="p-2 bg-red-400/10 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-red-400">
                  {formatCurrency(totals.expenses)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg text-white">
                <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                  <Filter className="h-5 w-5 text-[#00FF88]" />
                </div>
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-200 font-medium">Tipo</Label>
                  <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-xl">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">Todos</SelectItem>
                      <SelectItem value="income" className="text-[#00FF88] hover:bg-[#00FF88]/10">Receitas</SelectItem>
                      <SelectItem value="expense" className="text-red-400 hover:bg-red-400/10">Gastos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-200 font-medium">Categoria</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-xl">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">Todas</SelectItem>
                      {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((category, index) => (
                        <SelectItem key={`${category}-${index}`} value={category} className="text-white hover:bg-gray-700">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-200 font-medium">Mês</Label>
                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600/50 text-white backdrop-blur-sm hover:border-[#00FF88]/50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-xl">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">Todos</SelectItem>
                      {getAvailableMonths().map(month => (
                        <SelectItem key={month} value={month} className="text-white hover:bg-gray-700">
                          {new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Pie Chart - Gastos por Categoria */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00FF88]/5 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                    <PieChart className="h-5 w-5 text-[#00FF88]" />
                  </div>
                  Gastos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        className="text-sm font-medium"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Valor']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(55, 65, 81, 0.5)',
                          borderRadius: '12px',
                          color: '#fff',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex flex-col items-center justify-center text-gray-400 space-y-3">
                    <PieChart className="h-16 w-16 opacity-30" />
                    <p className="text-lg font-medium">Nenhum dado disponível</p>
                    <p className="text-sm text-center">Adicione algumas transações para visualizar os gráficos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart - Evolução Mensal */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00FF88]/5 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-[#00FF88]" />
                  </div>
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 65, 81, 0.3)" />
                      <XAxis dataKey="month" stroke="#D1D5DB" fontSize={12} />
                      <YAxis stroke="#D1D5DB" fontSize={12} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(55, 65, 81, 0.5)',
                          borderRadius: '12px',
                          color: '#fff',
                          backdropFilter: 'blur(12px)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                      />
                      <Bar dataKey="receitas" fill="#00FF88" name="Receitas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gastos" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex flex-col items-center justify-center text-gray-400 space-y-3">
                    <BarChart3 className="h-16 w-16 opacity-30" />
                    <p className="text-lg font-medium">Nenhum dado disponível</p>
                    <p className="text-sm text-center">Adicione algumas transações para visualizar os gráficos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-gray-900/80 border border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-[#00FF88]/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-[#00FF88]" />
                  </div>
                  Transações Recentes
                </span>
                <Badge variant="secondary" className="bg-gray-700/50 text-gray-200 border border-gray-600/50 backdrop-blur-sm px-3 py-1">
                  {filteredTransactions.length} transações
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-800/30 to-gray-800/20 rounded-xl border border-gray-700/30 hover:border-gray-600/50 hover:from-gray-800/50 hover:to-gray-800/30 transition-all duration-300 backdrop-blur-sm group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-[#00FF88]' : 'bg-red-400'} shadow-lg ${transaction.type === 'income' ? 'shadow-[#00FF88]/25' : 'shadow-red-400/25'}`} />
                          <div>
                            <p className="font-semibold text-white group-hover:text-gray-100 transition-colors">{transaction.description}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                              <span className="px-2 py-1 bg-gray-700/50 rounded-md text-xs font-medium">{transaction.category}</span>
                              <Separator orientation="vertical" className="h-3 bg-gray-600" />
                              <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`font-bold text-lg ${transaction.type === 'income' ? 'text-[#00FF88]' : 'text-red-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(transaction)}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/10 rounded-lg transition-all duration-300"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-16 text-gray-400 space-y-4">
                    <div className="p-4 bg-gray-800/30 rounded-full w-fit mx-auto">
                      <DollarSign className="h-16 w-16 opacity-30" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-gray-300">Nenhuma transação encontrada</p>
                      <p className="text-sm max-w-md mx-auto">Adicione sua primeira transação para começar a acompanhar suas finanças de forma inteligente</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 136, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 136, 0.5);
        }
      `}</style>
    </div>
  )
}