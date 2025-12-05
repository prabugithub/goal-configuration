
const evaluationFields = [
    { name: 'happy', label: 'What went well?', type: 'text' },
    { name: 'stop', label: 'What goes not well?', type: 'text' },
    { name: 'start', label: 'What are the things want to improve process?', type: 'text' },
    { name: 'action', label: 'Plan your improvements:', type: 'text' },
];

const planningFields = [
    { name: 'to-do', label: 'List down 3-5 goals', type: 'text' },
    { name: 'onething', label: 'Only one most important goal from the list:', type: 'text' },
];


const planning = {
    name: 'planning',
    label: 'Planning',
    enabled: false,
    fields: planningFields,
}

const surprices = {
    name: 'surprises',
    label: 'Expected unplanned works:',
    enabled: true,
    fields: [{
        name: 'work', label: 'work', type: 'text'
    }]
};

const initialConfigState = {
    levels: {
        yearly: true,
        quarterly: true,
        monthly: true,
        weekly: true,
        daily: true,
    },
    sections: {
        yearly: [
            { ...planning, enabled: true },
            {
                name: 'evaluation', label: 'Last Year Review',
                enabled: true,
                fields: evaluationFields
            },
            {
                name: 'taskSplitUp',
                label: 'Break down Year goal to quaters:',
                enabled: true,
                fields: [
                    { name: 'q1', label: 'Quater 1', type: 'text' },
                    { name: 'q2', label: 'Quater 2', type: 'text' },
                    { name: 'q3', label: 'Quater 3', type: 'text' },
                    { name: 'q4', label: 'Quater 4', type: 'text' },
                ],

            },
            surprices
        ],
        quarterly: [
            {
                name: 'evaluation', label: 'Last Quater Review',
                enabled: true,
                fields: evaluationFields
            },
            { ...planning, enabled: true },
            {
                name: 'taskSplitUp',
                label: 'Break down Quater goal to months:',
                enabled: true,
                fields: [
                    { name: 'm1', label: 'Month 1', type: 'text' },
                    { name: 'm2', label: 'Month 2', type: 'text' },
                    { name: 'm3', label: 'Month 3', type: 'text' },
                ],

            },
            surprices,
        ],
        monthly: [
            {
                name: 'evaluation', label: 'Last Month Review',
                enabled: true,
                fields: evaluationFields
            },
            { ...planning, enabled: true },
            {
                name: 'taskSplitUp',
                label: 'Break down Month goal to weeks:',
                enabled: true,
                fields: [
                    { name: 'w1', label: 'Week 1', type: 'text' },
                    { name: 'w2', label: 'Week 2', type: 'text' },
                    { name: 'w3', label: 'Week 3', type: 'text' },
                    { name: 'w4', label: 'Week 4', type: 'text' },
                ],

            },
            surprices
        ],
        weekly: [
            {
                name: 'evaluation', label: 'Last Week Review',
                enabled: true,
                fields: evaluationFields
            },
            { ...planning, enabled: true },
            {
                name: 'taskSplitUp',
                label: 'Break down Weekly goal to days:',
                enabled: true,
                fields: [
                    { name: 'mon', label: 'Mon', type: 'text' },
                    { name: 'tue', label: 'Tue', type: 'text' },
                    { name: 'wed', label: 'Wed', type: 'text' },
                    { name: 'thu', label: 'Thu', type: 'text' },
                    { name: 'fri', label: 'Fri', type: 'text' },
                    { name: 'sat', label: 'Sat', type: 'text' },
                    { name: 'sun', label: 'Sun', type: 'text' },
                ],

            },
            surprices,
        ],
        daily: [
            {
                name: 'performance',
                label: 'Goal Performance',
                enabled: true,
                fields: [
                    {
                        name: 'completion',
                        label: 'Goal completion percentage',
                        type: 'percentage',
                        min: 0,
                        max: 100,
                        step: 10
                    },
                    { name: 'deepwork', label: 'Deep work', type: 'duration' },
                ]
            },
            {
                name: 'evaluations',
                label: 'Daily Reflection',
                enabled: true,
                fields: [
                    { name: 'went-well', label: 'What went well in the past 24 hours?', type: 'text' },
                    { name: 'best-tomo', label: 'What is the one thing I can do best tomorrow?', type: 'text' },
                    { name: 'improve', label: 'What is one thing I can improve?', type: 'text' },
                    { name: 'organize', label: 'Organize tomorrow today', type: 'text' },
                ]
            },
            {
                name: 'rituals',
                label: 'Rituals',
                enabled: true,
                fields: [
                    { name: 'meditation', label: 'Meditation', type: 'duration' },
                    { name: 'reading', label: 'Reading', type: 'duration' },
                    { name: 'excercise', label: 'Exercise', type: 'duration' },
                    { name: 'diet', label: 'Followed diet plan?', type: 'checkbox', options: ['Yes', 'No'] },
                ]
            },
            {
                name: 'ratings',
                label: 'Daily Rating',
                enabled: true,
                fields: [
                    { name: 'total', label: 'Overall day rating (out of 10)', type: 'rating' },
                ]
            },
        ]
    }
}

export { initialConfigState };