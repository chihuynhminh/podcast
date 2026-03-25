/**
 * Playlist Service
 * Handles all playlist CRUD operations with Supabase
 */

import { supabase } from './supabaseClient';
import { Playlist, PlaylistSong } from '../types';

export const playlistService = {
  /**
   * Get all playlists for a user (own + shared with user)
   */
  async getPlaylists(userId: string) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch playlists: ${error.message}`);
    }

    return (data || []) as Playlist[];
  },

  /**
   * Create a new playlist
   */
  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .insert([
        {
          user_id: userId,
          name,
          description: description || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create playlist: ${error.message}`);
    }

    return data as Playlist;
  },

  /**
   * Update playlist name and/or description
   */
  async updatePlaylist(
    playlistId: string,
    name: string,
    description?: string
  ): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playlistId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update playlist: ${error.message}`);
    }

    return data as Playlist;
  },

  /**
   * Delete a playlist and all related records
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      throw new Error(`Failed to delete playlist: ${error.message}`);
    }
  },

  /**
   * Get all songs in a playlist with full song details
   */
  async getPlaylistSongs(playlistId: string): Promise<PlaylistSong[]> {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select('*, songs(*)')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch playlist songs: ${error.message}`);
    }

    return (data || []) as PlaylistSong[];
  },

  /**
   * Add songs to a playlist
   */
  async addSongsToPlaylist(
    playlistId: string,
    songIds: string[]
  ): Promise<PlaylistSong[]> {
    // Get the highest position in the playlist
    const { data: existingSongs, error: posError } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);

    if (posError) {
      throw new Error(`Failed to get playlist position: ${posError.message}`);
    }

    const nextPosition =
      existingSongs && existingSongs.length > 0
        ? existingSongs[0].position + 1
        : 1;

    // Insert songs with auto-incremented positions
    const newSongs = songIds.map((songId, index) => ({
      playlist_id: playlistId,
      song_id: songId,
      position: nextPosition + index,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('playlist_songs')
      .insert(newSongs)
      .select('*, songs(*)');

    if (error) {
      throw new Error(`Failed to add songs to playlist: ${error.message}`);
    }

    return (data || []) as PlaylistSong[];
  },

  /**
   * Remove a song from a playlist
   */
  async removeSongFromPlaylist(playlistSongId: string): Promise<void> {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('id', playlistSongId);

    if (error) {
      throw new Error(
        `Failed to remove song from playlist: ${error.message}`
      );
    }
  },

  /**
   * Reorder songs in a playlist
   */
  async reorderPlaylistSongs(
    playlistId: string,
    newPositions: Record<string, number>
  ): Promise<void> {
    // Update each song's position
    const updates = Object.entries(newPositions).map(([songId, position]) => ({
      id: songId,
      position,
      updated_at: new Date().toISOString(),
    }));

    // Batch update - in production, might want to use individual updates
    for (const update of updates) {
      const { error } = await supabase
        .from('playlist_songs')
        .update({ position: update.position })
        .eq('id', update.id);

      if (error) {
        throw new Error(
          `Failed to reorder playlist songs: ${error.message}`
        );
      }
    }
  },

  /**
   * Share a playlist with users by email
   */
  async sharePlaylistWithUsers(
    playlistId: string,
    recipientUserIds: string[]
  ): Promise<void> {
    // Get current user ID from session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const userId = sessionData.session.user.id;

    const shares = recipientUserIds.map((recipientId) => ({
      playlist_id: playlistId,
      shared_by_user_id: userId,
      shared_with_user_id: recipientId,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('playlist_shares')
      .insert(shares);

    if (error) {
      throw new Error(`Failed to share playlist: ${error.message}`);
    }
  },

  /**
   * Get all shares for a playlist
   */
  async getPlaylistShares(
    playlistId: string
  ): Promise<
    Array<{ shared_with_user_id: string; shared_with_email?: string }>
  > {
    const { data, error } = await supabase
      .from('playlist_shares')
      .select('shared_with_user_id, users!shared_with_user_id(email)')
      .eq('playlist_id', playlistId);

    if (error) {
      throw new Error(`Failed to fetch playlist shares: ${error.message}`);
    }

    return (data || []) as Array<{
      shared_with_user_id: string;
      shared_with_email?: string;
    }>;
  },

  /**
   * Revoke sharing access
   */
  async revokeShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('playlist_shares')
      .delete()
      .eq('id', shareId);

    if (error) {
      throw new Error(`Failed to revoke share: ${error.message}`);
    }
  },
};
