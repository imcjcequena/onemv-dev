// /* eslint-disable */
// import sinon from 'sinon';
// import { validateToken } from '../../middleware';
// import jwt from 'jsonwebtoken';
// import { Messages } from '../../util';

// const sandbox = sinon.createSandbox();

// describe('-----validationToken Middleware-----', () => {
//   let req = {}, res= {}, next;
//   beforeEach(() => {
//     res = {
//       status: sinon.stub().returns({ json: sinon.spy() })
//     }
//     next = sinon.spy();
//   })
//   afterEach(() => {
//     delete process.env.JWT_SECRET;
//     delete process.env.JWT_EXP_DURATION;
//     sandbox.restore();
//   })
//   it('should return error when no token found', () => {
//     req = {
//       headers: {}
//     };
//     const jwtStub = sandbox.stub(jwt, 'verify');
//     validateToken(req, res, next);
//     sandbox.assert.calledOnce(res.status);
//     sandbox.assert.calledWith(res.status, 401);
//     sandbox.assert.notCalled(next);
//     sandbox.assert.notCalled(jwtStub);
//     sandbox.assert.calledOnce(res.status(401).json);
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ message: sinon.match.string }));
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ success: sinon.match.bool }));
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ success: false }));
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ message: Messages.ERROR_NO_TOKEN }));
//   });
//   it('should return error when invalid token is provided', () => {
//     req = {
//       headers: {
//         authorization: 'Bearer invalidTestToken'
//       }
//     };
//     process.env.JWT_SECRET = 'testKey';
//     validateToken(req, res, next);
//     sandbox.assert.calledOnce(res.status);
//     sandbox.assert.calledWith(res.status, 401);
//     sandbox.assert.notCalled(next);
//     sandbox.assert.calledOnce(res.status(401).json);
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ message: sinon.match.string }));
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ success: sinon.match.bool }));
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ success: false }));
//     sandbox.assert.calledWith(res.status(401).json, sinon.match({ message: Messages.ERROR_NOT_VALID_TOKEN }));
//   });
//   it('should validate token and proceed to next', () =>  {
//     process.env.JWT_SECRET = 'testKey';
//     process.env.JWT_EXP_DURATION = '24h';
//     const testToken = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXP_DURATION,
//     });
//     req = {
//       headers: {
//         authorization: `Bearer ${testToken}`
//       }
//     };
//     const jwtVerifySpy = sinon.spy(jwt, 'verify');
//     validateToken(req, res, next);
//     sandbox.assert.calledOnce(next);
//     sandbox.assert.calledOnce(jwtVerifySpy)
//     sandbox.assert.notCalled(res.status)
//   })
// });
