import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ChartBarIcon,
    XCircleIcon,
    BriefcaseIcon,
    PlusCircleIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/solid';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

// ---- dd/mm/yyyy <-> yyyy-mm-dd helpers ----
const isoToDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return '';
    return `${d}/${m}/${y}`;
};

// Date field: read-only display in dd/mm/yyyy, value only changes via the
// native calendar picker (click the text or the icon) — no manual typing.
// Stores/emits ISO (yyyy-mm-dd) so the rest of the app is unaffected.
// The calendar icon lives INSIDE the field's own border (not floating
// outside it), so the field reads as a single self-contained control at
// every breakpoint.
const DateInput = ({ value, onChange, required, className, placeholder }) => {
    const hiddenInputRef = useRef(null);

    const openPicker = () => {
        const input = hiddenInputRef.current;
        if (!input) return;
        if (typeof input.showPicker === 'function') input.showPicker();
        else input.click();
    };

    return (
        <div
            onClick={openPicker}
            className={`${className} flex items-center justify-between gap-2 cursor-pointer w-full`}
        >
            <input
                type="text"
                readOnly
                required={required}
                value={isoToDisplay(value)}
                placeholder={placeholder || 'dd/mm/yyyy'}
                className="w-full min-w-0 truncate bg-transparent outline-none border-none p-0 cursor-pointer"
                tabIndex={-1}
            />
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openPicker(); }}
                tabIndex={-1}
                className="shrink-0 text-gray-400 hover:text-rose-500"
            >
                <CalendarDaysIcon className="w-5 h-5" />
            </button>
            {/* Hidden native date input — its calendar UI is the only way to set a value */}
            <input
                ref={hiddenInputRef}
                type="date"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                tabIndex={-1}
                className="sr-only"
            />
        </div>
    );
};

// Shared field styling so every input/select/date field looks identical and
// scales cleanly across mobile, tablet and laptop widths.
const fieldClass =
    'w-full p-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none bg-white';

const ExpenseTrackingTab = () => {
    const { loggedUser } = useAuth();
    const axiosPublic = useAxiosPublic();
    const queryClient = useQueryClient();

    // ---- 1. Resolve the user's Mongo _id from their email ----
    // staleTime/gcTime are long on purpose: this mapping almost never
    // changes, and using the SAME query key ['user', email] that other
    // tabs (e.g. HistoryTab) use means whichever tab loads first "pays"
    // for this request once — every other tab reads it from cache for
    // free, with zero network round trips.
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['user', loggedUser?.email],
        queryFn: async () => (await axiosPublic.get(`/users/${loggedUser?.email}`)).data,
        enabled: !!loggedUser?.email,
        staleTime: 5 * 60 * 1000, // 5 min — don't refetch while the session is active
        gcTime: 30 * 60 * 1000,   // keep it cached across tab switches
    });

    const userId = userData?._id;

    // ---- 2. ONE query for everything: tours + their embedded expenses ----
    // No separate /bookings or /expenses fetch on load, and no client-side
    // merge/dedupe logic. Hotel tours are created server-side at booking time.
    const {
        data: tours = [],
        isLoading: toursLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['tours', userId],
        queryFn: async () => (await axiosPublic.get(`/tours/${userId}`)).data,
        enabled: !!userId,
        staleTime: 60 * 1000,     // avoid refetching on every tab switch
        gcTime: 30 * 60 * 1000,   // keep cached data around instead of dropping it
    });

    // ---- UI state ----
    const [expense, setExpense] = useState({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [selectedTour, setSelectedTour] = useState('all');
    const [showCreateTour, setShowCreateTour] = useState(false);
    const [editingTourId, setEditingTourId] = useState(null);
    const [tourForm, setTourForm] = useState({ name: '', location: '', startDate: '', endDate: '' });

    const categories = ['Food', 'Transportation', 'Accommodation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'];

    const categoryColors = {
        Food: 'bg-orange-100 text-orange-700 border-orange-200',
        Transportation: 'bg-blue-100 text-blue-700 border-blue-200',
        Accommodation: 'bg-purple-100 text-purple-700 border-purple-200',
        Entertainment: 'bg-pink-100 text-pink-700 border-pink-200',
        Shopping: 'bg-teal-100 text-teal-700 border-teal-200',
        Healthcare: 'bg-red-100 text-red-700 border-red-200',
        Education: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        Other: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    // Solid fill for the summary progress bars — same hue family as the
    // badge above it, so "Food" always reads orange end-to-end, etc.
    const categoryBarColors = {
        Food: 'bg-orange-500',
        Transportation: 'bg-blue-500',
        Accommodation: 'bg-purple-500',
        Entertainment: 'bg-pink-500',
        Shopping: 'bg-teal-500',
        Healthcare: 'bg-red-500',
        Education: 'bg-indigo-500',
        Other: 'bg-gray-500',
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}/${date.getFullYear()}`;
    };

    // ---- Tour dropdown list ("All" + real tours from the backend, already deduped) ----
    const tourOptions = useMemo(
        () => [{ _id: 'all', name: 'All Expenses', location: '', startDate: null, endDate: null, type: 'all' }, ...tours],
        [tours]
    );
    const selectedTourDetails = tourOptions.find((t) => t._id === selectedTour);

    // ---- Flatten expenses from tours (client-side, no extra request) ----
    const filteredExpenses = useMemo(() => {
        if (selectedTour === 'all') {
            return tours.flatMap((t) => (t.expenses || []).map((e) => ({ ...e, tourId: t._id })));
        }
        const tour = tours.find((t) => t._id === selectedTour);
        return (tour?.expenses || []).map((e) => ({ ...e, tourId: tour._id }));
    }, [tours, selectedTour]);

    const categorySpending = useMemo(() => {
        const spending = {};
        filteredExpenses.forEach((exp) => {
            const category = exp.category || 'Other';
            spending[category] = (spending[category] || 0) + parseFloat(exp.amount || 0);
        });
        return spending;
    }, [filteredExpenses]);

    const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const highestCategory = useMemo(() => {
        let max = 0, cat = 'None';
        Object.entries(categorySpending).forEach(([c, amt]) => { if (amt > max) { max = amt; cat = c; } });
        return cat;
    }, [categorySpending]);

    // ---- Tour mutations ----
    const tourMutation = useMutation({
        mutationFn: (tourData) => {
            const method = tourData._id ? 'patch' : 'post';
            const url = tourData._id ? `/tours/${tourData._id}` : '/tours';
            return axiosPublic[method](url, tourData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tours', userId]);
            setShowCreateTour(false);
            setEditingTourId(null);
            setTourForm({ name: '', location: '', startDate: '', endDate: '' });
            Swal.fire({ icon: 'success', title: editingTourId ? 'Tour Updated' : 'Tour Created', showConfirmButton: false, timer: 1500 });
        },
        onError: (error) => {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to save tour' });
        },
    });

    const deleteTourMutation = useMutation({
        mutationFn: (id) => axiosPublic.delete(`/tours/${id}`),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries(['tours', userId]);
            if (selectedTour === id) setSelectedTour('all');
            Swal.fire({ icon: 'success', title: 'Tour Deleted', showConfirmButton: false, timer: 1500 });
        },
        onError: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete tour' }),
    });

    // ---- Expense mutations ----
    const expenseMutation = useMutation({
        mutationFn: (expenseData) => {
            const method = expenseData._id ? 'patch' : 'post';
            const url = expenseData._id ? `/expenses/${expenseData._id}` : '/expenses';
            return axiosPublic[method](url, expenseData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tours', userId]);
        },
        onError: () => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save expense' });
        },
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: (id) => axiosPublic.delete(`/expenses/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['tours', userId]),
        onError: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete expense' }),
    });

    // ---- Handlers ----
    const getCategoryColor = (category) => categoryColors[category] || categoryColors.Other;
    const getCategoryBarColor = (category) => categoryBarColors[category] || categoryBarColors.Other;

    // Per-tour totals for the "All Expenses" list overview
    const tourTotals = useMemo(
        () =>
            tours.map((t) => {
                const exps = t.expenses || [];
                const tourTotal = exps.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                return { ...t, tourTotal, entryCount: exps.length };
            }),
        [tours]
    );

    const resetExpenseForm = () => {
        setExpense({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
        setEditingExpenseId(null);
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTour || selectedTour === 'all') {
            Swal.fire({ icon: 'warning', title: 'Tour Required', text: 'Please select a specific tour first', confirmButtonColor: '#e11d48' });
            return;
        }

        try {
            await expenseMutation.mutateAsync(
                editingExpenseId ? { ...expense, _id: editingExpenseId } : { ...expense, tourId: selectedTour }
            );
            resetExpenseForm();
            Swal.fire({ icon: 'success', title: editingExpenseId ? 'Updated' : 'Added', showConfirmButton: false, timer: 1500 });
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    const handleDeleteExpense = async (id) => {
        const result = await Swal.fire({
            title: 'Sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#e11d48', cancelButtonColor: '#6b7280', confirmButtonText: 'Delete',
        });
        if (result.isConfirmed) deleteExpenseMutation.mutate(id);
    };

    const handleTourSubmit = async (e) => {
        e.preventDefault();
        if (!tourForm.name.trim()) {
            Swal.fire({ icon: 'warning', title: 'Name Required' });
            return;
        }
        await tourMutation.mutateAsync(editingTourId ? { ...tourForm, _id: editingTourId } : tourForm);
    };

    const startEditTour = (tour) => {
        setEditingTourId(tour._id);
        setTourForm({
            name: tour.name || '',
            location: tour.location || '',
            startDate: tour.startDate ? tour.startDate.split?.('T')[0] || tour.startDate : '',
            endDate: tour.endDate ? tour.endDate.split?.('T')[0] || tour.endDate : '',
        });
        setShowCreateTour(true);
    };

    const handleDeleteTour = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this tour?', text: 'All its expenses will be deleted too.', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#e11d48', cancelButtonColor: '#6b7280', confirmButtonText: 'Delete',
        });
        if (result.isConfirmed) deleteTourMutation.mutate(id);
    };

    // ---- Loading / error states ----
    if (userLoading || toursLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
    );

    if (isError) return (
        <div className="text-center py-12 px-4">
            <XCircleIcon className="h-8 w-8 text-rose-600 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mt-2">Error Loading Tours</h3>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg">Retry</button>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Expense Tracking</h2>
                    <p className="text-sm text-gray-500">Track expenses by tour</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>List View</button>
                    <button onClick={() => setViewMode('summary')} className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'summary' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Summary View</button>
                </div>
            </div>

            {/* Tour Filter + Manage */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 shrink-0">
                        <BriefcaseIcon className="w-5 h-5 text-rose-500" />
                        <span className="font-medium text-gray-700">Tour:</span>
                    </div>
                    <select
                        value={selectedTour}
                        onChange={(e) => { setSelectedTour(e.target.value); resetExpenseForm(); }}
                        className={`${fieldClass} sm:flex-1`}
                    >
                        {tourOptions.map((tour) => (
                            <option key={tour._id} value={tour._id}>
                                {tour.name} {tour.location ? `(${tour.location})` : ''}
                                {tour.startDate ? ` - ${formatDate(tour.startDate)}` : ''}
                                {tour.type === 'custom' ? ' 📝' : tour.type === 'hotel' ? ' 🏨' : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => { setEditingTourId(null); setTourForm({ name: '', location: '', startDate: '', endDate: '' }); setShowCreateTour(!showCreateTour); }}
                        className="w-full sm:w-auto px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <PlusCircleIcon className="w-4 h-4" /> New Tour
                    </button>
                </div>

                {showCreateTour && (
                    <form onSubmit={handleTourSubmit} className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-3">{editingTourId ? 'Edit Tour' : 'Create New Tour'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <input type="text" placeholder="Tour Name *" value={tourForm.name} onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })} required className={fieldClass} />
                            <input type="text" placeholder="Location" value={tourForm.location} onChange={(e) => setTourForm({ ...tourForm, location: e.target.value })} className={fieldClass} />
                            <DateInput value={tourForm.startDate} onChange={(iso) => setTourForm({ ...tourForm, startDate: iso })} placeholder="Start (dd/mm/yyyy)" className={fieldClass} />
                            <DateInput value={tourForm.endDate} onChange={(iso) => setTourForm({ ...tourForm, endDate: iso })} placeholder="End (dd/mm/yyyy)" className={fieldClass} />
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700" disabled={tourMutation.isLoading}>
                                {tourMutation.isLoading ? 'Saving...' : editingTourId ? 'Update Tour' : 'Create Tour'}
                            </button>
                            <button type="button" onClick={() => { setShowCreateTour(false); setEditingTourId(null); }} className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                )}

                {selectedTour !== 'all' && selectedTourDetails && (
                    <div className="mt-3 text-sm text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span><span className="font-medium">📍 Location:</span> {selectedTourDetails.location || 'N/A'}</span>
                        {selectedTourDetails.startDate && <span><span className="font-medium">📅 Start:</span> {formatDate(selectedTourDetails.startDate)}</span>}
                        {selectedTourDetails.endDate && <span><span className="font-medium">📅 End:</span> {formatDate(selectedTourDetails.endDate)}</span>}
                        {selectedTourDetails.type === 'custom' && <span className="text-rose-500 font-medium">📝 Custom Tour</span>}
                        {selectedTourDetails.type === 'hotel' && <span className="text-blue-500 font-medium">🏨 Hotel Booking</span>}
                        <span className="font-medium">Total Expenses: BDT {total.toFixed(2)}</span>
                        <span className="flex items-center gap-1">
                            <button onClick={() => startEditTour(selectedTourDetails)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg" title="Edit tour"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteTour(selectedTourDetails._id)} className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg" title="Delete tour"><TrashIcon className="w-4 h-4" /></button>
                        </span>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-rose-500">
                    <p className="text-xs sm:text-sm text-gray-500">{selectedTour === 'all' ? 'Total All Expenses' : 'Tour Expenses'}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">BDT {total.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-blue-500">
                    <p className="text-xs sm:text-sm text-gray-500">Total Entries</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-green-500">
                    <p className="text-xs sm:text-sm text-gray-500">Highest Spending</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{highestCategory}</p>
                    <p className="text-xs sm:text-sm text-gray-500">BDT {categorySpending[highestCategory]?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-purple-500">
                    <p className="text-xs sm:text-sm text-gray-500">Total Tours</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{tours.length}</p>
                    <p className="text-xs text-gray-400">Active tours</p>
                </div>
            </div>

            {/* Add/Edit Expense Form */}
            <form onSubmit={handleExpenseSubmit} className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {editingExpenseId ? 'Edit' : 'Add New'} Expense
                    {selectedTour !== 'all' && selectedTourDetails && <span className="text-sm font-normal text-gray-500 ml-2">- {selectedTourDetails.name}</span>}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <input type="text" placeholder="Title" value={expense.title} onChange={(e) => setExpense({ ...expense, title: e.target.value })} required className={fieldClass} />
                    <input type="number" placeholder="Amount (BDT)" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} required min="0" step="0.01" className={fieldClass} />
                    <select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })} className={fieldClass}>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <DateInput value={expense.date} onChange={(iso) => setExpense({ ...expense, date: iso })} required className={fieldClass} />
                    <button type="submit" className={`p-2.5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 sm:col-span-2 lg:col-span-1 ${selectedTour === 'all' ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white'}`} disabled={expenseMutation.isLoading || selectedTour === 'all'}>
                        {expenseMutation.isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <><PlusIcon className="w-5 h-5 mr-1" />{editingExpenseId ? 'Update' : 'Add'}</>}
                    </button>
                </div>
                {selectedTour === 'all' && <div className="mt-2 text-amber-600 text-sm">⚠️ Select a specific tour first</div>}
                {editingExpenseId && <button type="button" onClick={resetExpenseForm} className="mt-2 text-sm text-gray-500 hover:text-gray-700">Cancel Edit</button>}
            </form>

            {/* Summary / List View */}
            {viewMode === 'summary' ? (
                <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center flex-wrap gap-x-2">
                        <span className="flex items-center"><ChartBarIcon className="w-5 h-5 mr-2 text-rose-500" /> Spending by Category</span>
                        {selectedTour !== 'all' && selectedTourDetails && <span className="text-sm font-normal text-gray-500">- {selectedTourDetails.name}</span>}
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(categorySpending).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
                            const percentage = total > 0 ? (amount / total * 100) : 0;
                            return (
                                <div key={category} className="space-y-1">
                                    <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getCategoryColor(category)}`}>{category}</span>
                                            <span className="text-sm text-gray-500 truncate">BDT {amount.toFixed(2)}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5"><div className={`h-2.5 rounded-full transition-all ${getCategoryBarColor(category)}`} style={{ width: `${percentage}%` }} /></div>
                                </div>
                            );
                        })}
                        {Object.keys(categorySpending).length === 0 && <p className="text-gray-500 text-center py-8">No expenses</p>}
                        {selectedTour !== 'all' && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between"><span className="font-medium">Total</span><span className="text-xl font-bold text-rose-600">BDT {total.toFixed(2)}</span></div>
                            </div>
                        )}
                    </div>
                </div>
            ) : selectedTour === 'all' ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Tour</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Location</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Dates</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Entries</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Total Cost</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tourTotals.length > 0 ? tourTotals.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTour(t._id)}>
                                        <td className="p-3 text-gray-800 font-medium">
                                            {t.name} {t.type === 'custom' ? '📝' : t.type === 'hotel' ? '🏨' : ''}
                                        </td>
                                        <td className="p-3 text-gray-600">{t.location || 'N/A'}</td>
                                        <td className="p-3 text-gray-600 text-sm whitespace-nowrap">
                                            {t.startDate ? formatDate(t.startDate) : 'N/A'}{t.endDate ? ` - ${formatDate(t.endDate)}` : ''}
                                        </td>
                                        <td className="p-3 text-gray-600">{t.entryCount}</td>
                                        <td className="p-3 text-gray-900 font-semibold whitespace-nowrap">BDT {t.tourTotal.toFixed(2)}</td>
                                        <td className="p-3">
                                            <div className="flex space-x-2" onClick={(ev) => ev.stopPropagation()}>
                                                <button onClick={() => startEditTour(t)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteTour(t._id)} className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No tours yet — create one above</td></tr>
                                )}
                            </tbody>
                            {tourTotals.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 border-t">
                                        <td className="p-3 font-semibold text-gray-700" colSpan={4}>Grand Total</td>
                                        <td className="p-3 font-bold text-rose-600 whitespace-nowrap">BDT {total.toFixed(2)}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full min-w-[560px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Title</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Amount</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length > 0 ? filteredExpenses.map((e) => (
                                    <tr key={e._id} className="hover:bg-gray-50">
                                        <td className="p-3 text-gray-800 font-medium">{e.title}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(e.category)}`}>{e.category}</span></td>
                                        <td className="p-3 text-gray-800 font-medium whitespace-nowrap">BDT {parseFloat(e.amount).toFixed(2)}</td>
                                        <td className="p-3 text-gray-600 whitespace-nowrap">{formatDate(e.date)}</td>
                                        <td className="p-3">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => { setExpense({ title: e.title, amount: e.amount, category: e.category, date: e.date }); setEditingExpenseId(e._id); }}
                                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                                                ><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteExpense(e._id)} className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No expenses for this tour</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTrackingTab;