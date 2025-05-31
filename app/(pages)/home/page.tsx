"use client";
import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, CircularProgress, IconButton, ListSubheader, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { YTextField } from '@/app/components/FormComponents';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import IncompleteCircleIcon from '@mui/icons-material/IncompleteCircle';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { isBeforeToday } from '@/app/utilities/compareHelper';
import AddEditTodoPage from '@/app/pageControls/AddEditTodoPage';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { usePushSubscription } from '@/app/hooks/usePushSubscription';
import Switch from '@mui/material/Switch';
import dayjs from 'dayjs';

const theme = createTheme({
    typography: {
        //Inherite the font from the parent element set by tailwindcss  
        fontFamily: 'inherit',
    },
});

function initSW() {
    if (typeof window === 'undefined') return; // Ensure this runs only in the browser

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    } else {
        console.error('Service Worker is not supported in this browser.');
    }
}

initSW();

export default function TodolistPage() {
    const [serchValue, setSerchValue] = useState("");
    const [toDos, setToDos] = useState<Array<any>>([]);
    const [filteredToDos, setfilteredToDos] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<{ summary: string; dueDate: string; category: string; status: string; }>();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [todoIdToDelete, setTodoIdToDelete] = useState<number | null>(null);
    const [editingDateId, setEditingDateId] = useState<number | null>(null);
    const [editingDateValue, setEditingDateValue] = useState<string>("");

    const { subscribed, notifLoading, handleSubscribe } = usePushSubscription();

    const listRef = React.useRef<HTMLDivElement>(null);
    const dateInputRef = React.useRef<HTMLInputElement>(null!);

    //computed properties
    const upcomingToDos = (() => {
        return toDos.filter(item => new Date(item.due_date) >= new Date() && item.status != 'completed');
    });
    const pastAndDoneTodos = (() => {
        return toDos.filter(item => new Date(item.due_date) < new Date() || item.status == 'completed');
    });

    /* handlers */
    const handleSaveTodoClick = async (todo: any) => {
        await saveTodo(todo);
        await fetchTodos();

        setDialogOpen(false);
        setDialogData(undefined);
    };

    const handleShowDeleteDialog = (todoId: number) => {
        setTodoIdToDelete(todoId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (todoIdToDelete == null) return;
        try {
            const response = await fetch('/api/todos', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: todoIdToDelete }),
            });
            if (!response.ok) {
                throw new Error('Failed to delete to-do');
            }
            // Refresh the to-do list
            const event = new CustomEvent('refresh-todos');
            window.dispatchEvent(event);
        } catch (error) {
            alert('Error deleting to-do');
            console.error('Error deleting to-do:', error);
        } finally {
            setDeleteDialogOpen(false);
            setTodoIdToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setTodoIdToDelete(null);
    };

    const handleEditTodo = (todo: any) => {
        const newData = { id: todo.id, summary: todo.summary, category: todo.category, dueDate: todo.due_date, status: todo.status };
        setDialogData(newData);
    };

    const handleCloseDialog = () => {
        setDialogData(undefined);
        setDialogOpen(false); 
    };

    const handleInlineDateEdit = async (todoId: number, newDate: string) => {
        try {
            const todo = toDos.find(t => t.id === todoId);
            if (!todo) return;
            console.log(newDate)
            if (newDate == dayjs(todo.due_date).format('YYYY-MM-DD')) {
                setEditingDateId(null);
                return;
            }  

            todo.dueDate = newDate;
            await saveTodo(todo);

            await fetchTodos();
            setEditingDateId(null);
        } catch (error) {
            console.error('Error updating due date:', error);
            alert('Failed to update due date');
        }
    };

    const handleDateClick = (e: React.MouseEvent, todoId: number, currentDate: string) => {
        e.stopPropagation();
        const todo = toDos.find(t => t.id === todoId);
        if (todo?.status === 'completed') return;

        setEditingDateValue(dayjs(currentDate).format('YYYY-MM-DD'));
        setEditingDateId(todoId);
        
        setTimeout(() => dateInputRef.current?.showPicker(), 50);
    };

    /* useEffect hook */
    useEffect(() => {
        if (dialogData) {
            setDialogOpen(true);
        }
    }, [dialogData]);

    useEffect(() => {
        fetchTodos();
    }, []);

    useEffect(() => {
        const lowercased = serchValue.toLowerCase();

        const newList = toDos.filter(item =>
            (item.summary.toLowerCase().includes(lowercased) || item.category_name.toLowerCase().includes(lowercased))
        );
        setfilteredToDos(newList);
    }, [serchValue, toDos]);

    useEffect(() => {
        if (filteredToDos.length === 0 || !listRef.current) return;

        const pastTodos = pastAndDoneTodos();

        if (pastTodos.length > 2) {
            const listNode = listRef.current;
            const itemNodes = listNode.querySelectorAll('.todo-list-item');
            if (itemNodes[pastTodos.length - 2]) {
                (itemNodes[pastTodos.length - 2] as HTMLDivElement).scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, [filteredToDos]);

    /* private functions */
    function fetchTodos() {
        fetch('/api/todos')
            .then((res) => res.json())
            .then((data) => {
                var todos = data.data;
                setLoading(false);
                // Move completed to-dos to the top, then order by due date within each group
                var orderedTodos = todos.sort((a: any, b: any) => {
                    if (a.status === 'completed' && b.status !== 'completed') return -1;
                    if (a.status !== 'completed' && b.status === 'completed') return 1;
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                });
                setToDos(orderedTodos);
            });
    }

    const saveTodo = async (todo: any) => {
        try {
            const method = todo.id ? 'PUT' : 'POST';
            const url = '/api/todos';
            const payload = todo.id ? { ...todo, id: todo.id } : todo;
            console.log(payload)
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`Failed to ${method} to-do`);
            return await response.json();
        } catch (error) {
            console.error(`Error saving to-do:`, error);
            throw error;
        }
    };

    return (
        <ThemeProvider theme={theme}>

            {/* Main content with top padding to avoid overlap */}
            <div id='backgroundContainer' className='flex min-h-screen w-screen bg-[rgb(245,245,245)] text-gray-800 font-sans'>

                <div className="fixed w-full h-13 bg-secondary text-white flex items-center px-6 shadow z-50">
                    <div className="font-bold text-lg tracking-wide flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                        To-Do Reminder
                    </div>
                    <div className="text-sm font-medium">
                        {/* Optionally show user email if available in localStorage/cookie */}
                        {typeof window !== 'undefined' && (localStorage.getItem('user_email') || '')}
                    </div>
                </div>

                <div id='contentContainer' className='w-4/5 mx-auto mt-8 min-max-[calc(100vh-48px)]'>

                    <div id='header' className='flex w-auto h-22 p-1 mb-6 items-end'>
                        <div className='flex items-center'>
                            <p className='text-xl md:text-4xl'>To-Dos</p>
                            <div className='ml-5'>
                                <Button color='secondary' size='medium' variant="contained" onClick={() => setDialogOpen(true)}>Add a To-do</Button>
                            </div>
                            <div className='ml-5'>
                                <YTextField
                                    placeholder="Search"
                                    value={serchValue}
                                    onChange={(e) => setSerchValue(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className='flex ml-auto items-center'>
                            {/* Push notification subscription switch */}
                            <Switch
                                checked={subscribed}
                                onChange={handleSubscribe}
                                color="secondary"
                                disabled={notifLoading}
                            />
                            <span className='ml-2 text-sm'>Push Notifications</span>
                            {notifLoading && <CircularProgress size={18} color='secondary' className='ml-2' />}
                        </div>
                        <div className='ml-5'>
                            <Button
                                color='secondary'
                                size='medium'
                                variant='outlined'
                                className='ml-6'
                                onClick={async () => {
                                    await fetch('/api/logout', { method: 'POST' });
                                    window.location.href = '/login';
                                }}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>

                    <div id='content' className='min-h-30 border-gray-300 text-[12px] xl:text-[14px]'>

                        <ListItem key='0' className='h-12 bg-[rgb(235,237,242)] rounded-t-lg border-1 border-b-0 border-gray-300 !text-gray-900'>
                            <p className='w-1/6 md:w-1/6 lg:w-1/8'>Due Date</p>
                            <p className='w-1/5 xl:w-1/8'>Status</p>
                            <p className='w-1/8 md:w-1/10'>Category</p>
                            <p className='w-1/2 2xl:w-2/5'>Summary</p>
                            <div className="w-1/10 flex ml-auto justify-center">
                                <p>Actions</p>
                            </div>
                        </ListItem>

                        <List ref={listRef} disablePadding component="nav"
                            sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
                            className='bg-white border-b-[1px] border-x-1 rounded-b-lg border-gray-300'>
                            {filteredToDos.map((item) => (
                                <div key={item.id}>
                                    {upcomingToDos().length > 0 && upcomingToDos()[0].id == item.id &&
                                        <ListSubheader className='border-gray-300 !text-gray-800 border-t-[1px] !bg-gray-50'>Upcoming To-Do Items</ListSubheader>}
                                    <Divider className='border-gray-300' />
                                    <ListItem disablePadding className='h-13 border-gray-300 font-light'>
                                        <ListItemButton className='h-full todo-list-item flex flex-wrap' onClick={() => handleEditTodo(item)}>
                                            <div className='w-1/3 md:w-1/6 lg:w-1/8'>
                                                {editingDateId === item.id ? (
                                                    <YTextField
                                                        type="date"
                                                        ref={dateInputRef as React.RefObject<HTMLInputElement>}
                                                        value={dayjs(editingDateValue).format('YYYY-MM-DD')}
                                                        onChange={(e) => setEditingDateValue(e.target.value)}
                                                        onBlur={() => handleInlineDateEdit(item.id, editingDateValue)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleInlineDateEdit(item.id, editingDateValue);
                                                            }
                                                        }}
                                                        className="!h-8 !w-3/4 !px-2 !text-[13px] border border-gray-300 rounded focus:outline-secondary focus:border-secondary transition-all"
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={(e) => handleDateClick(e, item.id, item.due_date)}
                                                        className="hover:text-secondary w-full h-8 flex items-center"
                                                    >
                                                        <span className="w-22 mt-[1px] hover:text-secondary">{dayjs(item.due_date).format('YYYY/MM/DD')}</span>
                                                        {item.status != 'completed' && 
                                                        <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>}
                                                    </div>
                                                )}
                                            </div>
                                            <ListItemIcon className='w-1/3 md:w-1/5 xl:w-1/8 text-[12px]'>
                                                {item.status === 'completed' &&
                                                    <div className='flex'><CheckCircleOutlineRoundedIcon className="text-green-500" />
                                                        <p className='ml-2 mt-1'>Completed</p>
                                                    </div>}
                                                {item.status === 'inprogress' && !isBeforeToday(item.due_date) &&
                                                    <div className='flex'><IncompleteCircleIcon className="text-yellow-500" />
                                                        <p className='ml-2 mt-1'>In Progress</p>
                                                    </div>}
                                                {item.status === 'notstarted' && !isBeforeToday(item.due_date) &&
                                                    <div className='flex'><ChecklistIcon className="text-gray-500" />
                                                        <p className='ml-2 mt-1'>Not Started</p>
                                                    </div>}
                                                {item.status !== 'completed' && isBeforeToday(item.due_date) &&
                                                    <div className='flex'><ErrorOutlineRoundedIcon className="text-red-500" />
                                                        <p className='ml-2 mt-1'>In Progress</p>
                                                    </div>}
                                            </ListItemIcon>
                                            <p className='w-1/3 md:w-1/10'>{item.category_name}</p>
                                            <p className='w-1/2 2xl:w-2/5'>{item.summary}</p>
                                            <div className="w-1/10 flex ml-auto justify-center">
                                                <IconButton onClick={e => { e.stopPropagation(); handleShowDeleteDialog(item.id); }} className='!p-0'>
                                                    <DeleteForeverIcon className='text-red-600'></DeleteForeverIcon>
                                                </IconButton>
                                            </div>
                                        </ListItemButton>
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                        {loading && <div className="flex mt-8 justify-center"><CircularProgress color='secondary' /></div>}
                    </div>
                    {dialogOpen && (
                        <AddEditTodoPage open={true} onClose={handleCloseDialog} todoData={dialogData} onSave={handleSaveTodoClick} />
                    )}

                    <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                        <div className='pr-4 pt-2 pb-4'>
                            <DialogTitle className='!text-xl !mb-2 text-secondary'>Delete To-Do</DialogTitle>
                            <DialogContent>
                                Are you sure you want to delete this to-do?
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCancelDelete} color="secondary">Cancel</Button>
                                <Button onClick={handleConfirmDelete} color="secondary" variant="contained">Delete</Button>
                            </DialogActions>
                        </div>
                    </Dialog>
                </div>
            </div>
        </ThemeProvider>
    );
}