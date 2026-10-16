const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

function getListingImage(file) {
    const url = file.secure_url || file.url || file.path;
    const filename = file.public_id || file.filename;

    if (!url || !filename) {
        throw new ExpressError(502, "Image upload did not return a usable image URL.");
    }

    return { url, filename };
}

module.exports.index = async (req,res)=>{
        const allListings =  await Listing.find({});
        res.render("listings/index.ejs",{ allListings });
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req,res)=>{
     let { id } = req.params;
    //   if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    //     // no res.render or res.redirect yet → safe to throw
    //     throw new ExpressError(400, "Invalid listing ID format");
    // }

     const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
     if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
     }
   res.render("listings/show.ejs",{ listing });
};

module.exports.createListing = async (req,res,next)=>{
         if (!req.file) {
            throw new ExpressError(400, "Please upload an image for this listing.");
         }
         const newListing =  new Listing(req.body.listing);
         newListing.owner = req.user._id;
         newListing.image = getListingImage(req.file);
         await newListing.save();
         req.flash("success","New Listing Created");
         res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=>{
     let { id } = req.params;
     const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
     }
     let originalImageUrl = listing.image && listing.image.url
        ? listing.image.url
        : "/images/listing-placeholder.svg";
     originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
     res.render("listings/edit.ejs",{ listing,originalImageUrl });
};

module.exports.updatetListing = async (req,res)=>{
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    if(typeof req.file !== "undefined"){
        listing.image = getListingImage(req.file);
        await listing.save();
    }
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success","Listing deleted");
    res.redirect("/listings");
};