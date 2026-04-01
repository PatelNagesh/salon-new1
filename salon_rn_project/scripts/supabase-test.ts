import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ ERROR: SUPABASE_URL is not set in .env');
  process.exit(1);
}
if (!supabaseAnonKey) {
  console.error('❌ ERROR: SUPABASE_ANON_KEY is not set in .env');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');

    const { data, error } = await supabase
      .from('profiles') // Adjust table name if different
      .select('id')
      .limit(1)
      // .then(({ data, error }) => {
      //   if (error) throw error;
      //   return data;
      // });

    if (error) {
      console.error('❌ Supabase query error:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ Supabase connection OK – sample row:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  No rows returned (maybe table empty or name mismatched).');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
// } catch (e) {
//   console.error('❌ Error loading env variables:', e);
//   process.exit(1);
// } catch (e) {
//   console.error('❌ Unexpected error during test:', e);
//   process.exit(1);
}

// Run the test
testConnection();