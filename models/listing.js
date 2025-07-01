const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingschema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: {
      filename: String,
      url: String,
    },
    default: {
      filename: "defaultimage",
      url: "https://images.unsplash.com/photo-1713365963723-655fa464b681?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    set: (v) => {
      // Check if v is an object and has url property, else use default
      if (!v || typeof v !== "object" || !v.url) {
        return {
          filename: "defaultimage",
          url: "https://images.unsplash.com/photo-1713365963723-655fa464b681?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        };
      }
      // If url is empty string, replace with default
      if (v.url === "") {
        return {
          filename: "defaultimage",
          url: "https://images.unsplash.com/photo-1713365963723-655fa464b681?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        };
      }
      return v; // otherwise keep the value
    },
  },
  price: Number,
  location: String,
  country: String,
});

const Listing = mongoose.model("Listing", listingschema);
module.exports = Listing;
