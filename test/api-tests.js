import chai from 'chai';
import cap from 'chai-as-promised';
import api from '../src/api';

chai.use(cap);
var expect = chai.expect;

describe('api-handlers', () => {
  describe('peersComparator(a, b)', () => {
    it('should return -1 if a is less than b', () => {
      expect(api.peersComparator('333333', 'bbbbbb')).to.equal(-1, 'Wrong output for a: 333333, b: bbbbbb');
      expect(api.peersComparator('bbbbba', 'bbbbbb')).to.equal(-1, 'Wrong output for a: bbbbba, b: bbbbbb');
      expect(api.peersComparator('000000', 'bbbbbb')).to.equal(-1, 'Wrong output for a: 000000, b: bbbbbb');
    });

    it('should return 1 if a is greater than b', () => {
      expect(api.peersComparator('bbbbbb', '333333')).to.equal(1, 'Wrong output for a: bbbbbb, b: 333333');
      expect(api.peersComparator('333334', '333333')).to.equal(1, 'Wrong output for a: 333334, b: 333333');
      expect(api.peersComparator('888888', '333333')).to.equal(1, 'Wrong output for a: 888888, b: 333333');
    });

    it('should return 0 if a is equal to b', () => {
      expect(api.peersComparator('333333', '333333')).to.equal(0);
      expect(api.peersComparator('aaaaaa', 'aaaaaa')).to.equal(0);
      expect(api.peersComparator('000000', '000000')).to.equal(0);
    });

    it('should sort correctly when used with Array.sort()', () => {
      expect(
        ['222222', 'cccccc', '333333', '000000'].sort(api.peersComparator)
      ).to.eql(
        ['000000', '222222', '333333', 'cccccc']
      );

      expect(
        ['592667', 'e1f4a5', '7091c1', '02197c', 'e8b4ff', '3adbd2', '42cc0b', 'bf9dd2'].sort(api.peersComparator)
      ).to.eql(
        ['02197c', '3adbd2', '42cc0b', '592667', '7091c1', 'bf9dd2', 'e1f4a5', 'e8b4ff']
      );
    });
  });
});
