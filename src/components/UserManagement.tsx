import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem,
    Alert
} from '@mui/material';
import { authService } from '../services/auth';
import type { User, CreateUserRequest } from '../models/types';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [newUser, setNewUser] = useState<CreateUserRequest>({ email: '', password: '', role: 'USER' });
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const data = await authService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        try {
            if (!newUser.email || !newUser.password) {
                setError("Email and Password are required.");
                return;
            }
            await authService.createUser(newUser);
            setOpen(false);
            setNewUser({ email: '', password: '', role: 'USER' });
            setError('');
            fetchUsers();
            fetchUsers();
        } catch (err: any) {
            console.error("Create User Error:", err);
            const msg = err.response?.data?.error || "Failed to create user. Email might be taken.";
            setError(msg);
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await authService.deleteUser(id);
                fetchUsers();
            } catch (err) {
                console.error("Failed to delete user");
            }
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">User Management</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Create User</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username/Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Button color="error" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email/Username"
                        fullWidth
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Role"
                        fullWidth
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'ADMIN' | 'USER' })}
                    >
                        <MenuItem value="USER">USER</MenuItem>
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
