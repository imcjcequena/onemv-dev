/* eslint-disable */

import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app';
import { Messages } from '../../util';

chai.use(chaiHttp);
chai.should();

// // required for cognito
// global.fetch = require('node-fetch');


describe('----Auth Route----', () => {
  describe('/auth/google/authUrl', () => {
    // done();
    it('should return google auth url', (done) => {
      chai.request(app)
        .get(`/auth/google/authUrl`)
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('success');
          res.body.success.should.be.equal(true);
          res.body.message.should.be.equal(Messages.SUCCESS_GOOGLE_AUTH_URL);
          res.body.data.should.be.a('string');
          done();
        });
    })
  })
  describe('/auth/google/register', () => {
    // done();
    it('should error when no code provided', (done) => {
      chai.request(app)
        .post(`/auth/google/register`)
        .end((error, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('success');
          res.body.success.should.be.equal(false);
          res.body.message.should.be.equal(Messages.ERROR_MISSING_PARAMETERS);
          done();
        });
    })
  })
})
  

// describe('Authentication Routes', () => {
//   describe('MongoDB Register', () => {
//     it('Should error when invalid email provided', (done) => {
//       const inputs = {
//         email: 'testemail@test',
//         phone: '+639950001234',
//         password: '12345678',
//       };
//       chai.request(app).post('/auth')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//   });

//   describe('Cognito Register', () => {
//     it('Should error when no email provided', (done) => {
//       const inputs = {
//         email: 'testemail@test',
//         phone: '+639950001234',
//         password: '12345678',
//       };
//       chai.request(app).post('/auth')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           done();
//         });
//     });

//     it('Should error when Invalid phone number provided', (done) => {
//       const inputs = {
//         email: 'testemail@test.com',
//         phone: '123',
//         password: '12345678',
//       };
//       chai.request(app).post('/auth/cognito/register')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(400);
//           res.body.should.be.a('object');
//           done();
//         });
//     });

//     it('Should error when no phone number provided', (done) => {
//       const inputs = {
//         email: 'testemail@test.com',
//         password: '12345678',
//       };
//       chai.request(app).post('/auth/cognito/register')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(500);
//           res.body.should.be.a('object');
//           done();
//         });
//     });

//     it('Should error when no password provided', (done) => {
//       const inputs = {
//         email: 'testemail@test.com',
//         phone: '+639950001234',
//       };
//       chai.request(app).post('/auth/cognito/register')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(400);
//           res.body.should.be.a('object');
//           done();
//         });
//     });

//     it('Should error when empty password provided', (done) => {
//       const inputs = {
//         email: 'testemail@test.com',
//         phone: '+639950001234',
//         password: '',
//       };
//       chai.request(app).post('/auth/cognito/register')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(400);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//   });

//   describe('Cognito Login', () => {
//     it('Should error when no password provided', (done) => {
//       const inputs = {
//         email: 'testemail@test.com',
//       };
//       chai.request(app).post('/auth/cognito/login')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(400);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//     it('Should error when empty password is provied', (done) => {
//       const inputs = {
//         email: 'testemail@test.com',
//         password: '',
//       };
//       chai.request(app).post('/auth/cognito/login')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(400);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//     it('Should error when no email provided', (done) => {
//       const inputs = {
//         password: '123456789',
//       };
//       chai.request(app).post('/auth/cognito/login')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//     it('Should error when invalid email is provied', (done) => {
//       const inputs = {
//         password: '123456789',
//         email: 'testemail@test',
//       };
//       chai.request(app).post('/auth/cognito/login')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//     it('Should error when empty email is provied', (done) => {
//       const inputs = {
//         password: '123456789',
//         email: '',
//       };
//       chai.request(app).post('/auth/cognito/login')
//         .send(inputs).end((error, res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           done();
//         });
//     });
//   });
// });
