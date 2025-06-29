import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CurrencyDollarIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';

const ExpenseTrackingTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();
    const [expense, setExpense] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
    });
    const [editingId, setEditingId] = useState(null);
    const categories = ['Food', 'Transportation', 'Accommodation', 'Entertainment', 'Other'];

    // Fetch expenses
    const { data: expenses = [] } = useQuery({
        queryKey: ['expenses', loggedUser?._id],
        queryFn: () => axiosPublic.get(`/expenses/${loggedUser._id}`).then(res => res.data),
        enabled: !!loggedUser?._id,
    });

    // Add/Update mutation with optimistic updates
    const mutation = useMutation({
        mutationFn: (expenseData) => {
            const method = expenseData._id ? 'patch' : 'post';
            const url = expenseData._id ? `/expenses/${expenseData._id}` : '/expenses';
            return axiosPublic[method](url, { ...expenseData, userId: loggedUser._id });
        },
        onMutate: async (newExpense) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries(['expenses', loggedUser._id]);

            // Snapshot the previous value
            const previousExpenses = queryClient.getQueryData(['expenses', loggedUser._id]);

            // Optimistically update to the new value
            if (newExpense._id) {
                // Update existing expense
                queryClient.setQueryData(['expenses', loggedUser._id], (old) =>
                    old.map(exp => exp._id === newExpense._id ? newExpense : exp)
                );
            } else {
                // Add new expense (we don't have ID yet, so we'll create a temporary one)
                const tempExpense = { ...newExpense, _id: Date.now().toString() };
                queryClient.setQueryData(['expenses', loggedUser._id], (old) =>
                    [...old, tempExpense]
                );
            }

            return { previousExpenses };
        },
        onError: (err, newExpense, context) => {
            // Rollback to previous state on error
            queryClient.setQueryData(['expenses', loggedUser._id], context.previousExpenses);
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries(['expenses', loggedUser._id]);
        }
    });

    // Delete mutation with optimistic updates
    const deleteMutation = useMutation({
        mutationFn: (id) => axiosPublic.delete(`/expenses/${id}`),
        onMutate: async (id) => {
            await queryClient.cancelQueries(['expenses', loggedUser._id]);
            const previousExpenses = queryClient.getQueryData(['expenses', loggedUser._id]);

            queryClient.setQueryData(['expenses', loggedUser._id], (old) =>
                old.filter(exp => exp._id !== id)
            );

            return { previousExpenses };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['expenses', loggedUser._id], context.previousExpenses);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['expenses', loggedUser._id]);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await mutation.mutateAsync(editingId ? { ...expense, _id: editingId } : expense);

            // Reset form
            setExpense({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
            setEditingId(null);

            // Show success message
            const Swal = (await import('sweetalert2')).default;
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Expense updated!' : 'Expense added!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    const handleDelete = async (id) => {
        const Swal = (await import('sweetalert2')).default;
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Your expense has been deleted.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    };

    const total = expenses.reduce((sum, e) => sum + +e.amount, 0);

    return (
        <div className="space-y-4 p-4">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-3">{editingId ? 'Edit' : 'Add'} Expense</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        type="text"
                        placeholder="Title"
                        value={expense.title}
                        onChange={(e) => setExpense({ ...expense, title: e.target.value })}
                        required
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={expense.amount}
                        onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                        required
                        className="p-2 border rounded"
                    />
                    <select
                        value={expense.category}
                        onChange={(e) => setExpense({ ...expense, category: e.target.value })}
                        className="p-2 border rounded"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
                        disabled={mutation.isLoading}
                    >
                        {mutation.isLoading ? (
                            'Processing...'
                        ) : (
                            <>
                                <PlusIcon className="w-4 h-4 mr-1" />
                                {editingId ? 'Update' : 'Add'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Summary */}
            <div className="bg-white p-4 rounded shadow flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                <h3 className="font-medium">Total: {total.toFixed(2)} TK</h3>
            </div>

            {/* List */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Title</th>
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(e => (
                            <tr key={e._id} className="border-t hover:bg-gray-50">
                                <td className="p-2">{e.title}</td>
                                <td className="p-2">{e.category}</td>
                                <td className="p-2">{e.amount} TK</td>
                                <td className="p-2">{e.date}</td>
                                <td className="p-2 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setExpense(e);
                                            setEditingId(e._id);
                                        }}
                                        className="text-blue-500 hover:text-blue-700"
                                        disabled={mutation.isLoading}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(e._id)}
                                        className="text-red-500 hover:text-red-700"
                                        disabled={deleteMutation.isLoading}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseTrackingTab;