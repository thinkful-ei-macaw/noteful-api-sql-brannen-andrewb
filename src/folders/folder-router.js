const path = require('path')
const express = require('express')
const xss = require('xss')
const FolderService = require('./folder-service')

const folderRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
})

folderRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FolderService.getAllFolders(knexInstance)
            .then(folder => {
                res.json(folder.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newFolder = { name }

        for(const[key, value] of Object.entries(newFolder)) {
            if(value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        FolderService.insertFolder(
            req.app.get('db'),
            newFolder
        )
        .then( folder => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                .json(serializeFolder(folder))
        })
        .catch(next)
    })

folderRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FolderService.getById(
            req.app.get('db'), req.params.folder_id
        )
            .then(folder => {
                if(!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist` }
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        FolderService.deleteFolder(
            req.app.get('db'), 
            req.params.folder_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { id, name } = req.body
        const updateFolder = { id, name }

        const numOfValues = Object.values(updateFolder).filter(Boolean).length
        if (numOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'content' or 'folderId'`
                }
            })
        FolderService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            updateFolder
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = folderRouter