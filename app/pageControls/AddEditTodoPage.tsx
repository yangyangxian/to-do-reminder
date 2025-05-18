import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { YSelectField, YTextField } from '@/app/types/FormComponents';
import dayjs from 'dayjs';

interface AddEditTodoPageProps {
    todoData?: { summary: string; dueDate: string ; category: string; status: string; id?: string };
    open: boolean; 
    onClose: () => void; 
}

const inputCommonClasses = '!h-[43px] border-1 border-gray-300 bg-gray-50';

export default function AddEditTodoPage({ todoData, open, onClose  }: AddEditTodoPageProps) {
    const initialTodo = todoData || { summary: '', dueDate: '', category: '', status: 'notstarted' };
    const [newTodo, setNewTodo] = useState(initialTodo);
    console.log('newTodo:', newTodo);
    // Reset form when dialog is closed
    useEffect(() => {
        if (!open) {
            setNewTodo(initialTodo);
        }
    }, [open, todoData]);

    const handleSave = async () => {
        try {
            const method = todoData && todoData.id ? 'PUT' : 'POST';
            const url = '/api/todos';
            const payload = todoData && todoData.id ? { ...newTodo, id: todoData.id } : newTodo;
            console.log('payload:', payload);
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error('Failed to save to-do');
            }
            // Refresh the to-do list in the parent by dispatching a custom event
            const event = new CustomEvent('refresh-todos');
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Error saving to-do:', error);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <div className='p-[9px] px-6 text-white bg-secondary'>
                <DialogTitle className='!p-2 !text-[22px]'>{todoData ? 'Edit To-Do' : 'Add To-Do'}</DialogTitle>
            </div>

            <div className='pt-3 px-6'>
                <DialogContent className='!p-2'>
                    <div className='w-100 space-y-4'>
                        <div>
                            <YTextField
                                className = {inputCommonClasses}
                                label="Due Date"
                                type="date"                                
                                value={dayjs(newTodo.dueDate).format('YYYY-MM-DD')}
                                onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <YSelectField
                                //className = {inputCommonClasses}
                                options={[{ value: '1', label: 'Story' },
                                        { value: '2', label: 'Research' }, 
                                        { value: '3', label: 'Shopping' }]}
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
            </div>
            
            <div className='mb-2'>
                <DialogActions>
                    <Button color='secondary' variant='contained' onClick={handleSave}>Save</Button>
                    <Button color='secondary' onClick={onClose}>Cancel</Button>
                </DialogActions>
            </div>
        </Dialog>
    );
}