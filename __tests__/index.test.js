import request from 'supertest'
import { app } from '../src/app'

describe('Check is the server running', () => {
  test('It should response the "The server is running!"', () => {
    return request(app)
      .get('/')
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.res.text).toBe('The server is running!')
      })
  })
})
