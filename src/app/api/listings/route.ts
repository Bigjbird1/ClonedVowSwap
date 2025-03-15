// src/app/api/listings/route.ts

// --------------------------------------------
// Fake data for testing
// import { NextResponse } from "next/server";
// import listings from "../../../exampleData/listings";
// import { NextRequest } from "next/server";

// export async function GET(request: NextRequest) {
//   return NextResponse.json(listings, { status: 200 });
// }
// --------------------------------------------

// Uncomment the below code after you have added your MONGODB_URI= in .env file.

// import { NextResponse } from "next/server";
// import connectMongo from "../../../../libs/connectMongo";
// import Listing from "../../../../models/listing";
// import { NextRequest } from "next/server";

// export async function GET(request: NextRequest) {
//   try {
//     // Connect to MongoDB
//     await connectMongo();

//     // Fetch all listings
//     const listings = await Listing.find();

//     // Return listings in JSON format with status 200
//     return NextResponse.json(listings, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching listings:", error);
//     // Return error message in JSON format with status 500
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// Dynamic Database Selection (Supports MongoDB & Supabase)
// This version dynamically selects the database based on the DATABASE_TYPE setting in the .env file.
// If DATABASE_TYPE is "supabase", it fetches listings from Supabase; otherwise, it defaults to MongoDB.
// --------------------------------------------
import { NextResponse } from "next/server";
import config from "../../../../config";
import { getAllSupabaseListings } from "../../../../models/supabaseListing";
import connectMongo from "../../../../libs/connectMongo";
import Listing from "../../../../models/listing";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (config.databaseType === "supabase") {
      // Fetch all listings from Supabase
      const listings = await getAllSupabaseListings();
      return NextResponse.json(listings, { status: 200 });
    } else {
      // Connect to MongoDB and fetch listings
      await connectMongo();
      const listings = await Listing.find();
      return NextResponse.json(listings, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
