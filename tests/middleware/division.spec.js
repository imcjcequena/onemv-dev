/* eslint-disable */
import sinon from 'sinon';
import { expect } from 'chai';
import { division } from '../../middleware';
import { Messages } from '../../util';

const sandbox = sinon.createSandbox();

describe('-----division Middleware-----', () => {
  let req = { headers: {} }, res= {}, next;
  beforeEach(() => {
    res = {
      status: sinon.stub().returns({ json: sinon.spy() })
    }
    next = sinon.spy();
  });
  afterEach(() => {
    sandbox.restore();
    req = {};
  });
  it('should error when no x-division-id header', () => {
    const requestStub = sandbox.stub(require('request'), 'prototype');
    division(req, res, next);
    sandbox.assert.notCalled(next);
    sandbox.assert.notCalled(requestStub);
    sandbox.assert.calledOnce(res.status(401).json);
    sandbox.assert.calledWith(res.status(401).json, sinon.match({ message: sinon.match.string }));
    sandbox.assert.calledWith(res.status(401).json, sinon.match({ success: sinon.match.bool }));
    sandbox.assert.calledWith(res.status(401).json, sinon.match({ success: false }));
    sandbox.assert.calledWith(res.status(401).json, sinon.match({ message: Messages.ERROR_HEADER_DIVISION_ID }));
  });
  it('should error when not connected to Division API', () => {
    req = {
      headers: {
        'x-division-id': 'eccbf5123'
      }
    }
    process.env.DIVISIONS_API = "http://fakeUrl"
    // const cbStub = sinon.spy().withArgs({ code: 'ECONNREFUSED' }, '', 123123);
    const requestStub = sandbox.stub(require('request'), 'get');
    const cbStub = requestStub.callsArgWith(2, { code: 'ECONNREFUSED' });
    division(req, res, next);
    sandbox.assert.calledOnce(cbStub);
    sandbox.assert.notCalled(next);
    sandbox.assert.calledWith(res.status, 422);
    sandbox.assert.calledOnce(res.status(422).json);
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ message: sinon.match.string }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ success: sinon.match.bool }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ success: false }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ message: Messages.ERROR_DIVISION_API_NOT_FOUND }));
  })
  it('should error when error occured in Division API', () => {
    req = {
      headers: {
        'x-division-id': 'eccbf5123'
      }
    }
    process.env.DIVISIONS_API = "http://fakeUrl"
    // const cbStub = sinon.spy().withArgs({ code: 'ECONNREFUSED' }, '', 123123);
    const requestStub = sandbox.stub(require('request'), 'get');
    const cbStub = requestStub.callsArgWith(2, { code: 'sampleErrorCode' });
    division(req, res, next);
    sandbox.assert.calledOnce(cbStub);
    sandbox.assert.notCalled(next);
    sandbox.assert.calledWith(res.status, 422);
    sandbox.assert.calledOnce(res.status(422).json);
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ message: sinon.match.string }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ success: sinon.match.bool }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ success: false }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ message: Messages.ERROR_OCCURED_DIVISION_API }));
  })
  it('should error Division API returns success:false', () => {
    req = {
      headers: {
        'x-division-id': 'eccbf5123'
      }
    }
    process.env.DIVISIONS_API = "http://fakeUrl"
    // const cbStub = sinon.spy().withArgs({ code: 'ECONNREFUSED' }, '', 123123);
    const requestStub = sandbox.stub(require('request'), 'get');
    const cbStub = requestStub.callsArgWith(2, null, null, { success: false, message: "test error message" });
    division(req, res, next);
    sandbox.assert.calledOnce(cbStub);
    sandbox.assert.notCalled(next);
    sandbox.assert.calledWith(res.status, 422);
    sandbox.assert.calledOnce(res.status(422).json);
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ message: sinon.match.string }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ success: sinon.match.bool }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ success: false }));
    sandbox.assert.calledWith(res.status(422).json, sinon.match({ message: "test error message" }));
  })
  it('should proceed to next middleware', () => {
    req = {
      headers: {
        'x-division-id': 'eccbf5123'
      }
    }
    process.env.DIVISIONS_API = "http://fakeUrl"
    // const cbStub = sinon.spy().withArgs({ code: 'ECONNREFUSED' }, '', 123123);
    const requestStub = sandbox.stub(require('request'), 'get');
    const cbStub = requestStub.callsArgWith(2, null, null, { success: true, data: 123 });
    division(req, res, next);
    sandbox.assert.calledOnce(cbStub);
    sandbox.assert.calledOnce(next);
    sandbox.assert.notCalled(res.status);
    expect(req).to.have.property('division');
  });
});