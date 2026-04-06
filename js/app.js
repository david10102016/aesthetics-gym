// ================================================
// GYM AESTHETICS FITNESS - Utilidades compartidas
// ================================================

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount, currency = 'Bs') {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
}

function daysRemaining(endDate) {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate + 'T00:00:00');
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function getStatusInfo(status, days) {
  if (status === 'expired' || days < 0) return { label: 'Vencido', class: 'status-red', icon: '●' };
  if (status === 'expiring_soon' || days <= 7) return { label: `Vence en ${days}d`, class: 'status-yellow', icon: '●' };
  return { label: `Vigente ${days}d`, class: 'status-green', icon: '●' };
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showModal(title, content, onConfirm = null) {
  const existing = document.getElementById('app-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'app-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="document.getElementById('app-modal').remove()">✕</button>
      </div>
      <div class="modal-body">${content}</div>
      ${onConfirm ? `
      <div class="modal-footer">
        <button class="btn-secondary" onclick="document.getElementById('app-modal').remove()">Cancelar</button>
        <button class="btn-danger" id="modal-confirm">Confirmar</button>
      </div>` : ''}
    </div>
  `;
  document.body.appendChild(modal);
  if (onConfirm) {
    document.getElementById('modal-confirm').addEventListener('click', () => {
      onConfirm();
      modal.remove();
    });
  }
}

async function getSettings() {
  const { data } = await supabaseClient.from('settings').select('*').limit(1).single();
  return data;
}

async function getPlans() {
  const { data } = await supabaseClient.from('plans').select('*').eq('is_active', true).order('price');
  return data || [];
}