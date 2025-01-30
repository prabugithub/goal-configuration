import React from "react";
import { Button, Typography, Box, Container } from "@mui/material";
import { useStep } from "../../context/StepContext";

const AppGuide = () => {
    const { goNext } = useStep();

    const handleNext = () => {
        goNext();
    };

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100vh"
                textAlign="center"
            >
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    Welcome to Focus2Win!
                </Typography>
                <Typography variant="h5" color="primary" >
                    Getting Started Guide!
                </Typography>
                {/* <Typography variant="h6" color="textSecondary" paragraph>
                    This app will help you achieve your goals by tracking your progress and setting clear milestones. Whether you want to focus on personal development or work-related goals, we’ve got you covered.
                </Typography> */}
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: "center", marginBottom: "20px" }}>
                    Sign in with your Google account and configure your settings (<strong>Only the first time!</strong>).
                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: "monospace", display: "block", marginTop: "8px" }}>
                        During setup, you’ll define your personalized goal-tracking preferences. Refer to the notes at the top of each step for guidance on customizing your settings.
                    </Typography>
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    Once your settings are saved, you can sign in and start efficiently tracking your goals.
                </Typography>

               

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    size="large"
                    sx={{ borderRadius: 2, py: 1.5 }}
                >
                    Get Started
                </Button>
            </Box>
        </Container>
    );
};

export default AppGuide;
