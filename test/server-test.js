const assert = require('assert');
const request = require('request');
const app = require('../server');

const fixtures = require('./fixtures');

describe('Server', () => {

  before((done) => {
    this.port = 9876;

    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(() => {
    this.server.close();
  });

  it('should exist', () => {
    assert(app);
  });

  describe('GET /', () => {

    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });

    it('should have a body with the name of the application', (done) => {
      var title = app.locals.title;

      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(title),
               `"${response.body}" does not include "${title}".`);
        done();
      });
    });

  });

  describe('POST /trains', () => {

    beforeEach(() => {
      app.locals.trains = {};
    });

    it('should not return 404', (done) => {
      this.request.post('/trains', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should receive and restore data', (done) => {
      var payload = { train: fixtures.validTrain };

      this.request.post('/trains', { form: payload }, (error, response) => {
        if (error) { done(error); }

        var trainCount = Object.keys(app.locals.trains).length;

        assert.equal(trainCount, 1, `Expected 1 trains, found ${trainCount}`);

        done();
      });
    });

    it('should redirect the user to their new train', (done) => {
      var payload = { train: fixtures.validTrain };

      this.request.post('/trains', { form: payload }, (error, response) => {
        if (error) { done(error); }
        var newTrainId = Object.keys(app.locals.trains)[0];
        assert.equal(response.headers.location, '/trains/' + newTrainId);
        done();
      });
    });

  });

  describe('GET /trains/:id', () => {

    beforeEach(() => {
      app.locals.trains.testTrain = fixtures.validTrain;
    });

    it('should not return 404', (done) => {
      this.request.get('/trains/testTrain', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page that has the title of the train', (done) => {
      var train = app.locals.trains.testTrain;

      this.request.get('/trains/testTrain', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(train.name),
               `"${response.body}" does not include "${train.name}".`);
        done();
      });
    });

  });

});
