"use client";
import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, CircularProgress, IconButton, ListSubheader, Switch, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { YTextField } from '@/app/types/FormComponents';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import IncompleteCircleIcon from '@mui/icons-material/IncompleteCircle';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { isBeforeToday, isToday } from '@/app/utilities/compareHelper';
import AddEditTodoPage from '@/app/pageControls/AddEditTodoPage';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const theme = createTheme({
    typography: {
        //Inherite the font from the parent element set by tailwindcss  
        fontFamily: 'inherit',       
    },
});

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from(
      [...rawData].map(char => char.charCodeAt(0))
    )
  }

function initSW() {
    if (typeof window === 'undefined') return; // Ensure this runs only in the browser
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js',{ scope: '/' })
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
    const [subscribed, setSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [toDos, setToDos] = useState<Array<any>>([]);
    const [filteredToDos, setfilteredToDos] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<{ summary: string; dueDate: string ; category: string; status: string; }>();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [todoIdToDelete, setTodoIdToDelete] = useState<number | null>(null);

    const listRef = React.useRef<HTMLDivElement>(null);

    const handleAddTodo = () => {
        setDialogOpen(true); // Open the dialog
    };
    
    const handleEditTodo = (todo: any) => {
        const newData = {id:todo.id, summary:todo.summary, category:todo.category, dueDate:todo.due_date, status: todo.status};
        setDialogData(newData); // Only set data, do not open dialog here
    }

    // Show delete confirmation dialog
    const handleDeleteTodo = (todoId: number) => {
        setTodoIdToDelete(todoId);
        setDeleteDialogOpen(true);
    };

    // Confirm delete
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

    // Cancel delete
    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setTodoIdToDelete(null);
    };

    useEffect(() => {
        if (dialogData) {
            setDialogOpen(true);
        }
    }, [dialogData]);

    const handleCloseDialog = () => {
        setDialogData(undefined); // Reset the dialog data
        setDialogOpen(false); // Close the dialog
    };
    
    useEffect(() => {
        fetch('/api/todos').then((res) => res.json())
            .then((data) => {
                var todos = data.data;
                setLoading(false);
                setToDos(todos);
            });

        fetch('/api/usersubscriptions').then((res) => res.json())
            .then(async (data) => {
                if (!data.success) {
                    console.log('Subscription fetching failed.');
                    return;
                }
                var savedSubstriptions: Array<{ endpoint: string }> = data.data;
                if (!savedSubstriptions || savedSubstriptions.length == 0) {
                    console.log('No saved subscription found');
                    return;
                }
                const registration = await navigator.serviceWorker.ready;
                let subOfCurrentBrowser = await registration.pushManager.getSubscription();               
                if (!subOfCurrentBrowser) {
                    console.log('No local subscription found. Please register a new one.');
                    return;
                }
                if (savedSubstriptions.some((item: { endpoint: string }) => item.endpoint === subOfCurrentBrowser?.endpoint))
                {
                    setSubscribed(true);
                    setSubscription(subOfCurrentBrowser);
                } else {
                    setSubscribed(false);
                    setSubscription(null);
                    console.log('No matching subscription found in the database.');
                }
            }).catch((error) => {
                console.error('Error fetching subscription:', error);
            });

        // Listen for refresh-todos event
        const refreshHandler = () => {
            setLoading(true);
            fetch('/api/todos').then((res) => res.json())
                .then((data) => {
                    var todos = data.data;
                    setLoading(false);
                    setToDos(todos);
                });
        };
        window.addEventListener('refresh-todos', refreshHandler);
        return () => {
            window.removeEventListener('refresh-todos', refreshHandler);
        };
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
        
        const pastIndexes = filteredToDos.filter(item => isBeforeToday(item.due_date) || isToday(item.due_date));

        if (pastIndexes.length > 2) {
            const listNode = listRef.current;
            const itemNodes = listNode.querySelectorAll('.todo-list-item');
            if (itemNodes[pastIndexes.length-2]) {
                (itemNodes[pastIndexes.length-2] as HTMLDivElement).scrollIntoView({ behavior: 'auto', block: 'start' });        
            }
        }
    }, [filteredToDos, loading]);

    const handleSubscribe = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            var checked = event.target.checked;
            if (!checked) {
                setSubscribed(checked);

                try {
                    if (subscription) {
                        console.log('Subsritption unsubscribed');
    
                        const response = await fetch('/api/usersubscriptions', {
                            method: 'DELETE',
                            headers: {
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(subscription),
                        });

                        alert('Unsubscribed successfully');
                        setSubscription(null);
                    } 
                    else 
                    {
                        console.log('No subscription found');
                    }
                } catch (err) {
                    console.error('Failed to unsubscribe:', err);
                    alert('Failed to unsubscribe!');
                    setSubscribed(true);
                }     
            } else {  
                if (subscription) {
                    console.log('Already has subscription', subscription);
                    setSubscribed(checked);
                } 
                else 
                {
                    try {
                        //change the button first to improve the user experience
                        setSubscribed(checked);
                        const registration = await navigator.serviceWorker.ready;
                        let subOfCurrentBrowser = await registration.pushManager.getSubscription();

                        if (!subOfCurrentBrowser) {
                            subOfCurrentBrowser = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(
                                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                            )
                            });
                        }

                        const response = await fetch('/api/usersubscriptions', {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(subOfCurrentBrowser),
                        });
    
                        setSubscription(subOfCurrentBrowser);
                        setSubscribed(checked);
                        
                        alert('Subscribed successfully');
                        console.log('Subscribed successfully', subOfCurrentBrowser);
                    } catch (err) {
                        alert('Failed to get subscription!'); 
                        setSubscribed(false);  
                    }                    
                }
            }
        } catch (err) {
            console.error('Action failed', err);
        }
    };
    
    return (
        <ThemeProvider theme={theme}>
            <div id='backgroundContainer' className='flex min-h-screen w-screen pb-10 bg-[rgb(245,245,245)] text-gray-800 font-sans'> 
                <div id='contentContainer' className='w-4/5 mx-auto'>
                    
                    <div id='header' className='flex w-auto h-22 p-1 mb-6 items-end'>
                        <div className='flex items-center'>
                            <p className='text-xl md:text-4xl'>To-Dos</p>
                            <div className='ml-5'>
                                <Button color='secondary' size='medium' variant="contained" onClick={handleAddTodo}>Add a To-do</Button>
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
                            <Switch color='secondary' checked={subscribed}
                                    onChange={handleSubscribe}></Switch><p className='text-[12px] lg:text-[15px]'>Allow Reminder To This Device</p>
                        </div>
                    </div>

                    <div id='content' className='min-h-30 border-gray-300 text-[12px] xl:text-[14px]'>

                        <ListItem key='0' className='h-11 bg-[rgb(235,237,242)] rounded-t-lg border-1 border-b-0 border-gray-300 !text-gray-900'>
                            <p className='w-1/6 md:w-1/6 lg:w-1/8 xl:w-1/11'>Due Date</p>
                            <p className='w-1/6 xl:w-1/10'>Category</p>
                            <p className='w-1/2 2xl:w-2/5'>Summary</p>
                            <p className='w-1/10'>Status</p>
                            <p className='w-1/10'>Actions</p>
                        </ListItem>

                        <List ref={listRef} disablePadding component="nav" 
                            sx={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }} 
                            className='bg-white border-b-[1px] border-x-1 rounded-b-lg border-gray-300'>
                            {filteredToDos.map((item) => (
                                <div key={item.id}>
                                    { new Date(item.due_date).toDateString() == new Date().toDateString() && 
                                        <ListSubheader className='border-gray-300 border-t-[1px] !bg-gray-50'>Today</ListSubheader>}
                                    { filteredToDos.filter(item => new Date(item.due_date) > new Date())[0].id == item.id && 
                                        <ListSubheader className='border-gray-300 !text-gray-800 border-t-[1px] !bg-gray-50'>Upcoming To-Do items</ListSubheader>}
                                    <Divider className='border-gray-300' />
                                    <ListItem disablePadding className='border-gray-300 font-light'>
                                        <ListItemButton className='h-13 todo-list-item' onClick={() => handleEditTodo(item)}>
                                            <p className='w-1/6 md:w-1/6 lg:w-1/8 xl:w-1/11'>{item.due_date}</p>
                                            <p className='w-1/6 xl:w-1/10'>{item.category_name}</p>
                                            <p className='w-1/2 2xl:w-2/5'>{item.summary}</p>
                                            <ListItemIcon className='w-1/10 text-[12px]'>
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
                                            <div className="w-1/10 flex">
                                                <IconButton onClick={e => { e.stopPropagation(); handleDeleteTodo(item.id); }} className='!p-0'>
                                                    <DeleteForeverIcon className='text-red-600'></DeleteForeverIcon>
                                                </IconButton>
                                            </div>                                           
                                        </ListItemButton>
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                        { loading && <div className="flex mt-8 justify-center"><CircularProgress color='secondary' /></div>}
                    </div>
                    {dialogOpen && (
                        <AddEditTodoPage open={true} onClose={handleCloseDialog} todoData={dialogData}></AddEditTodoPage>
                    )}
                    {/* Delete Confirmation Dialog */}                    
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