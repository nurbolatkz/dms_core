// Common utility functions and constants for DMS
const DMS = {
  docTypes: {
    payment: 'Заявка на оплату',
    memo: 'Служебная записка',
    contract: 'Договор',
    leave: 'Заявка на отпуск',
    payment_plan: 'План платежей',
    expenditure: 'Заявка на расходование средств'
  },
  operationTypesDisplay: {
    // ...existing code...
  },
  paymentFormsDisplay: {
    cash: 'Наличные',
    bank_transfer: 'Безналичные'
  },
  currencyDisplay: {
    USD: 'Доллар США',
    KZT: 'KZT тенге',
    RUB: 'RUB'
  },
  getDocTypeName(type) {
    return this.docTypes[type] || type;
  },
  getStatusText(status) {
    switch (status?.toLowerCase()) {
      case 'prepared': return 'Подготовлен';
      case 'on_approval': return 'На согласовании';
      case 'approved': return 'Утвержден';
      case 'pending': return 'Ожидает';
      case 'signed': return 'Подписан';
      case 'rejected': return 'Отклонен';
      default: return status;
    }
  },
  getStatusColorClass(status) {
    switch (status?.toLowerCase()) {
      case 'prepared': return 'bg-gray-200 text-gray-800';
      case 'on_approval': return 'bg-yellow-200 text-yellow-800';
      case 'approved': return 'bg-green-200 text-green-800';
      case 'pending': return 'bg-orange-200 text-orange-800';
      case 'signed': return 'bg-blue-200 text-blue-800';
      case 'rejected': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }
};

// Sidebar toggling
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebar && sidebarOverlay) {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('hidden');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  }
}
