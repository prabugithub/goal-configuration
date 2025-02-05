import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent, List, ListItem, ListItemText, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GenericLogic from "../../common/utils/generic-logic";
import CONSTANTS from "../../common/constants";

const ShowSavedGoalEvaluation = ({ savedData, config, level }) => {
    const renderValue = (value) => {
        if (Array.isArray(value)) {
            return value.join();
        }
        // If the value is a string or other primitive type, render it as plain text
        return <Typography variant="caption" sx={{ fontSize: "15px", textAlign: "left" }}>{GenericLogic.capitalizeFirstLetter(value)}</Typography>;
    };

    return (
        <Box sx={{ borderBottom: 1, p:1.5, marginBottom: "20px", borderColor: 'divider', width: '100%' }}>
            {config.map((section) => (
                <>
                    <Typography variant="h6" style={{ textTransform: "capitalize", width: '100%', marginBottom: "15px" }}>
                        {`${section?.label || section?.name}`}
                    </Typography>
                    {section?.fields?.map((field) => (
                        <Typography variant="body1" color="textSecondary" sx={{ textAlign: "left", marginBottom: "15px" }}>
                            <strong>{field.label}</strong> :  {savedData[section.name] && (savedData[section.name][field.name] || savedData[section.name][field.label]) ? renderValue(savedData[section.name][field.name] || savedData[section.name][field.label]) : 'No saved value.'}
                        </Typography>
                    ))}
                </>
            ))}
        </Box>
    );
};

export default ShowSavedGoalEvaluation;