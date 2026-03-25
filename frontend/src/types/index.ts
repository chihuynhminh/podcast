/**
 * TypeScript interfaces for Music Manager application
 * Defines all data models and their structures
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist?: string;
  source_type: 'local_file' | 'url';
  file_path?: string;
  url: string;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  created_at: string;
  songs?: Song;
}

export interface PlaybackPosition {
  id: string;
  user_id: string;
  song_id: string;
  playlist_id: string;
  current_time_seconds: number;
  updated_at: string;
}

export interface PlaylistShare {
  id: string;
  playlist_id: string;
  shared_by_user_id: string;
  shared_with_user_id: string;
  created_at: string;
}
