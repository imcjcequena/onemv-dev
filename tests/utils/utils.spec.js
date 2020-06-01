/* eslint-disable */
import sinon from 'sinon';
import { getTodayFromDivision } from '../../util';
import chaiPromise from 'chai-as-promised';
import chai, { expect } from 'chai';
chai.use(chaiPromise)
const sandbox = sinon.createSandbox();

describe('----Utilities----', () => {
  describe('getTodayFromDivision', () => {
    const divisionId = '54';
    beforeEach(() => {
      process.env.DIVISIONS_API = "http://fakeUrl";
    });
    afterEach(function () {
      // completely restore all fakes created through the sandbox
      sandbox.restore();
      delete process.env.DIVISIONS_API;
    });
    it('should reject when not connected to Division API', () => {
      const code = 'ECONNREFUSED';
      sandbox.stub(require('request'), 'get').callsArgWith(2, { code });
      return expect(getTodayFromDivision(divisionId)).to.be.rejectedWith(code);
    })
    it('should error when `result.success === false`', () => {
      const message = 'Test Message for Fail';
      sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { success: false, message });
      return expect(getTodayFromDivision(divisionId)).to.be.rejectedWith(message);
    })
    it('should resolve data', () => {
      const data = 20190723;
      sandbox.stub(require('request'), 'get').callsArgWith(2, null, null, { success: true, data });
      return expect(getTodayFromDivision(divisionId)).become(data);
    });
  })
});
