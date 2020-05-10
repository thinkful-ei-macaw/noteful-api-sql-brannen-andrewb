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
})