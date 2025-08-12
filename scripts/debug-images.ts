import fs from 'fs'
import path from 'path'

console.log('🔍 Debugging Image Loading Issues')
console.log('==================================')

const publicDir = path.join(process.cwd(), 'public')
const imagesDir = path.join(publicDir, 'images')
const clubDir = path.join(imagesDir, 'club')
const weeklyWineDir = path.join(imagesDir, 'weekly-wine')

console.log('\n📁 Checking directory structure:')
console.log('Public directory:', fs.existsSync(publicDir) ? '✅' : '❌')
console.log('Images directory:', fs.existsSync(imagesDir) ? '✅' : '❌')
console.log('Club directory:', fs.existsSync(clubDir) ? '✅' : '❌')
console.log('Weekly-wine directory:', fs.existsSync(weeklyWineDir) ? '✅' : '❌')

console.log('\n📋 Club images:')
if (fs.existsSync(clubDir)) {
  const clubFiles = fs.readdirSync(clubDir)
  clubFiles.forEach(file => {
    const filePath = path.join(clubDir, file)
    const stats = fs.statSync(filePath)
    console.log(`  ${file}: ${stats.size} bytes`)
  })
}

console.log('\n📋 Weekly-wine images:')
if (fs.existsSync(weeklyWineDir)) {
  const weeklyWineFiles = fs.readdirSync(weeklyWineDir)
  weeklyWineFiles.forEach(file => {
    const filePath = path.join(weeklyWineDir, file)
    const stats = fs.statSync(filePath)
    console.log(`  ${file}: ${stats.size} bytes`)
  })
}

console.log('\n🔗 Image URLs that should work:')
const expectedImages = [
  '/images/club/tinto.jpg',
  '/images/club/blanco.jpg',
  '/images/club/mixto.jpg',
  '/images/club/naranjo.jpg',
  '/images/weekly-wine/tinto1.jpg',
  '/images/weekly-wine/blanco2.jpg',
  '/images/weekly-wine/mixto3.jpg',
  '/images/weekly-wine/naranjo1.jpg'
]

expectedImages.forEach(imgPath => {
  const fullPath = path.join(publicDir, imgPath)
  console.log(`  ${imgPath}: ${fs.existsSync(fullPath) ? '✅' : '❌'}`)
})

console.log('\n💡 Possible issues:')
console.log('1. Next.js Image component configuration')
console.log('2. Image optimization settings')
console.log('3. File permissions')
console.log('4. Browser cache')

console.log('\n🔧 Solutions to try:')
console.log('1. Clear browser cache')
console.log('2. Check browser console for errors')
console.log('3. Verify Next.js config for images')
console.log('4. Try using regular <img> tag instead of Next.js Image') 