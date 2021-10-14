/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { getId } = require("../utils/utils");
const db = require("../db/db");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const booksClone = db.map((booksObj) => {
        const booksObjClone = { ...booksObj };
        if (booksObjClone.comments) {
          booksObjClone.commentcount = booksObjClone.comments.length;
        } else {
          booksObjClone.commentcount = 0;
        }
        delete booksObjClone.comments;
        return booksObjClone;
      });
      res.json(booksClone);
    })

    .post(function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send("Invalid request");
      }
      const bookObj = { _id: getId(), title };
      db.push(bookObj);
      res.json(bookObj);
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      db.length = 0;
      res.send("complete delete successful");
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const bookIndex = db.findIndex((bookObj) => bookObj._id === bookid);
      if (bookIndex < 0) {
        return res.send("no book exists");
      }

      const booksObjClone = { ...db[bookIndex] };
      if (!booksObjClone.comments) {
        booksObjClone.comments = [];
      }

      res.json(booksObjClone);
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment.trim()) {
        return res.send("missing required field comment");
      }
      const bookIndex = db.findIndex((bookObj) => bookObj._id === bookid);
      if (bookIndex < 0) {
        return res.send("no book exists");
      }
      if (!db[bookIndex].comments) {
        db[bookIndex].comments = [comment];
      } else {
        db[bookIndex].comments.push(comment);
      }
      return res.json(db[bookIndex]);
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      const bookIndex = db.findIndex((bookObj) => bookObj._id === bookid);
      if (bookIndex < 0) {
        return res.send("no book exists");
      }
      db.splice(bookIndex, 1);
      res.send("delete successful");
    });
};
