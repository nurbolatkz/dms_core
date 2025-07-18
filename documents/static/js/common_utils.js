// dms_core/documents/static/js/common.js

// --- GLOBAL CONSTANTS (Pure JavaScript, shared across pages) ---
const docTypes = {
    'payment': 'Заявка на оплату',
    'memo': 'Служебная записка',
    'contract': 'Договор',
    'leave': 'Заявка на отпуск',
    'payment_plan': 'План платежей',
    'expenditure': 'Заявка на расходование средств'
};

const operationTypesDisplay = {
    'ОплатаПоставщику': 'Оплата Поставщику',
    'ВозвратДенежныхСредствПокупателю': 'Возврат Денежных Средств Покупателю',
    'ВыдачаДенежныхСредствПодотчетнику': 'Выдача Денежных Средств Подотчетнику',
    'ПеречислениеЗП': 'Перечисление ЗП',
    'ПеречислениеНалога': 'Перечисление Налога',
    'ПеречислениеНДССИзмененнымСрокомУплаты': 'Перечисление НДС С Измененным Сроком Уплаты',
    'ПеречислениеПенсионныхВзносов': 'Перечисление Пенсионных Взносов',
    'ПеречислениеПоИсполнительнымЛистам': 'Перечисление По Исполнительным Листам',
    'ПеречислениеСоциальных Отчислений': 'Перечисление Социальных Отчислений',
    'ПрочиеРасчетыСКонтрагентами': 'Прочие Расчеты С Контрагентами',
    'РасчетыПоКредитамИЗаймамСРаботниками': 'Расчеты По Кредитам И Займам С Работниками',
    'ПрочийРасходДенежных Средств': 'Прочий Расход Денежных Средств',
    'РасчетыПоКредитамИЗаймамСКонтрагентами': 'Расчеты По Кредитам И Займам С Контрагентами',
    'РасчетыПоДоходуОтРазовыхВыплатСКонтрагентами': 'Расчеты По Доходу От Разовых Выплат С Контрагентами',
    'ОплатаСтруктурномуПодразделению': 'Оплата Структурному Подразделению',
    'ПереводНаДругойСчет': 'Перевод На Другой Счет',
};

const paymentFormsDisplay = {
    'cash': 'Наличные',
    'bank_transfer': 'Безналичные',
};

const currencyDisplay = {
    'USD': 'Доллар США',
    'KZT': 'KZT тенге',
    'RUB': 'RUB',
};


// --- GLOBAL UTILITY FUNCTIONS (Pure JavaScript, shared) ---

function getDocTypeName(type) {
    return docTypes[type] || type;
}

function getStatusText(status) {
    switch (status) {
        case 'prepared': return 'Подготовлен';
        case 'on_approval': return 'На согласовании';
        case 'approved': return 'Утвержден';
        case 'pending': return 'Ожидает';
        case 'signed': return 'Подписан';
        case 'rejected': return 'Отклонен';
        default: return status;
    }
}

function getStatusColorClass(status) {
    switch (status) {
        case 'prepared': return 'bg-gray-200 text-gray-800';
        case 'on_approval': return 'bg-yellow-200 text-yellow-800';
        case 'approved': return 'bg-green-200 text-green-800';
        case 'pending': return 'bg-orange-200 text-orange-800';
        case 'signed': return 'bg-blue-200 text-blue-800';
        case 'rejected': return 'bg-red-200 text-red-800';
        default: return 'bg-gray-200 text-gray-800';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebarOverlay) {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('hidden');
        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling main content on mobile
        } else {
            document.body.style.overflow = '';
        }
    } else {
        console.warn("Sidebar or overlay elements not found for toggleSidebar.");
    }
}

function toggleUserDropdown(event) {
    event.stopPropagation(); // Prevent click from bubbling up to document and closing immediately
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('hidden');
    }
}

// Global click listener to hide user dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    if (userDropdownMenu && !userDropdownMenu.classList.contains('hidden')) { // Only act if it's visible
        const userDropdownTrigger = userDropdownMenu.parentElement; // The div with onclick="toggleUserDropdown(event)"

        if (userDropdownTrigger && !userDropdownTrigger.contains(event.target)) {
            userDropdownMenu.classList.add('hidden');
        }
    }
});

// Window resize listener (can be outside DOMContentLoaded as it listens to window)
window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebarOverlay) {
        if (window.innerWidth >= 768) {
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('hidden');
        } else {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.add('hidden'); // Hide overlay on mobile if not explicitly open
        }
    }
});