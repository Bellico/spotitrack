import { Playlist } from '../models/models'

const playlistSelection = 'Sélection'
const playlistTrap = 'Trap'
const YEARS_BACK = 3

function getRecentYears(): number[] {
  const currentYear = new Date().getFullYear()

  return Array.from({ length: YEARS_BACK + 1 }, (_, i) => currentYear - i)
}

function yearPriority(name: string, years: number[]): number {
  const idx = years.findIndex(y => name.includes(String(y)))

  return idx === -1 ? years.length : idx
}

export function sortByPriority(playlists: Playlist[]): Playlist[] {
  const years = getRecentYears()

  return playlists
    .filter(item =>
      item.name.includes(playlistSelection) ||
      item.name.includes(playlistTrap) ||
      years.some(y => item.name.includes(String(y))),
    )
    .sort((a, b) => {
      if (a.name.includes(playlistSelection) !== b.name.includes(playlistSelection)) {
        return a.name.includes(playlistSelection) ? -1 : 1
      }

      if (a.name.includes(playlistTrap) !== b.name.includes(playlistTrap)) {
        return a.name.includes(playlistTrap) ? -1 : 1
      }

      return yearPriority(a.name, years) - yearPriority(b.name, years)
    })
}
