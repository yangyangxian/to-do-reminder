"use client";

import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button } from '@mui/material';
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

export default function TodolistPage() {
    const [value, setValue] = useState("");
    
    return (
        <ThemeProvider theme={theme}>
            <div id='backgroundContainer' className='flex w-screen h-screen bg-[rgb(245,245,245)] text-gray-800 font-sans'> 
                <div id='contentContainer' className='w-4/5 mx-auto'>
                    
                    <div id='header' className='flex w-auto h-20 p-1 mb-5 items-end'>
                        <div className='flex items-center'>
                            <p className='text-3xl'>To-Dos</p>
                            <div className='ml-5'>
                                <Button color='secondary' size='small' variant="outlined">Add a to-do</Button>
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
                                                {item.status === 'in-progress' && <IncompleteCircleIcon className="text-yellow-500" />}
                                                {item.status === 'not-started' && Date.parse(item.date) > Date.now() &&  <ChecklistIcon className="text-gray-500" />}
                                                {item.status === 'not-started' && Date.parse(item.date) <= Date.now() && <ErrorOutlineRoundedIcon className="text-red-500" />}
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