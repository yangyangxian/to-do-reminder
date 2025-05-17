import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { YSelectField, YTextField } from '@/types/Components';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface AddEditTodoPageProps {
    todoData?: { summary: string; dueDate: string ; category: string; status: string; };
    open: boolean; 
    onClose: () => void; 
}

const inputCommonClasses = '!h-[40px] border-1 border-gray-300 bg-gray-50';
const selectCommonClasses = '!w-100 !h-[45px] bg-gray-50 !border-gray-300 !rounded-md';

export default function AddEditTodoPage({ todoData, open, onClose  }: AddEditTodoPageProps) {
    const [newTodo, setNewTodo] = useState(todoData || { summary: '', dueDate: '', category: '', status: '' });

    const handleSave = () => {
        console.log('New To-Do:', newTodo);
        // Add logic to save the new to-do item
        onClose();
    };

    return (
        <div>
            <Dialog className='p-5' open={open} onClose={onClose}>
                <DialogTitle>{todoData ? 'Edit To-Do' : 'Add To-Do'}</DialogTitle>
                <DialogContent>
                    <div className='w-100 space-y-4'>
                        <div>
                            <YTextField
                                className = {inputCommonClasses}
                                label="Due Date"
                                type="date"
                                value={newTodo.dueDate}
                                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <YSelectField
                                //className = {inputCommonClasses}
                                options={[{ value: 'Story', label: 'Story' },
                                        { value: 'Research', label: 'Research' }, 
                                        { value: 'Shopping', label: 'Shopping' }]}
                                label="Category"
                                value={newTodo.category}
                                onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                            />
                        </div>
                        <div>
                            <YTextField
                                className = {inputCommonClasses}
                                label="Summary"
                                value={newTodo.summary}
                                onChange={(e) => setNewTodo({ ...newTodo, summary: e.target.value })}
                            />
                        </div>
                        <div>
                            <YSelectField
                                label="Status"                    
                                options={[{ value: 'notstarted', label: 'Not Started' },
                                        { value: 'inprogress', label: 'In Progress' }, 
                                        { value: 'completed', label: 'Completed' }]}
                                value={newTodo.status || 'notstarted'}
                                onChange={(e) => setNewTodo({ ...newTodo, status: e.target.value })}
                            >
                            </YSelectField>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}