const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});

app.get("/listings", async(req,res) => {
    const alllistings = await Listing.find({});
    res.render("./listings/index.ejs", {alllistings})
});

//New Route (MUST come before :id route)
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
})

//Create Route
app.post("/listings", async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Listing data:", req.body.listing);
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

//Show Route (MUST come after /listings/new)
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});


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
})

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

