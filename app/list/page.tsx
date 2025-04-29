"use client";

import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        //Inherite the font from the parent element set by tailwindcss  
        fontFamily: 'inherit',
    },
});

export default function TodolistPage() {
    return (
        <ThemeProvider theme={theme}>
            <div id='backgroundContainer' className='flex w-screen h-screen bg-[#f0f0f0] text-gray-800 font-sans'> 
                <div id='contentContainer' className='w-4/5 mx-auto'>
                    <div id='header' className='flex w-auto h-20'>
                        <div className='flex w-1/3 md:w-1/6 items-end'>
                            <p className='text-3xl'>To-Dos</p>
                        </div>
                        <div className='flex w-1/3 md:w-1/6 items-end'>
                            <p className='text-xl'>Add</p>
                        </div>
                        <div className='flex w-1/3 md:w-1/6 ml-auto items-end'>
                            <p className='text-xl'>Search</p>
                        </div>
                    </div>

                    <Divider />

                    <div id='content' className='min-h-30 bg-gray-50'>
                        <List className='bg-cyan-300'>
                            <ListItem disablePadding>
                                <ListItemButton>
                                <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>
                                <ListItemText primary="Inbox" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton>
                                <ListItemIcon>
                                    <DraftsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Drafts" />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Divider />

                        <List className='bg-cyan-400'>
                            <ListItem disablePadding>
                                <ListItemButton>
                                <ListItemText primary="Trash" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component="a" href="#simple-list">
                                <ListItemText primary="Spam" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );        
}