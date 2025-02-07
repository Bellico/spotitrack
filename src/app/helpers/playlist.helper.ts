import { Playlist } from '../models/models';

const playlistSelection = 'Sélection';
const playlistTrap = 'Trap';
const playlistRap = 'Rap';

export class PlaylistHelper {
  static sortByPriority(playlists: Playlist[]): Playlist[] {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const lastPrevYear = currentYear - 2;

    return playlists
      .filter(
        (item: any) =>
          item.name.includes(playlistSelection) ||
          item.name.includes(playlistTrap) ||
          item.name.includes(currentYear) ||
          item.name.includes(lastYear) ||
          item.name.includes(lastPrevYear)
      )
      .sort((a: Playlist, b: Playlist) => {
        // Sélection en premier
        if (a.name.includes(playlistSelection)) return -1;
        if (b.name.includes(playlistSelection)) return 1;

        // Trap en second
        if (a.name.includes(playlistTrap)) return -1;
        if (b.name.includes(playlistTrap)) return 1;

        // Rap en troisième
        if (a.name.includes(playlistRap) && a.name.includes(`${currentYear}`))
          return -1;
        if (b.name.includes(playlistRap)) return 1;

        // Année courante
        if (a.name.includes(`${currentYear}`)) return -1;
        if (b.name.includes(`${currentYear}`)) return 1;

        // Année précédente
        if (a.name.includes(`${lastYear}`)) return -1;
        if (b.name.includes(`${lastYear}`)) return 1;

        return 0;
      });
  }
}
