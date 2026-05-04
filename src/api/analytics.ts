// src/api/analytics.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging only in development mode
if (import.meta.env.DEV) {
  console.log('Analytics Environment Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const GET = async (request) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Starting analytics GET request');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Configuration error');
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data, error } = await supabase
      .from('page_views')
      .select('viewed_at');

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Supabase query error:', error);
      }
      throw error;
    }

    const views = {
      total: data?.length || 0,
      today: data?.filter(view => new Date(view.viewed_at) >= startOfDay).length || 0,
      thisWeek: data?.filter(view => new Date(view.viewed_at) >= startOfWeek).length || 0,
      thisMonth: data?.filter(view => new Date(view.viewed_at) >= startOfMonth).length || 0
    };

    return new Response(JSON.stringify(views), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // Log detailed errors only in development
    if (import.meta.env.DEV) {
      console.error('Analytics error:', error);
    }

    // Don't expose internal error details in production
    return new Response(JSON.stringify({
      error: 'Failed to fetch analytics data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};