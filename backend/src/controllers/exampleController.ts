import type { IExample } from "../models/exampleModel.js"

const examples: IExample[] = [
    {
        id: 1,
        name: 'Example 1',
        description: 'This is the first example'
    },
    {
        id: 2,
        name: 'Example 2',
        description: 'This is the second example'
    },
    {
        id: 3,
        name: 'Example 3',
        description: 'This is the third example'
    }
];

export const getExamples  = () =>{
    return examples;
}

export const getExampleById = (id: number) => {
    return examples.find(example => example.id === id);
}