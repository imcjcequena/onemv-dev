/* eslint-disable */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app';
import { Messages } from '../../util';
import { Trip, TripRating } from '../../models';

chai.use(chaiHttp);
chai.should();

const fakePassengerId = 9999999;
const fakeTripId = 888888;
const fakeRating = 2

describe('----Trips Route----', () => {
  describe('/trips/:tripId', () => {
    beforeEach((done) => {
      Trip.create({
        trip_id: fakeTripId,
        passenger_id: fakePassengerId,
        trip_status: "Completed"
      }).then(() => done());
    });
    afterEach((done) => {
      Trip.remove({
        trip_id: fakeTripId,
      }).then(() => done());
    });
    it('on success getting the passenger\'s trips', (done) => {
      chai.request(app)
        .get(`/trips/${fakeTripId}`)
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('success');
          res.body.success.should.be.equal(true);
          res.body.message.should.be.equal(Messages.SUCCESS_FIND_TRIP);
          res.body.data.should.be.a('array');
          done();
        });
    });
    it('on failed getting the passenger\'s trips', (done) => {
      chai.request(app)
        .get('/trips/1111111111111')
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('success');
          res.body.success.should.be.equal(true);
          res.body.message.should.be.equal(Messages.SUCCESS_FIND_TRIP);
          res.body.data.should.be.a('array');
          res.body.data.length.should.be.equal(0)
          done();
        });
    });
  });
  describe('/trips/:id/ratings', () => {
    beforeEach((done) => {
      TripRating.create({
        tripId: fakeTripId,
        ratings: [
          {
            passengerId: fakePassengerId,
            rating: fakeRating
          }
        ]
      }).then(() => done());
    });
    afterEach((done) => {
      TripRating.remove({
        tripId: fakeTripId,
      }).then(() => done());
    });
    it('on success get trip ratings', (done) => {
      chai.request(app)
        .get('/trips/888888/ratings')
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('success');
          res.body.success.should.be.equal(true);
          res.body.message.should.be.equal(Messages.SUCCESS_FIND_TRIP);
          res.body.data.should.be.a('object');
          res.body.data.should.have.property('ratings');
          res.body.data.should.have.property('tripId');
          res.body.data.ratings.should.be.a('array');
          res.body.data.tripId.should.be.equal(888888);
          done();
        });
    })
    it('on failed get trip ratings', (done) => {
      chai.request(app)
        .get('/trips/1111111111/ratings')
        .end((error, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.should.have.property('success');
          res.body.success.should.be.equal(false);
          res.body.message.should.be.equal(Messages.ERROR_TRIP_DOESNT_EXIST);
          done();
        });
    })
  });
  describe('/trips/:id/ratings/:ratingId', () => {
    let id;
    beforeEach((done) => {
      TripRating.create({
        tripId: fakeTripId,
        ratings: [
          {
            passengerId: fakePassengerId,
            rating: fakeRating
          }
        ]
      }).then((result) => {
        id = result.ratings[0]._id;
        done();
      });
    });
    afterEach((done) => {
      TripRating.remove({
        tripId: fakeTripId,
      }).then(() => done());
      id = null;
    });
    it('on success get specific ratings', (done) => {
      chai.request(app)
        .get(`/trips/${fakeTripId}/ratings/${id}`)
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.SUCCESS_FIND_RATING);
          res.body.success.should.be.equal(true);
          done();
        });
    })
    it('on fauled get specific ratings', (done) => {
      chai.request(app)
        .get(`/trips/${fakeTripId}/ratings/111111111111`)
        .end((error, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.ERROR_RATING_DOESNT_EXIST);
          res.body.success.should.be.equal(false);
          done();
        });
    })
  });
  describe('/trips/:id/ratings', () => {
    beforeEach((done) => {
      TripRating.create({
        tripId: fakeTripId,
      }).then(() => {
        Trip.create({
          trip_id: fakeTripId,
          passenger_id: fakePassengerId,
          trip_status: "Completed"
        }).then(() => done());
      });
    });
    afterEach((done) => {
      TripRating.remove({
        tripId: fakeTripId,
      }).then(() => {
        Trip.remove({ trip_id: fakeTripId }).then(() => done());
      });
    });
    it('should error when no Passenger ID provided', (done) => {
      chai.request(app)
        .put(`/trips/${fakeTripId}/ratings`)
        .send({ rating: 1 })
        .end((error, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.ERROR_MISSING_PARAMETERS);
          res.body.success.should.be.equal(false);
          done();
        });
    });
    it('should error when no Ratings provided', (done) => {
      chai.request(app)
        .put(`/trips/${fakeTripId}/ratings`)
        .send({ passengerId: 111111 })
        .end((error, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.ERROR_MISSING_PARAMETERS);
          res.body.success.should.be.equal(false);
          done();
        });
    });
    it('should create new ratings when no ratings', (done) => {
      chai.request(app)
        .put(`/trips/${fakeTripId}/ratings`)
        .send({ passengerId: fakePassengerId, rating: 2 })
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.SUCCESS_TRIP_RATING_CREATED);
          res.body.success.should.be.equal(true);
          res.body.data.should.have.property('ratings');
          res.body.data.ratings.should.be.a('array');
          res.body.data.ratings.should.be.lengthOf(1);
          done();
        });
    });
    it('should add new ratings when ratings is already existing',  (done) => {
      const callback = () => {
        chai.request(app)
        .put(`/trips/${fakeTripId}/ratings`)
        .send({ passengerId: fakePassengerId, rating: 2 })
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.SUCCESS_TRIP_RATING_CREATED);
          res.body.success.should.be.equal(true);
          res.body.data.should.have.property('ratings');
          res.body.data.ratings.should.be.a('array');
          res.body.data.ratings.should.be.lengthOf(2);
          done();
        });
      }
      TripRating.updateOne({ tripId: fakeTripId }, { ratings: [{
        passengerId: fakePassengerId + 2,
        rating: fakeRating
        }]
      }).then(callback);
      
    });
    it('should error when passenger already rated', (done) => {
      const callback = () => {
        chai.request(app)
        .put(`/trips/${fakeTripId}/ratings`)
        .send({ passengerId: fakePassengerId, rating: 2 })
        .end((error, res) => {
          console.log(res.body)
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.message.should.be.equal(Messages.ERROR_PASSENGER_ALREADY_RATED);
          res.body.success.should.be.equal(false);
          done();
        });
      }
      TripRating.updateOne({ tripId: fakeTripId }, { ratings: [{
        passengerId: fakePassengerId,
        rating: fakeRating
        }]
      }).then(callback);
    });
  });
});
