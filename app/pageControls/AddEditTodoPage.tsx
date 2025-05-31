import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { YSelectField, YTextField } from '@/app/components/FormComponents';
import dayjs from 'dayjs';

interface AddEditTodoPageProps {
    todoData?: { summary: string; dueDate: string ; category: string; status: string; id?: string };
    open: boolean; 
    onClose: () => void; 
    onSave: (todo: any) => void; // new prop
}

const inputCommonClasses = '!h-[43px] border-1 border-gray-300 bg-gray-50';

export default function AddEditTodoPage(props: AddEditTodoPageProps) {
    const initialTodo = props.todoData || { summary: '', dueDate: dayjs(Date.now()).format('YYYY/MM/DD'), category: '', status: 'notstarted' };
    const [newTodo, setNewTodo] = useState(initialTodo);
    console.log('newTodo:', newTodo);
    // Reset form when dialog is closed
    useEffect(() => {
        if (!open) {
            setNewTodo(initialTodo);
        }
    }, [open, props.todoData]);

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <div className='pt-3 px-5 text-white bg-secondary'>
                <DialogTitle className='!p-2 !text-[22px]'>{props.todoData ? 'Edit To-Do' : 'Add To-Do'}</DialogTitle>
            </div>

            <div className='pt-3 px-5'>
                <DialogContent className='!p-2'>
                    <div className='w-100 space-y-4'>
                        <div>
                            <YTextField
                                className = {inputCommonClasses}
                                label="Due Date"
                                type="date"
                                value={newTodo.dueDate=='' ? dayjs(Date.now()).format('YYYY-MM-DD') : dayjs(newTodo.dueDate).format('YYYY-MM-DD')}
                                disabled={newTodo.status == 'completed'}                                
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
            
            <div className='mb-4 mr-6'>
                <DialogActions>
                    <Button color='secondary' onClick={props.onClose}>Cancel</Button>
                    <Button color='secondary' variant='contained' onClick={() => { props.onSave(newTodo); }}>Save</Button>
                </DialogActions>
            </div>
        </Dialog>
    );
}