// ================================================
// GYM AESTHETICS FITNESS - Configuración
// Reemplaza con tus credenciales de Supabase
// ================================================

const SUPABASE_URL = 'https://oockppjvrlbfffxurigq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vY2twcGp2cmxiZmZmeHVyaWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzU0MDcsImV4cCI6MjA5MTAxMTQwN30.5EsAh0ySnzduKKPitoodneCFVqvya9jd4c5c9Kw8XdU';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
