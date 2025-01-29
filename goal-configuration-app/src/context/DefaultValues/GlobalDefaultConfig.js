
const evaluationFields = [
    {name:'happy', label: 'Happy', type: 'text' },
    {name:'stop', label: 'Stop', type: 'text' },
    {name:'start', label: 'Start', type: 'text' },
    {name:'action', label: 'Action', type: 'text' },
];

const planningFields = [
    { name: 'to-do', label: 'To-dos', type: 'text' },
    { name: 'onething', label: 'One Thing', type: 'text' },
];

const evaluation = {
    name: 'evaluation', label: 'Evaluations',
    enabled: true,
    fields: evaluationFields
};


const planning = {
    name: 'planning',
    label: 'Planning',
    enabled: true,
    fields: planningFields,
}

const surprices = {
    name: 'surprises',
    label: 'Un planned - expected work',
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
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                label: 'Split Task:',
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
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                label: 'Split Task:',
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
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                label: 'Split Task:',
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
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                label: 'Split Task:',
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
                name: 'evaluations',
                label: 'Evaluation',
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
                    { name: 'meditation', label: 'Meditation', type: 'checkbox', options: ['Yes', 'No'] },
                    { name: 'reading', label: 'Reading', type: 'checkbox', options: ['Yes', 'No'] },
                    { name: 'excercise', label: 'Exercise', type: 'checkbox', options: ['Yes', 'No'] },
                    { name: 'diet', label: 'Diet', type: 'checkbox', options: ['Yes', 'No'] },
                ]
            },
            {
                name: 'ratings',
                label: 'Ratings',
                enabled: true,
                fields: [
                    { name: 'total', label: '10 Out of:', type: 'text' },
                ]
            },
        ]
    }
}

export { initialConfigState };