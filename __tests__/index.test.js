import request from 'supertest'
import { app } from '../src/app'

describe('Test the root path', () => {
  test('It should response the GET method', () => {
    return new Promise(done => {
      request(app)
        .get('/')
        .then(response => {
          expect(response.statusCode).toBe(200)
          done()
        })
    })
  })
})
