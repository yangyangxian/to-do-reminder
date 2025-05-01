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

const theme = createTheme({
    typography: {
        //Inherite the font from the parent element set by tailwindcss  
        fontFamily: 'inherit',       
    },
});

const todolist = [
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
        date: "2025-05-04",
        summary: "To buy a new dumbbell",
        status: 'not-started',
    },
];

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

                    <div id='content' className='min-h-30 border-gray-300'>
                        <List disablePadding className='bg-gray-50 border-[1px] rounded-lg border-gray-300'>
                            <ListItem className='h-10 bg-gray-200 font-normal rounded-t-lg'>
                                <p className='w-1/9'>Date</p>
                                <p className='mr-5 w-1/3'>Summary</p>
                                <p className='w-1/10'>Status</p>
                            </ListItem>
                            {todolist.map((item) => (
                                <div>
                                    <Divider className='border-gray-300' />
                                    <ListItem key={item.id} disablePadding className='font-extralight border-gray-300'>
                                        <ListItemButton className='h-14'>
                                            <p className='w-1/9'>{item.date}</p>
                                            <p className='mr-5 w-1/3'>{item.summary}</p>
                                            {/* <ListItemText className='w-1/10' primary={item.date} />
                                            <ListItemText className='w-1/5'primary={item.summary} /> */}
                                            <ListItemIcon className='w-1/10'>
                                                {item.status === 'completed' && <CheckCircleOutlineRoundedIcon className="text-green-500" />}
                                                {item.status === 'in-progress' && <IncompleteCircleIcon className="text-yellow-500" />}
                                                {item.status === 'not-started' && <ChecklistIcon className="text-gray-500" />}
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