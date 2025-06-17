import type { Console } from '../model/Console';

const exampleConsole = {
    iri: 'https://VGCHontology.com/Entities/ExampleConsole',
    identifier: 'ExampleConsole',
    type: 'Console',
    name: 'Example Console',
    hasReleaseDate: [
        { hasRegion: 'NorthAmerica', hasDate: new Date('2023-01-15') },
        { hasRegion: 'Europe', hasDate: new Date('2023-01-15') },
        { hasRegion: 'Japan', hasDate: new Date('2023-01-15') },
    ],
    hasSuccessor: undefined,
    isSuccessorOf: undefined,
    isCreatedBy: {
        name: 'TechCorp',
        uri: 'https://example.com/techcorp',
        hasCreatedIDs: [],
        manufacturerType: 'Console',
        identifier: 'TechCorp',
    },
    summary:
        'The Super Console X is the latest gaming console offering cutting-edge performance and immersive gameplay.',
    description:
        'Equipped with a powerful GPU and advanced cooling system, the Super Console X delivers stunning visuals and seamless performance.',
    hasDocumentation: [
        {
            identifier: 'NonExistentidentifier3',
            type: 'PDF',
            hasDisplayName: 'User Manual',
            hasDocumentationLink: 'Yari Koot - Bachelor Thesis.pdf',
            isDocumentationOf: 'https://VGCHontology.com/Entities/ExampleConsole',
        },
        {
            identifier: 'NonExistentidentifier4',
            hasDisplayName: 'Developer Guide',
            type: 'HTML',
            hasDocumentationLink: 'invalid file.pdf',
            isDocumentationOf: 'https://VGCHontology.com/Entities/ExampleConsole',
        },
    ],
    hasComponents: [],
} as Console;

const exampleConsole2 = {
    iri: 'https://VGCHontology.com/Entities/AnotherExample',
    identifier: 'AnotherExample',
    type: 'Console',
    name: 'Another example',
    hasReleaseDate: [
        { hasRegion: 'NorthAmerica', hasDate: new Date('2023-01-15') },
        { hasRegion: 'Europe', hasDate: new Date('2023-01-15') },
        { hasRegion: 'Japan', hasDate: new Date('2023-01-15') },
    ],
    hasSuccessor: undefined,
    isSuccessorOf: undefined,
    isCreatedBy: {
        name: 'ZetCorp',
        uri: 'https://example.com/zetCorp',
        hasCreatedIDs: [],
        manufacturerType: 'Console',
        identifier: 'TechCorp',
    },

    summary:
        'Another example is the latest gaming console offering cutting-edge performance and immersive gameplay.',
    description:
        'Equipped with a powerful GPU and advanced cooling system, the Super Console X delivers stunning visuals and seamless performance.',
    hasDocumentation: [
        {
            identifier: 'NonExistentidentifier',
            hasDisplayName: 'User Manual',
            type: 'PDF',
            hasDocumentationLink: 'https://example.com/user-manual.pdf',
            isDocumentationOf: 'https://VGCHontology.com/Entities/ExampleConsole',
        },
        {
            identifier: 'NonExistentidentifier2',
            hasDisplayName: 'Developer Guide',
            type: 'HTML',
            hasDocumentationLink: 'https://example.com/developer-guide',
            isDocumentationOf: 'https://VGCHontology.com/Entities/ExampleConsole',
        },
    ],
    hasComponents: [],
} as Console;

export const exampleConsoles: Console[] = [exampleConsole, exampleConsole2];
