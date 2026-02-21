const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { error } = require("console");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpresError.js");
const { listingSchema } = require("./schema.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});

const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error) {
    let msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};


app.get("/listings", wrapAsync(async(req,res) => {
    const alllistings = await Listing.find({});
    res.render("./listings/index.ejs", {alllistings})
})
);

//New Route (MUST come before :id route)
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
})

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})
);

//Show Route (MUST come after /listings/new)
app.get("/listings/:id", wrapAsync(async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid listing ID");
  }
})
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid listing ID");
  }
})
);

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
})
);

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
})
);


// app.get("/samplelistings", async(req,res) => {
//     let samplelisting = new Listing({
//         title: "Beautiful Beach House",
//         description: "A stunning beach house with breathtaking ocean views, modern amenities, and direct access to the sandy shores. Perfect for a relaxing getaway.",
//         price: 350,
//         location: "Malibu, California",
//         country: "USA"
//     });
//     await samplelisting.save();
//     console.log("Sample listing saved to database");
//     res.send("Sample listing saved to database");
// })

app.get("/", (req,res) => {
    res.send("Hi, i am root");
});

app.all("*path", (req,res,next) => {
  next(new ExpressError(404,"Page Not Found"));
});


app.use((err, req, res, next) => {
  let{ statusCode = 500, message="Something went wrong"} = err;  
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

