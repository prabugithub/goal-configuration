import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

function CustomPrompt({ open, title, message, onClose }) {
    const [inputValue, setInputValue] = useState("");

    const handleClose = (confirmed) => {
        onClose(confirmed ? inputValue : null);
        setInputValue(""); // Reset the input value when closing
    };

    return (
        <Dialog open={open} onClose={() => handleClose(false)}>
            <DialogTitle>{title || "Prompt"}</DialogTitle>
            <DialogContent>
                <p>{message || "Please enter your input:"}</p>
                <TextField
                    autoFocus
                    fullWidth
                    variant="outlined"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} color="secondary">
                    Cancel
                </Button>
                <Button onClick={() => handleClose(true)} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export { CustomPrompt };