function makeFoldersArray() {
    return [
        {
            id: 1,
            name: 'Good Dogs',
        },
        {
            id: 2,
            name: 'Very Good Dogs',
        },
        {
            id: 3,
            name: 'All dogs are good dogs',
        }
    ];
}

function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'This Good Dog',
            modified: new Date().toISOString(),
            folder_id: 1,
            content: 'This is a note about a good dog',
        },
        {
            id: 2,
            name: 'This Very Good Dog',
            modified: new Date().toISOString(),
            folder_id: 2,
            content: 'This is a note about a very good dog',
        },
        {
            id: 3,
            name: 'This Great Dog',
            modified: new Date().toISOString(),
            folder_id: 3,
            content: 'This is a note about a great dog',
        }
    ];
}

module.exports = {
    makeFoldersArray,
    makeNotesArray
}