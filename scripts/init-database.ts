import { createClient } from "@supabase/supabase-js"

// This script is meant to be run locally to initialize your Supabase database
// You would run it with: npx tsx scripts/init-database.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.API_KEY! // Use your service role key for this script

async function initDatabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or key. Please set the environment variables.")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("Creating tables...")

  // Create products table
  const { error: productsError } = await supabase.rpc("create_products_table", {})
  if (productsError) {
    console.error("Error creating products table:", productsError)
  } else {
    console.log("Products table created successfully")
  }

  // Create customers table
  const { error: customersError } = await supabase.rpc("create_customers_table", {})
  if (customersError) {
    console.error("Error creating customers table:", customersError)
  } else {
    console.log("Customers table created successfully")
  }

  // Create addresses table
  const { error: addressesError } = await supabase.rpc("create_addresses_table", {})
  if (addressesError) {
    console.error("Error creating addresses table:", addressesError)
  } else {
    console.log("Addresses table created successfully")
  }

  // Create orders table
  const { error: ordersError } = await supabase.rpc("create_orders_table", {})
  if (ordersError) {
    console.error("Error creating orders table:", ordersError)
  } else {
    console.log("Orders table created successfully")
  }

  // Create order_items table
  const { error: orderItemsError } = await supabase.rpc("create_order_items_table", {})
  if (orderItemsError) {
    console.error("Error creating order_items table:", orderItemsError)
  } else {
    console.log("Order items table created successfully")
  }

  console.log("Database initialization complete")
}

initDatabase()
