const knex = require('knex')
const app = require('../src/app')
const { TEST_DB_URL } = require('../src/config')
const { makeFoldersArray, makeNotesArray } = require('./app.fixtures')

describe('Notes Endpoints', function() {
  let db

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: TEST_DB_URL,
    })
    app.set('db', db)

  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'))

  describe(`GET /notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/notes')
          .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach(() => {
        return db
          .into('folder')
          .insert(testFolders)
        })

      beforeEach(() => {
        return db
            .into('note')
            .insert(testNotes)
        })

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/notes')
          .expect(200, testNotes)
      })
    })

    
    })


  describe(`GET /notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123
        return supertest(app)
          .get(`/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();

        beforeEach(() => {
            return db
              .into('folder')
              .insert(testFolders)
            })
    
          beforeEach(() => {
            return db
                .into('note')
                .insert(testNotes)
            })

      it('responds with 200 and the specified note', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })
})

  describe(`POST /notes`, () => {
    const testNotes = makeNotesArray();
    beforeEach('insert note', () => {
      return db
        .into('note')
        .insert(testNotes)
    })

    it(`creates a note, responding with 201 and the new note`, () => {
      const newNote = {
        name: 'Test new note',
        content: 'Test new note content...'
      }
      return supertest(app)
        .post('/notes')
        .send(newNote)
        .expect(201)
        .then(res => {
          expect(res.body.name).to.eql(newNote.name)
          expect(res.body.content).to.eql(newNote.content)
          expect(res.body).to.have.property('id')
          return supertest(app)
            .get(`/notes/${res.body.id}`)
            .expect(res.body)
        })
      })

    const requiredFields = ['name', 'content']

    requiredFields.forEach(field => {
      const newNote = {
        name: 'Test new note',
        content: 'Test new note content...'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field]

        return supertest(app)
          .post('/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

//   describe(`DELETE /notes/:note_id`, () => {
//     context(`Given no notes`, () => {
//       it(`responds with 404`, () => {
//         const noteId = 123456
//         return supertest(app)
//           .delete(`/notes/${noteId}`)
//           .expect(404, { error: { message: `Note doesn't exist` } })
//       })
//     })

//     context('Given there are notes in the database', () => {
//         const testFolders = makeFoldersArray();
//         const testNotes = makeNotesArray();

//       beforeEach('insert notes', () => {
//         return db
//           .into('noteful')
//           .insert(testFolders)
//           .then(() => {
//             return db
//               .into('noteful')
//               .insert(testNotes)
//           })
//       })

//       it('responds with 204 and removes the note', () => {
//         const idToRemove = 2
//         const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
//         return supertest(app)
//           .delete(`/notes/${idToRemove}`)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/notes`)
//               .expect(expectedNotes)
//           )
//       })
//     })
//   })

//   describe(`PATCH /notes/:note_id`, () => {
//     context(`Given no notes`, () => {
//       it(`responds with 404`, () => {
//         const noteId = 123456
//         return supertest(app)
//           .delete(`/notes/${noteId}`)
//           .expect(404, { error: { message: `Note doesn't exist` } })
//       })
//     })

//     context('Given there are notes in the database', () => {
//         const testFolders = makeFoldersArray();
//         const testNotes = makeNotesArray();

//       beforeEach('insert notes', () => {
//         return db
//           .into('noteful')
//           .insert(testFolders)
//           .then(() => {
//             return db
//               .into('noteful')
//               .insert(testNotes)
//           })
//       })

//       it('responds with 204 and updates the notee', () => {
//         const idToUpdate = 2
//         const updateNote = {
//           name: 'updated note title',
//           content: 'updated note content',
//         }
//         const expectedNote = {
//           ...testNotes[idToUpdate - 1],
//           ...updateNote
//         }
//         return supertest(app)
//           .patch(`/notes/${idToUpdate}`)
//           .send(updateNote)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/notes/${idToUpdate}`)
//               .expect(expectedNote)
//           )
//       })

//       it(`responds with 400 when no required fields supplied`, () => {
//         const idToUpdate = 2
//         return supertest(app)
//           .patch(`/notes/${idToUpdate}`)
//           .send({ irrelevantField: 'foo' })
//           .expect(400, {
//             error: {
//               message: `Request body must contain either 'title', 'style' or 'content'`
//             }
//           })
//       })

//       it(`responds with 204 when updating only a subset of fields`, () => {
//         const idToUpdate = 2
//         const updateNote = {
//           name: 'updated note title',
//         }
//         const expectedNote = {
//           ...testNotes[idToUpdate - 1],
//           ...updateNote
//         }

//         return supertest(app)
//           .patch(`/notes/${idToUpdate}`)
//           .send({
//             ...updateNote,
//             fieldToIgnore: 'should not be in GET response'
//           })
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/notes/${idToUpdate}`)
//               .expect(expectedNote)
//           )
//       })
//     })
//   })
})