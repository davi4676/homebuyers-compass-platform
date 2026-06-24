import fs from 'fs'

const file = process.argv[2]
const html = fs.readFileSync(file, 'utf8')
const re = /https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/gi
const urls = [...new Set([...html.matchAll(re)].map((m) => m[0]))]
console.log(urls.slice(0, 40).join('\n'))
