import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('🔧 Diagnosing Next.js Cache Issues')
console.log('==================================')

const projectRoot = process.cwd()
const nextDir = path.join(projectRoot, '.next')
const nodeModulesDir = path.join(projectRoot, 'node_modules')

console.log('\n📁 Checking cache directories:')
console.log('Project root:', projectRoot)
console.log('.next directory:', fs.existsSync(nextDir) ? '✅' : '❌')
console.log('node_modules:', fs.existsSync(nodeModulesDir) ? '✅' : '❌')

if (fs.existsSync(nextDir)) {
  const nextStats = fs.statSync(nextDir)
  console.log('.next size:', Math.round(nextStats.size / 1024 / 1024), 'MB')
  console.log('.next modified:', nextStats.mtime)
}

console.log('\n🔍 Common causes of cache corruption:')

const causes = [
  '1. Multiple Next.js processes running simultaneously',
  '2. File system changes during build',
  '3. Memory issues during development',
  '4. Port conflicts',
  '5. Incomplete builds interrupted by Ctrl+C',
  '6. File watcher issues on macOS',
  '7. Disk space issues',
  '8. Permission problems'
]

causes.forEach(cause => console.log(cause))

console.log('\n🔧 Solutions to try:')

const solutions = [
  '1. Kill all Next.js processes: pkill -f "next"',
  '2. Clear .next cache: rm -rf .next',
  '3. Clear node_modules: rm -rf node_modules && pnpm install',
  '4. Restart development server',
  '5. Check available disk space',
  '6. Use different port: pnpm dev -- -p 3002',
  '7. Disable file watching: pnpm dev -- --no-watch',
  '8. Increase file watcher limits (macOS)'
]

solutions.forEach(solution => console.log(solution))

console.log('\n🚀 Quick fix commands:')
console.log('1. pkill -f "next"')
console.log('2. rm -rf .next')
console.log('3. pnpm dev')

console.log('\n💡 Prevention tips:')
console.log('1. Always stop dev server with Ctrl+C before restarting')
console.log('2. Don\'t run multiple dev servers simultaneously')
console.log('3. Keep sufficient disk space available')
console.log('4. Use consistent Node.js version')
console.log('5. Consider using pnpm or yarn for better dependency management')

// Check if there are multiple Next.js processes
try {
  const processes = execSync('ps aux | grep "next" | grep -v grep', { encoding: 'utf8' })
  console.log('\n🔍 Current Next.js processes:')
  console.log(processes || 'No Next.js processes found')
} catch (error) {
  console.log('\n🔍 No Next.js processes currently running')
}

// Check disk space
try {
  const diskSpace = execSync('df -h .', { encoding: 'utf8' })
  console.log('\n💾 Disk space:')
  console.log(diskSpace)
} catch (error) {
  console.log('\n💾 Could not check disk space')
} 