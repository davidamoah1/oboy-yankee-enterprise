import { supabase } from "./supabase";

/**
 * Enterprise database utilities for SME OS
 * Handles soft deletes and audit-ready operations.
 */
export const dbUtils = {
  /**
   * Performs a soft delete on a record by setting deleted_at
   */
  async softDelete(table: string, id: string, userId?: string) {
    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Safely restore a soft-deleted record
   */
  async restore(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .update({
        deleted_at: null,
        deleted_by: null
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Helper to query non-deleted records
   */
  selectActive(query: any) {
    return query.is('deleted_at', null);
  }
};
