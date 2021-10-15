/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   ----[EXAMPLE TEST]----
   Each test should completely test the response of the API end-point including response status code!
  
 
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });

  ----[END of EXAMPLE TEST]----
  */

  suite("Routing tests", function () {
    let _id;
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Testing code" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              _id = res.body._id;
              assert.hasAllKeys(res.body, ["_id", "title"]);
              assert.equal(res.body.title, "Testing code");
            });
          done();
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isString(res.body);
              assert.equal(res.body, "missing required field title");
            });
          done();
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(Array.isArray(res.body), true);
            res.body.forEach((bookObj) => {
              assert.isString(bookObj._id);
              assert.isString(bookObj.title);
              assert.isNumber(bookObj.commentcount);
              assert.isAtLeast(bookObj.commentcount, 0);
            });
          });
        done();
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .get("/api/books/invalid_id")
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, "no book exists");
          });
        done();
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get(`/api/books/${_id}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.hasAllKeys(res.body, ["_id", "title", "comments"]);
            assert.isString(res.body._id);
            assert.isString(res.body.title);
            assert.isArray(res.body.comments);
            assert.isAtLeast(res.body.comments.length, 0);
            res.body.comments.forEach((comment) => {
              assert.isString(comment);
            });
          });
        done();
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .post(`/api/books/${_id}`)
            .send({ comment: "Test comment" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isObject(res.body);
              assert.hasAllKeys(res.body, ["_id", "title", "comments"]);
              assert.isEqual(res.body._id, _id);
              assert.isString(res.body.title);
              assert.isArray(res.body.comments);
              assert.include(res.body.comments, "Test comment");
            });
          done();
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .post(`/api/books/${_id}`)
            .send({})
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isString(res.body);
              assert.equal(res.body, "missing required field comment");
            });
          done();
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .post("/api/books/non-existent-id")
            .send({ comment: "Test comment" })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isString(res.body);
              assert.equal(res.body, "no book exists");
            });
          done();
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete(`/api/books/${_id}`)
          .end((err, res) => {
            assert.isEqual(res.status, 200);
            assert.isString(res.body);
            assert.isEqual(res.body, "delete successful");
          });
        done();
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/non-existent-id")
          .end((err, res) => {
            assert.isEqual(res.status, 200);
            assert.isString(res.body);
            assert.isEqual(res.body, "no book exists");
          });
        done();
      });
    });
  });
});
