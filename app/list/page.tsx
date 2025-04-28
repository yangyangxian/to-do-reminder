import React from 'react';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

export default function TodolistPage() {
return (<div id='backgroundContainer' className='flex w-screen h-screen bg-green-100'> 
            <div id='contentContainer' className='w-4/5 bg-blue-100 mx-auto'>
                <div id='header' className='flex w-auto bg-stone-300 gap-2 p-2 h-20'>
                    <div className='w-1/3 md:w-1/6 bg-purple-300'>
                        <p>To Dos</p>
                    </div>
                    <div className='w-1/3 md:w-1/6 bg-purple-300'>
                        <p>Add</p>
                    </div>
                    <div className='w-1/3 md:w-1/6 bg-purple-300 ml-auto'>
                        <p>Search</p>
                    </div>
                </div>
                <div id='content' className='min-h-30 bg-amber-700'>
                </div>
            </div>
        </div>);
            {/* <Box sx={{ width: '100%', maxWidth: 960, bgcolor: 'background.paper', color: 'text.primary', borderRadius: '8px', boxShadow: 3 }}>
                <nav aria-label="main mailbox folders">
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
                </nav>
                <Divider />
                <nav aria-label="secondary mailbox folders">
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
                </nav>
                </Box> */}
        
}