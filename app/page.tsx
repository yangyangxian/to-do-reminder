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

let todolist = [
    {
        id: 1,
        date: "2025-05-01",
        summary: "To merge the code into the main branch",
        status: 'completed',
    },
    {
        id: 2,
        date: "2025-05-03",
        summary: "To complete add functionality to the page",
        status: 'in-progress',
    },
    {
        id: 3,
        date: "2025-04-04",
        summary: "To buy a new dumbbell",
        status: 'not-started',
    },
];

todolist.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
});

function initSW() {
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
    const [value, setValue] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    
    const handleSubscribe = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setSubscribed(event.target.checked);
            if (subscribed) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    console.log('取消订阅成功');
                    setSubscribed(false);
                    setSubscription(null);
                } else {
                    console.log('没有找到订阅');
                }
            } else {
                if (subscription) {
                    console.log('已经订阅');
                    setSubscribed(true);
                    setSubscription(subscription);
                    return;
                } else {
                    const registration = await navigator.serviceWorker.ready;
                    console.log('SW 已激活，scope:', registration.scope);
                    
                    const sub = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(
                            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                        )
                    });

                    setSubscribed(true);
                    setSubscription(sub);

                    console.log('订阅成功：', sub);
                }
            }
        } catch (err) {
            console.error('订阅失败：', err);
        }
      };

      const handleSend = async () => {
        if (!subscription) {
            alert('请先允许通知！');
            return;
          }
        
        try {
            const response = await fetch('/api/send-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(subscription), // 订阅对象
            });
        
            if (response.ok) {
              console.log('推送成功');
            } else {
              console.error(response);
            }
          } catch (error) {
            console.error('请求失败:', error);
          }
      }
    
    return (
        <ThemeProvider theme={theme}>
            <div id='backgroundContainer' className='flex w-screen h-screen bg-[rgb(245,245,245)] text-gray-800 font-sans'> 
                <div id='contentContainer' className='w-4/5 mx-auto'>
                    
                    <div id='header' className='flex w-auto h-20 p-1 mb-5 items-end'>
                        <div className='flex items-center'>
                            <p className='text-3xl'>To-Dos</p>
                            <div className='ml-5'>
                                <Button color='secondary' size='small' variant="outlined" onClick={handleSend}>Send Notification</Button>
                            </div>
                            <div className='ml-5'>                              
                                <Switch color='secondary' checked={subscribed}
                                    onChange={handleSubscribe}></Switch>Allow Notification 
                            </div>
                        </div>
                        <div className='flex ml-auto'>
                            <YTextField
                                placeholder="Search"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                //error={value === "" ? "This field is required" : ""}
                                //className='ml-5'
                            />
                        </div>
                    </div>

                    <div id='content' className='min-h-30 border-gray-300 text-[13px] md:text-[15px]'>
                        <List disablePadding className='bg-gray-50 border-[1px] rounded-lg border-gray-300'>
                            <ListItem key='0' className='h-10 bg-[rgb(235,237,242)] rounded-t-lg'>
                                <p className='w-1/6 md:w-1/6 lg:w-1/8'>Due Date</p>
                                <p className='w-1/2 lg:w-2/5'>Summary</p>
                                <p className='w-1/10'>Status</p>
                            </ListItem>
                            {todolist.map((item) => (
                                <div key={item.id}>
                                    <Divider className='border-gray-300' />
                                    <ListItem disablePadding className='border-gray-300 font-light'>
                                        <ListItemButton className='h-14'>
                                            <p className='w-1/6 md:w-1/6 lg:w-1/8'>{item.date}</p>
                                            <p className='w-1/2 lg:w-2/5'>{item.summary}</p>
                                            <ListItemIcon className='w-1/10'>
                                                {item.status === 'completed' && <CheckCircleOutlineRoundedIcon className="text-green-500" />}
                                                {item.status === 'in-progress' && Date.parse(item.date) > Date.now() && <IncompleteCircleIcon className="text-yellow-500" />}
                                                {item.status === 'not-started' && Date.parse(item.date) > Date.now() &&  <ChecklistIcon className="text-gray-500" />}
                                                {item.status !== 'completed' && Date.parse(item.date) <= Date.now() && <ErrorOutlineRoundedIcon className="text-red-500" />}
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