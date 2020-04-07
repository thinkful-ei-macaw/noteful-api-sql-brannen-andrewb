const FolderService = {
    getAllFolders(knex) {
        return knex.select('*').from('folder')
    },
    getById(knex, id) {
        return knex.from('folder').select('*').where({id}).first()
    },
    insertFolder(knex, newFolder) {
        return knex
        .insert(newFolder)
        .into('folder')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    }, 
    deleteFolder(knex, id) {
        return knex('folder')
            .where({id})
            .delete()
    },
    updateFolder(knex, id, newFolderFields) {
        return knex('folder')
            .where({id})
            .update(newFolderFields)
    },
}

module.exports = FolderService