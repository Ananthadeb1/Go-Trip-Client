import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CurrencyDollarIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ChartBarIcon,
    CalendarIcon,
    TagIcon,
    ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import useAuth from '../../../hooks/useAuth';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

const COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']; // Rose, Blue, Green, Amber, Violet

const ExpenseTrackingTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all');
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filterDate, setFilterDate] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'transportation',
        date: new Date(),
        type: 'expense'
    });

    // Fetch expenses
    const { data: expenses = [] } = useQuery({
        queryKey: ['expenses', loggedUser?.uid],
        queryFn: async () => {
            if (!loggedUser?.uid) return [];
            const res = await axiosPublic.get(`/expenses/${loggedUser.uid}`);
            return res.data;
        },
        enabled: !!loggedUser?.uid
    });

    // Fetch bookings
    const { data: bookings = [] } = useQuery({
        queryKey: ['bookings', loggedUser?.uid],
        queryFn: async () => {
            if (!loggedUser?.uid) return [];
            const res = await axiosPublic.get(`/bookings/${loggedUser.uid}`);
            return res.data;
        },
        enabled: !!loggedUser?.uid
    });
    console.log('Bookings:', bookings);

    // Combine and sort transactions
    const allTransactions = [
        ...bookings.map(booking => ({
            ...booking,
            id: booking._id,
            description: `${booking.type} booking`,
            amount: Number(booking.totalCost) || 0,
            date: new Date(booking.bookingTime),
            category: 'booking',
            type: 'expense',
            isBooking: true
        })),
        ...expenses.map(expense => ({
            ...expense,
            id: expense._id,
            amount: Number(expense.amount) || 0,
            date: new Date(expense.date),
            isBooking: false
        }))
    ].sort((a, b) => b.date - a.date);

    // Filter transactions
    const filteredTransactions = allTransactions.filter(transaction => {
        const matchesType = activeTab === 'all' || transaction.type === activeTab;
        const matchesDate = !filterDate ||
            transaction.date.toDateString() === filterDate.toDateString();
        const matchesCategory = filterCategory === 'all' ||
            transaction.category === filterCategory;
        return matchesType && matchesDate && matchesCategory;
    });

    // Calculate totals with null checks
    const totals = {
        expense: allTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
        income: allTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0),
        balance: allTransactions
            .reduce((sum, t) => t.type === 'income' ?
                sum + (t.amount || 0) :
                sum - (t.amount || 0), 0)
    };

    // Prepare chart data
    const categoryData = Object.entries(
        allTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + (t.amount || 0);
                return acc;
            }, {})
    ).map(([name, value]) => ({ name, value }));

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(i);
        const monthName = month.toLocaleString('default', { month: 'short' });
        const expenses = allTransactions
            .filter(t => t.type === 'expense' && t.date.getMonth() === i)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const income = allTransactions
            .filter(t => t.type === 'income' && t.date.getMonth() === i)
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        return { name: monthName, expenses, income };
    });

    // Mutation for adding/updating expenses
    const expenseMutation = useMutation({
        mutationFn: async (expenseData) => {
            if (editingExpense) {
                return await axiosPublic.patch(`/expenses/${editingExpense._id}`, expenseData);
            } else {
                return await axiosPublic.post('/expenses', expenseData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses', loggedUser?.uid]);
            resetForm();
        }
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(formData.amount);
        if (isNaN(amount)) {
            Swal.fire('Error', 'Please enter a valid amount', 'error');
            return;
        }

        const payload = {
            ...formData,
            amount,
            userId: loggedUser?.uid,
            date: formData.date.toISOString()
        };

        expenseMutation.mutate(payload);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            category: 'transportation',
            date: new Date(),
            type: 'expense'
        });
        setIsAddingExpense(false);
        setEditingExpense(null);
    };

    // Edit expense
    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            date: new Date(expense.date),
            type: expense.type
        });
        setIsAddingExpense(true);
    };

    // Delete expense
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axiosPublic.delete(`/expenses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses', loggedUser?.uid]);
        }
    });

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    // Categories
    const categories = [
        { value: 'transportation', label: 'Transportation' },
        { value: 'accommodation', label: 'Accommodation' },
        { value: 'food', label: 'Food & Dining' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'shopping', label: 'Shopping' },
        { value: 'booking', label: 'Bookings' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-semibold text-rose-600">
                                ${totals.expense.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-rose-50 rounded-full">
                            <ReceiptRefundIcon className="h-6 w-6 text-rose-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Income</p>
                            <p className="text-2xl font-semibold text-green-600">
                                ${totals.income.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Balance</p>
                            <p className={`text-2xl font-semibold ${totals.balance >= 0 ? 'text-green-600' : 'text-rose-600'
                                }`}>
                                ${Math.abs(totals.balance).toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-4">Expense Categories</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-4">Monthly Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                                <Legend />
                                <Bar dataKey="expenses" name="Expenses" fill="#e11d48" />
                                <Bar dataKey="income" name="Income" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1 text-sm rounded-md ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('expense')}
                        className={`px-3 py-1 text-sm rounded-md ${activeTab === 'expense' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('income')}
                        className={`px-3 py-1 text-sm rounded-md ${activeTab === 'income' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Income
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-40">
                        <DatePicker
                            selected={filterDate}
                            onChange={date => setFilterDate(date)}
                            placeholderText="Filter by date"
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                            isClearable
                        />
                        <CalendarIcon className="h-4 w-4 text-gray-400 absolute right-3 top-2.5" />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="flex-1 sm:w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setIsAddingExpense(true)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Transaction</span>
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {isAddingExpense && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-medium text-gray-800 mb-4">
                        {editingExpense ? 'Edit Transaction' : 'Add New Transaction'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                                        className={`flex-1 py-2 border rounded-md text-sm ${formData.type === 'expense' ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                                        className={`flex-1 py-2 border rounded-md text-sm ${formData.type === 'income' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="What was this for?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <DatePicker
                                    selected={formData.date}
                                    onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                disabled={expenseMutation.isLoading}
                            >
                                {expenseMutation.isLoading ? 'Saving...' : editingExpense ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'
                                                    }`}>
                                                    {transaction.isBooking ? (
                                                        <TagIcon className="h-4 w-4" />
                                                    ) : (
                                                        <CurrencyDollarIcon className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.description}
                                                    </div>
                                                    {transaction.isBooking && (
                                                        <div className="text-xs text-gray-500">
                                                            Booking ID: {transaction.id.slice(-8).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 capitalize">
                                                {transaction.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {transaction.date.toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-rose-600'
                                                }`}>
                                                {transaction.type === 'income' ? '+' : '-'}${(transaction.amount || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!transaction.isBooking && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(transaction)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="text-rose-600 hover:text-rose-900"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTrackingTab;