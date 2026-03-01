import { sortByPriority } from './playlist.helper'

describe('sortByPriority', () => {
  const year = new Date().getFullYear()

  it('should filter out playlists not matching any criterion', () => {
    const playlists = [
      { id: '1', uri: '', name: 'Favourites' },
      { id: '2', uri: '', name: 'Random mix' },
    ]

    expect(sortByPriority(playlists)).toEqual([])
  })

  it('should keep playlists matching Sélection', () => {
    const playlists = [{ id: '1', uri: '', name: 'Sélection' }]

    expect(sortByPriority(playlists).length).toBe(1)
  })

  it('should keep playlists matching current year', () => {
    const playlists = [{ id: '1', uri: '', name: `Rap ${year}` }]

    expect(sortByPriority(playlists).length).toBe(1)
  })

  it('should keep playlists matching previous year', () => {
    const playlists = [{ id: '1', uri: '', name: `Mix ${year - 1}` }]

    expect(sortByPriority(playlists).length).toBe(1)
  })

  it('should place Sélection first', () => {
    const playlists = [
      { id: '1', uri: '', name: 'Trap' },
      { id: '2', uri: '', name: 'Sélection' },
    ]

    expect(sortByPriority(playlists)[0].name).toBe('Sélection')
  })

  it('should place Trap before year-based playlists', () => {
    const playlists = [
      { id: '1', uri: '', name: `Rap ${year}` },
      { id: '2', uri: '', name: 'Trap' },
    ]

    expect(sortByPriority(playlists)[0].name).toBe('Trap')
  })

  it('should place current year before previous year', () => {
    const playlists = [
      { id: '1', uri: '', name: `Mix ${year - 1}` },
      { id: '2', uri: '', name: `Mix ${year}` },
    ]
    const result = sortByPriority(playlists)

    expect(result[0].name).toBe(`Mix ${year}`)
  })

  it('should order: Sélection > Trap > current year > previous year', () => {
    const playlists = [
      { id: '1', uri: '', name: `Mix ${year - 1}` },
      { id: '2', uri: '', name: 'Trap' },
      { id: '3', uri: '', name: `Rap ${year}` },
      { id: '4', uri: '', name: 'Sélection' },
    ]
    const result = sortByPriority(playlists)

    expect(result[0].name).toBe('Sélection')
    expect(result[1].name).toBe('Trap')
    expect(result[2].name).toBe(`Rap ${year}`)
    expect(result[3].name).toBe(`Mix ${year - 1}`)
  })
})
