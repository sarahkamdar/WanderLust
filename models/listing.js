const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://unsplash.com/photos/woman-standing-in-front-of-colorful-apartment-buildings-7jg7Y_Mlf2Q",
            set: (v) => v === "" ? "https://unsplash.com/photos/woman-standing-in-front-of-colorful-apartment-buildings-7jg7Y_Mlf2Q" : v
        }
    },
    price: Number,
    location: String,
    country: String
})

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;