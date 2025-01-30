import React, { useState } from "react";
import { signInWithGoogle } from "../../api/firebase/firebas";
import { Container, Typography, Button, Box, CircularProgress, Alert } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login Error:", err);
      setError("Failed to sign in. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center"
        height="100vh"
      >
        <Typography variant="h4" fontWeight="bold" color="primary" textAlign="center" gutterBottom>
          Focus2Win
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center" mb={3}>
          Achieve your goals with structured tracking and planning.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, width: "100%" }}>{error}</Alert>}

        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={handleLogin}
          disabled={loading}
          fullWidth
          sx={{ borderRadius: 2, py: 1.5, fontSize: "1rem" }}
        >
          {loading ? <CircularProgress size={24} /> : "Sign in with Google"}
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
