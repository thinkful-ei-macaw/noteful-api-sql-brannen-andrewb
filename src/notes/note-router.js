const path = require('path')
const express = require('express')
const xss = require('xss')
const NoteService = require('./note-service')

const noteRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: note.folderId,
    content: xss(note.content)
})

noteRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NoteService.getAllNotes(knexInstance)
            .then(note => {
                res.json(note.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, content, folderId } = req.body
        const newNote = { name, content, folderId }

        for(const[key, value] of Object.entries(newNote)) {
            if(value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        NoteService.insertNote(
            req.app.get('db'),
            newNote
        )
        .then( note => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${note.id}`))
                .json(serializeNote(note))
        })
        .catch(next)
    })

noteRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NoteService.getById(
            req.app.get('db'), req.params.note_id
        )
            .then(note => {
                if(!note) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                    })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        NoteService.deleteUser(
            req.app.get('db'), 
            req.params.note_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, content, folderId } = req.body
        const updateNote = { name, content, folderId }

        const numOfValues = Object.values(updateNote).filter(Boolean).length
        if (numOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'name', 'content' or 'folderId'`
                }
            })
        NoteService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            updateNote
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = noteRouter