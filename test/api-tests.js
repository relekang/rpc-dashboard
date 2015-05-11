var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var api = require('../src/api');

expect = chai.expect;

describe('api-handlers', function() {
  describe('peersComparator(a, b)', function() {
    it('should return -1 if a is less than b', function() {
      expect(api.peersComparator('333333', 'bbbbbb')).to.equal(-1, 'Wrong output for a: 333333, b: bbbbbb');
      expect(api.peersComparator('bbbbba', 'bbbbbb')).to.equal(-1, 'Wrong output for a: bbbbba, b: bbbbbb');
      expect(api.peersComparator('000000', 'bbbbbb')).to.equal(-1, 'Wrong output for a: 000000, b: bbbbbb');
    });

    it('should return 1 if a is greater than b', function() {
      expect(api.peersComparator('bbbbbb', '333333')).to.equal(1, 'Wrong output for a: bbbbbb, b: 333333');
      expect(api.peersComparator('333334', '333333')).to.equal(1, 'Wrong output for a: 333334, b: 333333');
      expect(api.peersComparator('888888', '333333')).to.equal(1, 'Wrong output for a: 888888, b: 333333');
    });

    it('should return 0 if a is equal to b', function() {
      expect(api.peersComparator('333333', '333333')).to.equal(0);
      expect(api.peersComparator('aaaaaa', 'aaaaaa')).to.equal(0);
      expect(api.peersComparator('000000', '000000')).to.equal(0);
    });

    it('should sort correctly when used with Array.sort()', function() {
      expect(
        ['222222', 'cccccc', '333333', '000000'].sort(api.peersComparator)
      ).to.eql(
        ['000000', '222222', '333333', 'cccccc']
      );

      expect(
        ['222222', 'cccccc', '333333', '000000'].sort(api.peersComparator)
      ).to.eql(
        ['000000', '222222', '333333', 'cccccc']
      );
    });
  });
});
