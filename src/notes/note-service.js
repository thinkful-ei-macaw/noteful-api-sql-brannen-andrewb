const NoteService = {
    getAllFolders(knex) {
        return knex.select('*').from('note')
    },
    getById(knex, id) {
        return knex.from('note').select('*').where({id}).first()
    },
    insertFolder(knex, newNote) {
        return knex
        .insert(newNote)
        .into('note')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    }, 
    deleteFolder(knex, id) {
        return knex('note')
            .where({id})
            .delete()
    },
    updateFolder(knex, id, newNoteFields) {
        return knex('note')
            .where({id})
            .update(newNoteFields)
    },
}

module.exports = NoteService