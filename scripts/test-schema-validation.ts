#!/usr/bin/env tsx

/**
 * Script to validate structured data schemas for SEO
 * Tests Local Business and Organization schemas for correctness
 */

import { generateLocalBusinessSchema, generateOrganizationSchema } from '../lib/seo-utils'

interface SchemaValidationResult {
  schema: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

function validateSchema(schema: any, schemaName: string): SchemaValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  const requiredFields = ['@context', '@type', 'name', 'url']

  for (const field of requiredFields) {
    if (!schema[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Context validation
  if (schema['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context, should be "https://schema.org"')
  }

  // Type-specific validation
  if (schemaName === 'LocalBusiness') {
    validateLocalBusinessSchema(schema, errors, warnings)
  } else if (schemaName === 'Organization') {
    validateOrganizationSchema(schema, errors, warnings)
  }

  // URL validation
  if (schema.url && !isValidUrl(schema.url)) {
    errors.push('Invalid URL format')
  }

  // Image validation
  if (schema.logo?.url && !isValidUrl(schema.logo.url)) {
    warnings.push('Logo URL should be absolute')
  }

  return {
    schema: schemaName,
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function validateLocalBusinessSchema(schema: any, errors: string[], warnings: string[]) {
  // Check if @type includes required business types
  const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']]

  if (!types.includes('LocalBusiness') && !types.includes('Organization')) {
    errors.push('@type should include "LocalBusiness" or "Organization"')
  }

  // Address validation
  if (!schema.address) {
    errors.push('LocalBusiness schema requires an address')
  } else {
    if (!schema.address.addressCountry) {
      errors.push('Address missing addressCountry')
    }
    if (schema.address.addressCountry !== 'AR') {
      warnings.push('addressCountry should be "AR" for Argentina')
    }
  }

  // Geographic coordinates
  if (!schema.geo) {
    warnings.push('Geographic coordinates (geo) recommended for local business')
  } else {
    if (!schema.geo.latitude || !schema.geo.longitude) {
      errors.push('Geo coordinates missing latitude or longitude')
    }
  }

  // Service area validation
  if (!schema.areaServed) {
    warnings.push('areaServed recommended to specify service areas')
  }

  // Business hours
  if (!schema.openingHours) {
    warnings.push('openingHours recommended for local business')
  }

  // Contact information
  if (!schema.telephone && !schema.email) {
    warnings.push('Contact information (telephone or email) recommended')
  }
}

function validateOrganizationSchema(schema: any, errors: string[], warnings: string[]) {
  // Logo validation
  if (!schema.logo) {
    warnings.push('Organization logo recommended')
  }

  // Contact point validation
  if (schema.contactPoint) {
    if (!schema.contactPoint.contactType) {
      errors.push('ContactPoint missing contactType')
    }
    if (!schema.contactPoint.areaServed) {
      warnings.push('ContactPoint should specify areaServed')
    }
  }

  // Knowledge validation
  if (!schema.knowsAbout || !Array.isArray(schema.knowsAbout)) {
    warnings.push('knowsAbout array recommended for expertise areas')
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function printValidationResults(results: SchemaValidationResult[]) {
  console.log('\n🔍 Schema Validation Results\n')
  console.log('='.repeat(50))

  for (const result of results) {
    console.log(`\n📋 ${result.schema} Schema`)
    console.log('-'.repeat(30))

    if (result.isValid) {
      console.log('✅ Valid - No critical errors found')
    } else {
      console.log('❌ Invalid - Critical errors found')
    }

    if (result.errors.length > 0) {
      console.log('\n🚨 Errors:')
      result.errors.forEach(error => console.log(`   • ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      result.warnings.forEach(warning => console.log(`   • ${warning}`))
    }
  }

  const allValid = results.every(r => r.isValid)
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)

  console.log('\n' + '='.repeat(50))
  console.log(`📊 Summary: ${allValid ? '✅ All schemas valid' : '❌ Some schemas have errors'}`)
  console.log(`   Errors: ${totalErrors}`)
  console.log(`   Warnings: ${totalWarnings}`)

  if (allValid) {
    console.log('\n🎉 Your structured data is ready for search engines!')
    console.log('💡 Consider testing with Google\'s Rich Results Test:')
    console.log('   https://search.google.com/test/rich-results')
  }
}

// Main validation function
async function validateAllSchemas() {
  try {
    console.log('🚀 Starting Schema Validation for Vino Rodante SEO...')

    // Generate schemas
    const localBusinessSchema = generateLocalBusinessSchema()
    const organizationSchema = generateOrganizationSchema()

    // Validate schemas
    const results = [
      validateSchema(localBusinessSchema, 'LocalBusiness'),
      validateSchema(organizationSchema, 'Organization')
    ]

    // Print results
    printValidationResults(results)

    // Additional checks
    console.log('\n🔧 Additional SEO Checks:')
    console.log('-'.repeat(30))

    // Check for Argentine-specific elements
    const hasArgentineTargeting = localBusinessSchema.address?.addressCountry === 'AR'
    console.log(`🇦🇷 Argentine targeting: ${hasArgentineTargeting ? '✅' : '❌'}`)

    // Check for wine-specific content
    const hasWineContent = JSON.stringify(localBusinessSchema).toLowerCase().includes('vino')
    console.log(`🍷 Wine-specific content: ${hasWineContent ? '✅' : '❌'}`)

    // Check for local business features
    const hasServiceArea = Array.isArray(localBusinessSchema.areaServed)
    console.log(`📍 Service areas defined: ${hasServiceArea ? '✅' : '❌'}`)

    // Check for e-commerce features
    const hasOfferCatalog = localBusinessSchema.hasOfferCatalog
    console.log(`🛒 E-commerce catalog: ${hasOfferCatalog ? '✅' : '❌'}`)

    console.log('\n✨ Schema validation completed!')

  } catch (error) {
    console.error('❌ Error during schema validation:', error)
    process.exit(1)
  }
}

// Run validation if called directly
if (require.main === module) {
  validateAllSchemas()
}

export { validateAllSchemas, validateSchema }