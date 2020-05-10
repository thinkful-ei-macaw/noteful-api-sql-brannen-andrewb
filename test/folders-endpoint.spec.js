const knex = require('knex')
const app = require('../src/app')
const { DB_URL } = require('../src/config')
const { makeFoldersArray } = require('./app.fixtures')

describe('Folders Endpoints', function() {
    let db
  
    before('make knex instance', () => {
  
      db = knex({
        client: 'pg',
        connection: DB_URL,
      })
      app.set('db', db)
  
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'))
  
    afterEach('cleanup',() => db.raw('TRUNCATE folder, note RESTART IDENTITY CASCADE'))
  
    describe(`GET /folders`, () => {
      context(`Given no folders`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app)
            .get('/folders')
            .expect(200, [])
        })
      })
  
      context('Given there are folders in the database', () => {
        const testFolders = makeFoldersArray();
  
        beforeEach('insert notes', () => {
          return db
            .into('folder')
            .insert(testFolders)
            })
  
        it('responds with 200 and all of the folders', () => {
          return supertest(app)
            .get('/folders')
            .expect(200, testFolders)
        })
      })
    })
  
    describe(`GET /folders/:folder_id`, () => {
      context(`Given no folders`, () => {
        it(`responds with 404`, () => {
          const folderId = 123
          return supertest(app)
            .get(`/folders/${folderId}`)
            .expect(404, { error: { message: `Folder doesn't exist` } })
        })
      })
  
      context('Given there are folders in the database', () => {
          const testFolders = makeFoldersArray();
  
        beforeEach('insert folders', () => {
          return db
            .into('folder')
            .insert(testFolders)
        })
  
        it('responds with 200 and the specified folder', () => {
          const folderId = 2
          const expectedFolder = testFolders[folderId - 1]
          return supertest(app)
            .get(`/folders/${folderId}`)
            .expect(200, expectedFolder)
        })
      })
  })

    describe(`POST /folders`, () => {
    // const testFolders = makeFoldersArray();
    // beforeEach('insert folder', () => {
    //   return db
    //     .into('folder')
    //     .insert(testFolders)
    // })

    it(`creates a folder, responding with 201 and the new folder`, () => {
      const newFolder = {
        id: 1,
        name: 'Test new folder'
      }
      delete newFolder.id
      console.log(newFolder)
      return supertest(app)
        .post('/folders')
        .send(newFolder)
        .expect(201)
        .then(res => {
          expect(res.body.name).to.eql(newFolder.name)
          expect(res.body).to.have.property('id')
          return supertest(app)
            .get(`/folders/${res.body.id}`)
            .expect(200)
        })
    })

    const requiredFields = ['name']

    requiredFields.forEach(field => {
      const newFolder = {
        id: 1,
        name: 'Test new folder'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]

        return supertest(app)
          .post('/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

    describe(`DELETE /folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
        const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folder')
          .insert(testFolders)
      })

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2
        const expectedFolder = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/folders`)
              .expect(expectedFolder)
          )
      })
    })
  })

    describe(`PATCH /folders/:folder_id`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456
        return supertest(app)
          .delete(`/folders/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the database', () => {
        const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folder')
          .insert(testFolders)
        })

      it('responds with 204 and updates the folder', () => {
        const idToUpdate = 2
        const updateFolder = {
          name: 'updated folder name'
        }
        const expectedFolder = {
          ...testFolders[idToUpdate - 1],
          ...updateFolder
        }
        return supertest(app)
          .patch(`/folders/${idToUpdate}`)
          .send(updateFolder)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/folders/${idToUpdate}`)
              .expect(expectedFolder)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/folders/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'name', 'content' or 'folderId'`
            }
          })
      })

    
    })
  })

})