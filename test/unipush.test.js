'use strict';

const mock = require('egg-mock');

describe('test/unipush.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/unipush-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, unipush')
      .expect(200);
  });
});
