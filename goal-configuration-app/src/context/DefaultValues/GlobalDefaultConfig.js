
const evaluationFields = [
    { label: 'Happy', type: 'text' },
    { label: 'Stop', type: 'text' },
    { label: 'Start', type: 'text' },
    { label: 'Action', type: 'text' },
];

const planningFields = [
    { label: 'To-dos', type: 'text' },
    { label: 'One Thing', type: 'text' },
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
        label: 'work', type: 'text'
    }]
};

const initialConfigState = {
    levels: {
        yearly: true,
        quarterly: false,
        monthly: false,
        weekly: false,
        daily: false,
    },
    sections: {
        yearly: [
            {
                name: 'evaluation', label: 'Evaluation', enabled: true, fields: [
                    { label: 'Happy', type: 'text' },
                    { label: 'Stop', type: 'text' },
                ]
            },
            {
                name: 'planning', label: 'Planning', enabled: true, fields: [
                    { label: 'Yearly Plan', type: 'text' },
                ]
            },
        ],
        quarterly: [
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                lable: 'Split Task:',
                enabled: true,
                fields: [
                    { label: 'Month 1', type: 'text' },
                    { label: 'Month 2', type: 'text' },
                    { label: 'Month 3', type: 'text' },
                ],

            },
            surprices,
        ],
        monthly: [
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                lable: 'Split Task:',
                enabled: true,
                fields: [
                    { label: 'Week 1', type: 'text' },
                    { label: 'Week 2', type: 'text' },
                    { label: 'Week 3', type: 'text' },
                    { label: 'Week 4', type: 'text' },
                ],

            },
            surprices
        ],
        weekly: [
            evaluation,
            planning,
            {
                name: 'taskSplitUp',
                lable: 'Split Task:',
                enabled: true,
                fields: [
                    { label: 'Mon', type: 'text' },
                    { label: 'Tue', type: 'text' },
                    { label: 'Wed', type: 'text' },
                    { label: 'Thu', type: 'text' },
                    { label: 'Fri', type: 'text' },
                    { label: 'Sat', type: 'text' },
                    { label: 'Sun', type: 'text' },
                ],

            },
            surprices,
        ],
        daily: [
            {
                name: 'evaluations',
                label: 'Evaluation',
                fields: [
                    { label: 'What went well in the past 24 hours?', type: 'text' },
                    { label: 'What is the one thing I can do best tomorrow?', type: 'text' },
                    { label: 'What is one thing I can improve?', type: 'text' },
                ]
            },
            {
                name: 'rituals',
                label: 'Rituals',
                enabled: true,
                fields: [
                    { label: 'Meditation', type: 'checkbox', options: ['Yes', 'No'] },
                    { label: 'Reading', type: 'checkbox', options: ['Yes', 'No'] },
                    { label: 'Exercise', type: 'checkbox', options: ['Yes', 'No'] },
                ]
            },
            {
                name: 'evaluations',
                label: 'Evaluation',
                enabled: true,
                fields: [
                    { label: 'What went well in the past 24 hours?', type: 'text' },
                    { label: 'What is the one thing I can do best tomorrow?', type: 'text' },
                    { label: 'What is one thing I can improve?', type: 'text' },
                ]
            },
            {
                name: 'ratings',
                label: 'Ratings',
                enabled: true,
                fields: [
                    { label: 'Out of 10', type: 'text' },
                ]
            },
        ]
    }
}

export { initialConfigState };