import { supabase } from './supabase';
import type { Database } from './database.types';

type Company = Database['public']['Tables']['companies']['Row'];
type User = Database['public']['Tables']['users']['Row'];

export const adminApi = {
  // Company operations
  async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('companies')
      .insert(company)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCompany(id: number, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCompany(id: number) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAllCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // User operations
  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: number, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteUser(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          company_name
        )
      `);
    
    if (error) throw error;
    return data;
  },

  // Password reset operations
  async createPasswordResetToken(email: string, token: string) {
    const { error } = await supabase
      .from('password_reset_tokens')
      .insert({ email, token });
    
    if (error) throw error;
  },

  async validatePasswordResetToken(email: string, token: string) {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('email', email)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePasswordResetToken(email: string) {
    const { error } = await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('email', email);
    
    if (error) throw error;
  }
};