/**
 * Song Service
 * Handles all song CRUD operations with Supabase
 */

import { supabase } from './supabaseClient';
import { Song } from '../types';

export const songService = {
  /**
   * Get all songs for a user
   */
  async getSongs(userId: string): Promise<Song[]> {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch songs: ${error.message}`);
    }

    return (data || []) as Song[];
  },

  /**
   * Create a new song
   */
  async createSong(
    userId: string,
    title: string,
    artist: string | undefined,
    sourceType: 'local_file' | 'url',
    url: string,
    filePath?: string,
    durationSeconds?: number
  ): Promise<Song> {
    if (!title || !title.trim()) {
      throw new Error('Song title is required');
    }

    if (!url || !url.trim()) {
      throw new Error('Song URL or file is required');
    }

    const { data, error } = await supabase
      .from('songs')
      .insert([
        {
          user_id: userId,
          title: title.trim(),
          artist: artist && artist.trim() ? artist.trim() : null,
          source_type: sourceType,
          file_path: filePath || null,
          url: url.trim(),
          duration_seconds: durationSeconds || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create song: ${error.message}`);
    }

    return data as Song;
  },

  /**
   * Update song metadata (title, artist, duration)
   */
  async updateSong(
    songId: string,
    title: string,
    artist: string | undefined,
    durationSeconds?: number
  ): Promise<Song> {
    if (!title || !title.trim()) {
      throw new Error('Song title is required');
    }

    const { data, error } = await supabase
      .from('songs')
      .update({
        title: title.trim(),
        artist: artist && artist.trim() ? artist.trim() : null,
        duration_seconds: durationSeconds || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', songId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update song: ${error.message}`);
    }

    return data as Song;
  },

  /**
   * Delete a song (removes from all playlists automatically via CASCADE)
   */
  async deleteSong(songId: string): Promise<void> {
    const { error } = await supabase.from('songs').delete().eq('id', songId);

    if (error) {
      throw new Error(`Failed to delete song: ${error.message}`);
    }
  },
};
