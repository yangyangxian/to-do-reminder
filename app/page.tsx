"use client";

import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Button } from '@mui/material';
import { YTextField } from '@/types/Components';

const theme = createTheme({
    typography: {
        //Inherite the font from the parent element set by tailwindcss  
        fontFamily: 'inherit',       
    },
});

export default function TodolistPage() {
    const [value, setValue] = useState("");
    
    return (
        <ThemeProvider theme={theme}>
            <div id='backgroundContainer' className='flex w-screen h-screen bg-[#f0f0f0] text-gray-800 font-sans'> 
                <div id='contentContainer' className='w-4/5 mx-auto'>

                    <div id='header' className='flex w-auto h-20 p-3'>
                        <div className='flex w-1/3 md:w-1/6 items-end'>
                            <p className='text-3xl'>To-Dos</p>
                        </div>
                        <div className='flex w-1/3 md:w-1/6 items-end'>
                            <Button color='secondary' size='small' variant="outlined">Add to-do</Button>
                        </div>
                        <div className='flex w-1/3 md:w-1/6 ml-auto items-end'>
                            <YTextField
                                //label="Search"
                                placeholder="Search"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                //error={value === "" ? "This field is required" : ""}
                                className="w-1/2"
                            />
                        </div>
                    </div>

                    <Divider />

                    <div id='content' className='min-h-30'>
                        <List>
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

                        <List>
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