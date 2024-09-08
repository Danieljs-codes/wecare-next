import { countries } from '../lib/countries'
import { writeFileSync } from 'fs'

const processedCountries = countries.reduce((acc, country) => {
  const commonName = country.name.common
  acc[commonName] = {
    name: commonName,
    flag: country.flags.svg
  }
  return acc
}, {} as Record<string, { name: string, flag: string }>)

const jsonContent = JSON.stringify(processedCountries, null, 2)

// Using Bun's built-in file system API
// @ts-ignore
Bun.write('src/lib/processed-countries.json', jsonContent)

console.log('Processed countries have been written to processed-countries.json')