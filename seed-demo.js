import { createClient } from '@supabase/supabase-js'

// Using the keys provided earlier in the chat
const supabaseUrl = 'https://pcevcippzwnsmrsbiaqc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZXZjaXBwenduc21yc2JpYXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MTY2NTAsImV4cCI6MjA5NTk5MjY1MH0.tcB2OrDnudBoGl50j3zpUdu0M-eP5Xty-JwARFx_vLA'
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log("🚀 Creating demo account...")
  
  // 1. Register Owner
  const email = `demo${Math.floor(Math.random() * 10000)}@test.com`
  const password = "password123"
  
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authErr) {
    console.error("Error creating owner:", authErr.message)
    return
  }

  const userId = authData.user.id
  console.log(`✅ Owner created: Email: ${email} | Password: ${password}`)

  // 2. Create Property
  const { data: prop, error: propErr } = await supabase
    .from('properties')
    .insert([{ owner_id: userId, name: "Sunset Apartments", address: "123 Beach Road" }])
    .select()
    .single()
    
  if (propErr) { console.error("Error property:", propErr); return }
  
  // 3. Create House
  const { data: house, error: houseErr } = await supabase
    .from('houses')
    .insert([{ owner_id: userId, property_id: prop.id, number: "101", status: "occupied" }])
    .select()
    .single()

  if (houseErr) { console.error("Error house:", houseErr); return }

  // 4. Create Tenant
  const secretCode = "DEMO1"
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .insert([{
      owner_id: userId,
      house_id: house.id,
      name: "John Doe",
      phone: "1234567890",
      monthly_rent: 15000,
      secret_code: secretCode
    }])
    .select()
    .single()

  if (tenantErr) { console.error("Error tenant:", tenantErr); return }

  console.log(`✅ Tenant created: Name: John Doe | Secret Code: ${secretCode}`)
  console.log("\n==================================")
  console.log("🎉 SUCCESS! You can now test both roles:")
  console.log("==================================")
  console.log(`OWNER LOGIN:`)
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`\nTENANT LOGIN (at /tenant):`)
  console.log(`Secret Code: ${secretCode}`)
}

seed()
