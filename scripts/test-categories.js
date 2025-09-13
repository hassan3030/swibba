#!/usr/bin/env node

// Test script to debug category filtering issues
// Run with: node scripts/test-categories.js

import { categoriesName } from '../lib/data.js'

console.log('=== CATEGORY FILTERING DEBUG ===\n')

console.log('1. Available categories from data.js:')
categoriesName.forEach((cat, index) => {
  console.log(`   ${index + 1}. ${cat}`)
})

console.log('\n2. Category normalization test:')
const testCategories = ['Electronics', 'FASHION', 'books', 'Toys']
testCategories.forEach(cat => {
  const normalized = cat.toLowerCase()
  const isValid = categoriesName.includes(normalized)
  console.log(`   "${cat}" -> "${normalized}" (Valid: ${isValid})`)
})

console.log('\n3. Recommendations:')
console.log('   - Ensure your database stores categories in lowercase')
console.log('   - Check that category links use exact names from categoriesName array')
console.log('   - Verify API responses include category field')
console.log('   - Look for console logs when filtering by category')

export { categoriesName }
