// ================================================
// GYM AESTHETICS FITNESS - Auth & Roles
// ================================================

async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return data;
}

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  return session;
}

async function requireOwner() {
  const profile = await getProfile();
  if (!profile || profile.role !== 'owner') {
    window.location.href = 'dashboard.html';
    return null;
  }
  return profile;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function setupNav() {
  const profile = await getProfile();
  if (!profile) return;

  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');
  const ownerLinks = document.querySelectorAll('.owner-only');

  if (userName) userName.textContent = profile.full_name;
  if (userRole) userRole.textContent = profile.role === 'owner' ? 'Propietario' : 'Asistente';

  ownerLinks.forEach(el => {
    if (profile.role !== 'owner') el.style.display = 'none';
  });

  await supabaseClient.rpc('update_subscription_status');
}