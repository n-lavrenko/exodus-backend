import { nanoid } from 'nanoid';
import request from 'supertest'
import { app } from '../../src/app'


const sampleUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: nanoid(5) + '@gmail.com',
  password: '1234',
}

describe('Check Auth API calls', () => {
  test('POST api/users/signup', () => {
    return new Promise(done => {
      request(app)
        .post('/api/user/signup')
        .send(sampleUser)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(response => {
          const {user, accessToken} = response.body
          expect(response.statusCode).toBe(200);
          expect(accessToken).toBeDefined();
          
          const expectedUser = {...sampleUser}
          delete expectedUser.password
          expectedUser.fullName = expectedUser.firstName + ' ' + expectedUser.lastName
          
          expect(user).toMatchObject(expectedUser)
          done()
        })
        .catch(err =>
          done(err)
        )
    })
  })
})
