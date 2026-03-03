const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpresError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware.js");

//Review Routes
//Post Route for creating a new review for a listing
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id); 
  if (!listing) {
    return res.status(404).send("Listing not found");
  } 
  const review = new Review(req.body.review);
  review.author = req.user._id;
  await review.save();
  listing.reviews.push(review);
  await listing.save();
  req.flash("success", "Review created successfully!");
  res.redirect(`/listings/${id}`);
})
);

//Delete Route for deleting a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;