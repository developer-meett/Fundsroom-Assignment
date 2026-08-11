import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.challanItem.deleteMany()
  await prisma.challan.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // 1. Seed Users (4 roles)
  const passwordHash = await bcrypt.hash('password123', 10)
  
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@erp.com', password_hash: passwordHash, role: 'ADMIN' }
  })
  const sales = await prisma.user.create({
    data: { name: 'Sales User', email: 'sales@erp.com', password_hash: passwordHash, role: 'SALES' }
  })
  const warehouse = await prisma.user.create({
    data: { name: 'Warehouse User', email: 'warehouse@erp.com', password_hash: passwordHash, role: 'WAREHOUSE' }
  })
  const accounts = await prisma.user.create({
    data: { name: 'Accounts User', email: 'accounts@erp.com', password_hash: passwordHash, role: 'ACCOUNTS' }
  })
  
  // 2. Seed Customers (5)
  await prisma.customer.createMany({
    data: [
      { name: 'Acme Corp', mobile: '555-0101', email: 'contact@acme.com', business_name: 'Acme Corporation', gst_number: 'GST101', customer_type: 'B2B', address: '123 Acme St' },
      { name: 'Globex Inc', mobile: '555-0102', email: 'info@globex.com', business_name: 'Globex Inc', gst_number: 'GST102', customer_type: 'B2B', address: '456 Globex Ave' },
      { name: 'Soylent Corp', mobile: '555-0103', email: 'sales@soylent.com', business_name: 'Soylent Corp', gst_number: 'GST103', customer_type: 'B2B', address: '789 Soylent Blvd' },
      { name: 'Initech', mobile: '555-0104', email: 'hello@initech.com', business_name: 'Initech', gst_number: 'GST104', customer_type: 'B2B', address: '321 Initech Pkwy' },
      { name: 'Umbrella Corp', mobile: '555-0105', email: 'contact@umbrella.com', business_name: 'Umbrella Corporation', gst_number: 'GST105', customer_type: 'B2B', address: '654 Umbrella Way' }
    ]
  })

  // 3. Seed Products (8)
  const products = [
    { name: 'Widget A', sku: 'WID-A-001', category: 'Widgets', unit_price: 15.50, current_stock: 100, minimum_stock: 20, warehouse_location: 'A1-01' },
    { name: 'Widget B', sku: 'WID-B-002', category: 'Widgets', unit_price: 25.00, current_stock: 150, minimum_stock: 25, warehouse_location: 'A1-02' },
    { name: 'Sprocket X', sku: 'SPR-X-001', category: 'Sprockets', unit_price: 45.00, current_stock: 50, minimum_stock: 10, warehouse_location: 'B2-01' },
    { name: 'Sprocket Y', sku: 'SPR-Y-002', category: 'Sprockets', unit_price: 60.00, current_stock: 30, minimum_stock: 10, warehouse_location: 'B2-02' },
    { name: 'Cog 100', sku: 'COG-100', category: 'Cogs', unit_price: 5.25, current_stock: 500, minimum_stock: 100, warehouse_location: 'C3-01' },
    { name: 'Cog 200', sku: 'COG-200', category: 'Cogs', unit_price: 8.50, current_stock: 450, minimum_stock: 100, warehouse_location: 'C3-02' },
    { name: 'Pulley Small', sku: 'PUL-S', category: 'Pulleys', unit_price: 12.00, current_stock: 80, minimum_stock: 15, warehouse_location: 'D4-01' },
    { name: 'Pulley Large', sku: 'PUL-L', category: 'Pulleys', unit_price: 22.00, current_stock: 60, minimum_stock: 15, warehouse_location: 'D4-02' },
  ]
  
  await prisma.product.createMany({ data: products })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
