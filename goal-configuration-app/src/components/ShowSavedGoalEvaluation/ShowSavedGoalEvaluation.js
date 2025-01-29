import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Card, CardContent, List, ListItem, ListItemText, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GenericLogic from "../../common/utils/generic-logic";
import CONSTANTS from "../../common/constants";

const ShowSavedGoalEvaluation = ({ savedData, config, level }) => {
    const renderValue = (value) => {
        if (Array.isArray(value)) {
            // If the value is an array, render it as a list
            //return (
            // <List>
            //   {value.map((item, index) => (
            //     <ListItem key={index} disablePadding>
            //       <ListItemText primary={item} />
            //     </ListItem>
            //   ))}
            // </List>
            // <Typography variant="body1" sx={{ textAlign: "left" }}>{value.join()}</Typography>

            //);
            return value.join();
        }
        // If the value is a string or other primitive type, render it as plain text
        return <Typography variant="caption" sx={{ fontSize: "15px", textAlign: "left" }}>{GenericLogic.capitalizeFirstLetter(value)}</Typography>;
    };

    return (
        // <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
        //     {Object.entries(savedData).map(([section, content]) => (
        //         <Accordion key={section}>
        //             <AccordionSummary
        //                 expandIcon={<ExpandMoreIcon />}
        //                 aria-controls={`${section}-content`}
        //                 id={`${section}-header`}
        //             >
        //                 <Typography variant="h6" style={{ textTransform: "capitalize" }}>
        //                     {section}
        //                 </Typography>
        //             </AccordionSummary>
        //             <AccordionDetails>
        //                 <div>
        //                     <Card
        //                         key={section?.name}
        //                         style={{ marginBottom: "10px", borderRadius: "10px", boxShadow: "0 3px 6px rgba(0,0,0,0.1)" }}
        //                     >
        //                         {Object.entries(content).map(([key, value]) => (
        //                             <Typography variant="subtitle1" color="textSecondary">
        //                                 {key}:  {renderValue(value)}
        //                             </Typography>
        //                         ))}
        //                     </Card>
        //                 </div>
        //             </AccordionDetails>
        //         </Accordion>
        //     ))}
        // </div>
        <Box sx={{ borderBottom: 1, marginBottom: "20px", borderColor: 'divider', width: '100%' }}>
            {config.map((section) => (
                <>
                    <Typography variant="h6" style={{ textTransform: "capitalize", width: '100%', marginBottom: "15px" }}>
                        {section?.name === 'evaluation' ? `Last ${CONSTANTS.LEVEL[level?.toUpperCase()]}  ${section?.label}` : `${section?.label || section?.name}`}
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