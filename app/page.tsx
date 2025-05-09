"use client";
import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button, Switch } from '@mui/material';
import { YTextField } from '@/types/Components';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import IncompleteCircleIcon from '@mui/icons-material/IncompleteCircle';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

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
    
    useEffect(() => {
        fetch('/api/todos').then((res) => res.json())
            .then((data) => {
                var todos = data.data;
                todos.sort((a: { DueDate: Date; }, b: { DueDate: Date; }) => {
                    const dateA = new Date(a.DueDate);
                    const dateB = new Date(b.DueDate);
                    return dateA.getTime() - dateB.getTime();
                });
                setToDos(todos);
                console.log(data);
            })

        fetch('/api/usersettings').then((res) => res.json())
            .then((data) => {
                var userSettings = data.data;
                console.log(userSettings);
                setSubscribed(userSettings.AllowNotification);
            })
    }, []);

    useEffect(() => {
        const lowercased = serchValue.toLowerCase();
        const newList = toDos.filter(item =>
          item.Summary.toLowerCase().includes(lowercased)
        );
        setfilteredToDos(newList);
    }, [serchValue, toDos]);

    const handleSubscribe = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            var checked = event.target.checked;
            if (!checked) {                
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    console.log('Subsritption unsubscribed');
                    setSubscription(null);
                } 
                else 
                {
                    console.log('No subscription found');
                }
                setSubscribed(checked);
            } else {  
                if (subscription) {
                    console.log('Already has subscription', subscription);
                    setSubscribed(checked);
                } 
                else 
                {
                    try {
                        const registration = await navigator.serviceWorker.ready;
                        const sub = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(
                                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                            )
                        });
    
                        setSubscription(sub);
                        setSubscribed(checked);
    
                        console.log('Subscribed successfully', sub);
                    } catch (err) {
                        alert('Failed to get subscription!');   
                    }                    
                }
            }
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    const handleSend = async () => {
        if (!subscription) {
            alert('Please enable notification at first！');
            return;
        }
        
        try {
            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription),
            });
        
            if (response.ok) {
                console.log('Push request sent successfully!');
            } else {
                console.error(response);
            }
        } catch (error) {
            console.error('Push request failed:', error);
        }
    }
    
    return (
        <ThemeProvider theme={theme}>
            <div id='backgroundContainer' className='flex w-screen h-screen bg-[rgb(245,245,245)] text-gray-800 font-sans'> 
                <div id='contentContainer' className='w-4/5 mx-auto'>
                    
                    <div id='header' className='flex w-auto h-20 p-1 mb-5 items-end'>
                        <div className='flex items-center'>
                            <p className='text-xl md:text-3xl'>To-Dos</p>
                            <div className='ml-5'>
                                <Button color='secondary' size='small' variant="outlined" onClick={handleSend}>Send Notification</Button>
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
                                    onChange={handleSubscribe}></Switch><p className='text-[12px] lg:text-[15px]'>Allow Notification</p>
                        </div>
                    </div>

                    <div id='content' className='min-h-30 border-gray-300 text-[12px] xl:text-[14px]'>
                        <List disablePadding className='bg-gray-50 border-[1px] rounded-lg border-gray-300'>
                            <ListItem key='0' className='h-10 bg-[rgb(235,237,242)] rounded-t-lg'>
                                <p className='w-1/6 md:w-1/6 lg:w-1/8 xl:w-1/11'>Due Date</p>
                                <p className='w-1/2 2xl:w-2/5'>Summary</p>
                                <p className='w-1/10'>Status</p>
                            </ListItem>
                            {filteredToDos.map((item) => (
                                <div key={item.id}>
                                    <Divider className='border-gray-300' />
                                    <ListItem disablePadding className='border-gray-300 font-light'>
                                        <ListItemButton className='h-14'>
                                            <p className='w-1/6 md:w-1/6 lg:w-1/8 xl:w-1/11'>{item.DueDate}</p>
                                            <p className='w-1/2 2xl:w-2/5'>{item.Summary}</p>
                                            <ListItemIcon className='w-1/10 text-[12px]'>
                                                {item.Status === 'done' && <div className='flex'><CheckCircleOutlineRoundedIcon className="text-green-500" /><p className='ml-2 mt-1'>Done</p></div>}
                                                {item.Status === 'inprogress' && Date.parse(item.DueDate) > Date.now() &&  <div className='flex'><IncompleteCircleIcon className="text-yellow-500" /><p className='ml-2 mt-1'>In Progress</p></div>}
                                                {item.Status === 'notstarted' && Date.parse(item.DueDate) > Date.now() &&  <div className='flex'><ChecklistIcon className="text-gray-500" /><p className='ml-2 mt-1'>Not Started</p></div>}
                                                {item.Status !== 'done' && Date.parse(item.DueDate) <= Date.now() && <div className='flex'><ErrorOutlineRoundedIcon className="text-red-500" /><p className='ml-2 mt-1'>Overdue</p></div>}
                                            </ListItemIcon>
                                        </ListItemButton>
                                    </ListItem>
                                </div>
                            ))}
                        </List>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );        
}