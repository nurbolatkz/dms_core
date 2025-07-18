// documents.js (Full file, all functions globalized)

// Dictionaries for display values (pure JS constants)
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
    'ПрочийРасходДенежныхСредств': 'Прочий Расход Денежных Средств',
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


// --- GLOBAL FUNCTIONS (Accessible directly from HTML onclick attributes) ---

function getDocTypeName(type) {
    return docTypes[type] || type;
}

function getStatusText(status) {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
        case 'prepared':
            return 'bg-gray-200 text-gray-800';
        case 'on_approval':
            return 'bg-yellow-200 text-yellow-800';
        case 'approved':
            return 'bg-green-200 text-green-800';
        case 'pending':
            return 'bg-orange-200 text-orange-800';
        case 'signed':
            return 'bg-blue-200 text-blue-800';
        case 'rejected':
            return 'bg-red-200 text-red-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('hidden');

    if (sidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden'; // Prevent scrolling main content on mobile
    } else {
        document.body.style.overflow = '';
    }
}

function toggleDocumentFiltersMenu() {
    const submenu = document.getElementById('document-filters-submenu');
    const caret = document.getElementById('doc-filters-caret');
    submenu.classList.toggle('hidden');
    caret.classList.toggle('fa-caret-down');
    caret.classList.toggle('fa-caret-up');
}

function toggleIncomingMenu() {
    const submenu = document.getElementById('incoming-submenu');
    const caret = document.getElementById('incoming-caret');
    submenu.classList.toggle('hidden');
    caret.classList.toggle('fa-caret-down');
    caret.classList.toggle('fa-caret-up');
}

function toggleOutgoingMenu() {
    const submenu = document.getElementById('outgoing-submenu');
    const caret = document.getElementById('outgoing-caret');
    submenu.classList.toggle('hidden');
    caret.classList.toggle('fa-caret-down');
    caret.classList.toggle('fa-caret-up');
}

function toggleCreateDocumentMenu() {
    const submenu = document.getElementById('create-document-submenu');
    const caret = document.getElementById('create-doc-caret');
    submenu.classList.toggle('hidden');
    caret.classList.toggle('fa-caret-down');
    caret.classList.toggle('fa-caret-up');
}

function showCreateForm(type) {
    document.getElementById('document-list-section').classList.add('hidden');
    document.getElementById('create-form-section').classList.remove('hidden');
    document.getElementById('create-doc-form').classList.remove('hidden');

    document.getElementById('doc-type').value = type;
    document.getElementById('main-title').textContent = `Создать ${getDocTypeName(type)}`;
    
    renderSpecificFormFields(type); // This renders the HTML for the form fields

    if (type === 'expenditure') {
        setupExpenditureFormListeners(); // Call function to attach listeners to newly rendered elements
    }

    if (window.innerWidth < 768) {
        toggleSidebar();
    }
    
    // Close all other submenus
    document.getElementById('create-document-submenu').classList.add('hidden');
    document.getElementById('create-doc-caret').classList.remove('fa-caret-up');
    document.getElementById('create-doc-caret').classList.add('fa-caret-down');
    
    document.getElementById('document-filters-submenu').classList.add('hidden');
    document.getElementById('doc-filters-caret').classList.remove('fa-caret-up');
    document.getElementById('doc-filters-caret').classList.add('fa-caret-down');

    document.getElementById('incoming-submenu').classList.add('hidden');
    document.getElementById('incoming-caret').classList.remove('fa-caret-up');
    document.getElementById('incoming-caret').classList.add('fa-caret-down');

    document.getElementById('outgoing-submenu').classList.add('hidden');
    document.getElementById('outgoing-caret').classList.remove('fa-caret-up');
    document.getElementById('outgoing-caret').classList.add('fa-caret-down');
}

function cancelCreateForm() {
    document.getElementById('create-doc-form').reset();
    document.getElementById('specific-fields-container').innerHTML = '';
    document.getElementById('create-form-section').classList.add('hidden');
    document.getElementById('document-list-section').classList.remove('hidden');
    document.getElementById('main-title').textContent = 'Список Документов';
    renderDocumentList(documents); 
}

function showCustomAlert(messageHtml, docId = null, title = "Детали Документа") {
    // This function is no longer used for viewDoc, but kept for other alerts
    const modal = document.getElementById('custom-alert-modal');
    const modalMessageDiv = document.getElementById('custom-alert-message');
    const modalTitleH3 = modal.querySelector('h3');
    const modalActions = document.getElementById('modal-actions');

    modalTitleH3.textContent = title;
    modalMessageDiv.innerHTML = messageHtml;
    modalActions.innerHTML = '';

    const closeButton = document.createElement('button');
    closeButton.className = 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    closeButton.textContent = 'Закрыть';
    closeButton.onclick = hideCustomAlert;
    modalActions.appendChild(closeButton);

    if (docId !== null) {
        const doc = documents.find(d => d.id === docId);

        if (doc && doc.status === 'pending' && doc.signerId === userId) {
            const signButton = document.createElement('button');
            signButton.className = 'px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
            signButton.textContent = 'Подписать';
            signButton.onclick = () => { signDoc(doc.id); hideCustomAlert(); };
            modalActions.prepend(signButton);

            const rejectButton = document.createElement('button');
            rejectButton.className = 'px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500';
            rejectButton.textContent = 'Отклонить';
            rejectButton.onclick = () => { rejectDoc(doc.id); hideCustomAlert(); };
            modalActions.prepend(rejectButton);
        }
    }

    modal.classList.remove('hidden');
}

function hideCustomAlert() {
    document.getElementById('custom-alert-modal').classList.add('hidden');
}

// --- MODIFIED: viewDoc now redirects to a detail page ---
function viewDoc(id) {
    // Redirect to a new Django URL for the document detail page
    // Using `window.location.href` for full page navigation
    window.location.href = `/documents/${id}/detail/`;
}

// These are client-side only mocks for now. Your Django backend should handle this.
async function signDoc(id) {
    // In a real app, this would be an AJAX call to your Django backend
    // const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // try {
    //     const response = await fetch(`/api/documents/${id}/sign/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken } });
    //     if (!response.ok) { /* handle error */ }
    //     const result = await response.json();
    //     if (result.success) { /* show success message */ }
    // } catch (error) { /* handle error */ }

    console.log(`Simulating signing document ID: ${id}. Redirecting to document list.`);
    // After successful action (real or simulated), redirect back to the document list
    window.location.href = '/documents/'; // Or a specific filtered list if desired
}

async function rejectDoc(id) {
    // In a real app, this would be an AJAX call to your Django backend
    // const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    // try {
    //     const response = await fetch(`/api/documents/${id}/reject/`, { method: 'POST', headers: { 'X-CSRFToken': csrfToken } });
    //     if (!response.ok) { /* handle error */ }
    //     const result = await response.json();
    //     if (result.success) { /* show success message */ }
    // } catch (error) { /* handle error */ }

    console.log(`Simulating rejecting document ID: ${id}. Redirecting to document list.`);
    // After successful action (real or simulated), redirect back to the document list
    window.location.href = '/documents/'; // Or a specific filtered list if desired
}

function toggleUserDropdown(event) {
    event.stopPropagation(); // Prevent click from bubbling up to document and closing immediately
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('hidden');
    }
}


// --- Functions below here Interact with DOM elements dynamically or once DOM is ready ---

function updateSidebarCounts() {
    const counts = {
        'incoming-to-sign': 0,
        'incoming-payment-plan': 0,
        'incoming-payment-request': 0,
        'outgoing-pending': 0,
        'outgoing-signed': 0,
        'outgoing-rejected': 0,
    };

    documents.forEach(doc => {
        if (doc.signerId === userId && doc.status === 'pending') {
            counts['incoming-to-sign']++;
            if (doc.type === 'payment_plan') {
                counts['incoming-payment-plan']++;
            }
            if (doc.type === 'payment') {
                counts['incoming-payment-request']++;
            }
            if (doc.type === 'expenditure') {
                counts['incoming-to-sign']++;
            }
        }

        if (doc.creatorId === userId) {
            if (doc.status === 'pending') {
                counts['outgoing-pending']++;
            } else if (doc.status === 'signed') {
                counts['outgoing-signed']++;
            } else if (doc.status === 'rejected') {
                counts['outgoing-rejected']++;
            }
        }
    });

    document.getElementById('count-incoming-to-sign').textContent = counts['incoming-to-sign'];
    document.getElementById('count-incoming-payment-plan').textContent = counts['incoming-payment-plan'];
    document.getElementById('count-incoming-payment-request').textContent = counts['incoming-payment-request'];
    document.getElementById('count-outgoing-pending').textContent = counts['outgoing-pending'];
    document.getElementById('count-outgoing-signed').textContent = counts['outgoing-signed'];
    document.getElementById('count-outgoing-rejected').textContent = counts['outgoing-rejected'];
}

function renderDocumentList(documentsList) {
    const tableBody = document.getElementById('document-table-body');
    const mobileList = document.getElementById('mobile-document-list');
    const noDocumentsMessage = document.getElementById('no-documents-message');
    
    tableBody.innerHTML = ''; 
    mobileList.innerHTML = '';

    if (documentsList.length === 0) {
        noDocumentsMessage.classList.remove('hidden');
        return;
    } else {
        noDocumentsMessage.classList.add('hidden');
    }

    documentsList.forEach(doc => {
        // Determine counterparty name based on document type
        let counterpartyName = 'N/A';
        if (doc.type === 'payment') {
            counterpartyName = doc.recipient || 'N/A';
        } else if (doc.type === 'expenditure') {
            counterpartyName = doc.counterpartyName || 'N/A';
        }

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 border-b border-gray-200';
        row.innerHTML = `
            <td class="px-5 py-4 text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">
                <div title="${doc.title}">${doc.title}</div>
                <div class="text-xs text-gray-500 mt-1">
                    Дата: ${new Date(doc.created_at).toLocaleDateString('ru-RU')} | Номер: ${doc.externalNumber || 'N/A'}
                </div>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-700">${counterpartyName}</td>
            <td class="px-5 py-4 whitespace-nowrap text-sm">
                <span class="${getStatusColorClass(doc.status)} px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    ${getStatusText(doc.status)}
                </span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-700">${doc.creatorId}</td>
            <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-700">${getDocTypeName(doc.type)}</td>
            <td class="px-5 py-4 whitespace-nowrap text-sm space-x-2">
                <button onclick="viewDoc(${doc.id})" class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out">Просмотр</button>
            </td>
        `;
        tableBody.appendChild(row);

        // Mobile list item rendering
        const item = document.createElement('div');
        item.className = 'mobile-document-item p-4'; // Added p-4 for consistency
        item.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="font-semibold text-gray-900 flex-1 mr-2">${doc.title}</div>
                <span class="${getStatusColorClass(doc.status)} px-2 py-0.5 rounded-full text-xs">${getStatusText(doc.status)}</span>
            </div>
            <div class="text-sm text-gray-700 mb-1">
                <strong>Дата:</strong> ${new Date(doc.created_at).toLocaleDateString('ru-RU')} | <strong>Номер:</strong> ${doc.externalNumber || 'N/A'}
            </div>
            <div class="text-sm text-gray-700 mb-1">
                <strong>Контрагент:</strong> ${counterpartyName}
            </div>
            <div class="text-sm text-gray-700 mb-1">
                <strong>Автор:</strong> ${doc.creatorId}
            </div>
            <div class="text-sm text-gray-700 mb-2">
                <strong>Тип:</strong> ${getDocTypeName(doc.type)}
            </div>
            <div class="mobile-doc-actions">
                <button onclick="viewDoc(${doc.id})" class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition duration-150 ease-in-out">Просмотр</button>
            </div>
        `;
        mobileList.appendChild(item);
    });
}

function filterBy(category) {
    document.getElementById('document-list-section').classList.remove('hidden');
    document.getElementById('create-form-section').classList.add('hidden');
    
    const submenus = ['document-filters-submenu', 'incoming-submenu', 'outgoing-submenu', 'create-document-submenu'];
    submenus.forEach(id => {
        document.getElementById(id).classList.add('hidden');
        const caretId = id.replace('-submenu', '-caret');
        const caret = document.getElementById(caretId);
        if (caret) {
            caret.classList.remove('fa-caret-up');
            caret.classList.add('fa-caret-down');
        }
    });

    document.getElementById('main-title').textContent = 'Список Документов';

    let filtered = [];
    if (category === 'all') {
        filtered = documents;
    } else if (category === 'history') {
        filtered = documents.filter(d => d.status !== 'pending');
    }
    else if (category === 'incoming-to-sign') {
        filtered = documents.filter(d => d.signerId === userId && d.status === 'pending');
    } else if (category === 'incoming-payment-plan') {
        filtered = documents.filter(d => d.signerId === userId && d.status === 'pending' && d.type === 'payment_plan');
    } else if (category === 'incoming-payment-request') {
        filtered = documents.filter(d => d.signerId === userId && d.status === 'pending' && d.type === 'payment');
    }
    else if (category === 'outgoing-pending') {
        filtered = documents.filter(d => d.creatorId === userId && d.status === 'pending');
    } else if (category === 'outgoing-signed') {
        filtered = documents.filter(d => d.creatorId === userId && d.status === 'signed');
    } else if (category === 'outgoing-rejected') {
        filtered = documents.filter(d => d.creatorId === userId && d.status === 'rejected');
    }
    
    renderDocumentList(filtered);
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// Function to fetch contracts based on selected counterparty ID
async function fetchContractsForCounterparty(counterpartyId) {
    const contractSelect = document.getElementById('expenditure-contract');
    contractSelect.innerHTML = '<option value="">Загрузка договоров...</option>';

    if (!counterpartyId) {
        contractSelect.innerHTML = '<option value="">Выберите контрагента сначала</option>';
        return;
    }

    const contracts = contractsByCounterparty[counterpartyId] || [];

    contractSelect.innerHTML = '<option value="">Выберите договор</option>';
    if (contracts.length === 0) {
        contractSelect.innerHTML = '<option value="">Нет договоров для этого контрагента</option>';
    } else {
        contracts.forEach(contract => {
            const option = document.createElement('option');
            option.value = contract.id;
            option.textContent = contract.name;
            contractSelect.appendChild(option);
        });
    }
}

// Function to render specific form fields when creating a new document type
function renderSpecificFormFields(type) {
    const container = document.getElementById('specific-fields-container');
   
    container.innerHTML = '';

     if (type === 'payment') {
        container.innerHTML = `
            <div>
                <label for="payment-amount" class="block text-sm font-medium text-gray-700 mb-1">Сумма ($)</label>
                <input type="number" id="payment-amount" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required/>
            </div>
            <div>
                <label for="payment-recipient" class="block text-sm font-medium text-gray-700 mb-1">Получатель</label>
                <select id="payment-recipient" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                    <option value="">Выберите получателя</option>
                    ${recipients.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
                </select>
            </div>
        `;
    }else if (type === 'leave') {
        container.innerHTML = `
            <div>
                <label for="leave-start-date" class="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                <input type="date" id="leave-start-date" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required/>
            </div>
            <div>
                <label for="leave-end-date" class="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                <input type="date" id="leave-end-date" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required/>
            </div>
            <div>
                <label for="leave-type" class="block text-sm font-medium text-gray-700 mb-1">Тип отпуска</label>
                <select id="leave-type" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                    <option value="">Выберите тип</option>
                    <option value="Ежегодный">Ежегодный</option>
                    <option value="Без сохранения">Без сохранения</option>
                    <option value="Больничный">Больничный</option>
                </select>
            </div>
        `;
    } else if (type === 'expenditure') {
        container.innerHTML = `
            <div>
                <label for="expenditure-operation-type" class="block text-sm font-medium text-gray-700 mb-1">Вид Операции</label>
                <select id="expenditure-operation-type" name="operation_type" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                    <option value="">Выберите вид операции</option>
                    <option value="ОплатаПоставщику">Оплата Поставщику</option>
                    <option value="ВозвратДенежныхСредствПокупателю">Возврат Денежных Средств Покупателю</option>
                    <option value="ВыдачаДенежныхСредствПодотчетнику">Выдача Денежных Средств Подотчетнику</option>
                    <option value="ПеречислениеЗП">Перечисление ЗП</option>
                    <option value="ПеречислениеНалога">Перечисление Налога</option>
                    <option value="ПеречислениеНДССИзмененнымСрокомУплаты">Перечисление НДС С Измененным Сроком Уплаты</option>
                    <option value="ПеречислениеПенсионныхВзносов">Перечисление Пенсионных Взносов</option>
                    <option value="ПеречислениеПоИсполнительнымЛистам">Перечисление По Исполнительным Листам</option>
                    <option value="ПеречислениеСоциальных Отчислений">Перечисление Социальных Отчислений</option>
                    <option value="ПрочиеРасчетыСКонтрагентами">Прочие Расчеты С Контрагентами</option>
                    <option value="РасчетыПоКредитамИЗаймамСРаботниками">Расчеты По Кредитам И Займам С Работниками</option>
                    <option value="ПрочийРасходДенежныхСредств">Прочий Расход Денежных Средств</option>
                    <option value="РасчетыПоКредитамИЗаймамСКонтрагентами">Расчеты По Кредитам И Займам С Контрагентами</option>
                    <option value="РасчетыПоДоходуОтРазовыхВыплатСКонтрагентами">Расчеты По Доходу От Разовых Выплат С Контрагентами</option>
                    <option value="ОплатаСтруктурномуПодразделению">Оплата Структурному Подразделению</option>
                    <option value="ПереводНаДругойСчет">Перевод На Другой Счет</option>
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="expenditure-submission-date" class="block text-sm font-medium text-gray-700 mb-1">Дата Подачи</label>
                    <input type="date" id="expenditure-submission-date" name="submission_date" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required/>
                </div>
                <div>
                    <label for="expenditure-expense-date" class="block text-sm font-medium text-gray-700 mb-1">Дата Расхода</label>
                    <input type="date" id="expenditure-expense-date" name="expense_date" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required/>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Форма Оплаты</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="expenditure-payment-form" name="payment_form">
                    <span class="toggle-slider round"></span>
                    <div class="toggle-labels">
                        <span class="cash-label">Наличные</span>
                        <span class="bank-label">Безналичные</span>
                    </div>
                </label>
            </div>

            <div class="space-y-4 border p-4 rounded-md bg-gray-50">
                <h4 class="text-md font-semibold text-gray-800">Расчеты с контрагентами</h4>
                <div class="custom-dropdown-container">
                    <label for="expenditure-counterparty-input" class="block text-sm font-medium text-gray-700 mb-1">Контрагент</label>
                    <input type="text"
                           id="expenditure-counterparty-input"
                           class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                           placeholder="Введите имя или выберите" />
                    <ul id="expenditure-counterparty-suggestions" class="custom-dropdown-suggestions hidden"></ul>
                    <input type="hidden" id="expenditure-counterparty-id" name="counterparty_id"/>
                </div>

                <div>
                    <label for="expenditure-contract" class="block text-sm font-medium text-gray-700 mb-1">Договор</label>
                    <select id="expenditure-contract"
                            name="contract_id"
                            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="">Выберите контрагента сначала</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="expenditure-currency" class="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                    <select id="expenditure-currency" name="currency" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="">Выберите валюту</option>
                        <option value="USD">Доллар США</option>
                        <option value="KZT">KZT тенге</option>
                        <option value="RUB">RUB</option>
                    </select>
                </div>
                <div>
                    <label for="expenditure-amount" class="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
                    <input type="number" step="0.01" id="expenditure-amount" name="amount" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required/>
                </div>
            </div>

            <div>
                <label for="expenditure-comment" class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                <textarea id="expenditure-comment" name="comment" rows="3" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
        `;
    }
}

// Function to attach listeners specific to the expenditure form (called after rendering)
function setupExpenditureFormListeners() {
    const counterpartyInput = document.getElementById('expenditure-counterparty-input');
    const counterpartyIdHiddenInput = document.getElementById('expenditure-counterparty-id');
    const contractSelect = document.getElementById('expenditure-contract');
    const counterpartySuggestionsList = document.getElementById('expenditure-counterparty-suggestions');

    if (!counterpartyInput || !counterpartyIdHiddenInput || !contractSelect || !counterpartySuggestionsList) {
        console.warn("Expenditure form elements not found. Cannot set up listeners.");
        return;
    }

    counterpartyInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        counterpartySuggestionsList.innerHTML = ''; // Clear previous suggestions
        counterpartySuggestionsList.classList.remove('hidden');

        if (query.length === 0) {
            counterpartySuggestionsList.classList.add('hidden');
            return;
        }

        const filteredCounterparties = allCounterparties.filter(cp =>
            cp.name.toLowerCase().includes(query)
        );

        if (filteredCounterparties.length > 0) {
            filteredCounterparties.forEach(cp => {
                const listItem = document.createElement('li');
                listItem.textContent = cp.name;
                listItem.dataset.id = cp.id; // Store ID on the list item
                listItem.classList.add('px-4', 'py-2', 'hover:bg-gray-100', 'cursor-pointer');
                
                listItem.addEventListener('click', function() {
                    counterpartyInput.value = this.textContent;
                    counterpartyIdHiddenInput.value = this.dataset.id;
                    counterpartySuggestionsList.classList.add('hidden');
                    fetchContractsForCounterparty(this.dataset.id);
                });
                counterpartySuggestionsList.appendChild(listItem);
            });
        } else {
            counterpartySuggestionsList.innerHTML = '<li class="px-4 py-2 text-gray-500">Нет совпадений</li>';
        }
    });

    document.addEventListener('click', function(event) {
        if (!counterpartyInput.contains(event.target) && !counterpartySuggestionsList.contains(event.target)) {
            counterpartySuggestionsList.classList.add('hidden');
        }
    });

    counterpartyInput.addEventListener('blur', function() {
        setTimeout(() => {
            const selectedName = this.value;
            const foundCp = allCounterparties.find(cp => String(cp.name) === selectedName);
            if (foundCp) {
                counterpartyIdHiddenInput.value = foundCp.id;
                fetchContractsForCounterparty(foundCp.id);
            } else {
                counterpartyIdHiddenInput.value = '';
                contractSelect.innerHTML = '<option value="">Выберите контрагента сначала</option>';
            }
            counterpartySuggestionsList.classList.add('hidden');
        }, 100);
    });
}


// --- DOMContentLoaded Listener (attaches event handlers to static elements) ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial rendering of documents table and sidebar counts
    renderDocumentList(documents);
    updateSidebarCounts();

   
    // Set sidebar initial state on load based on screen width
    if (window.innerWidth >= 768) {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('hidden'); 
    } else {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.add('hidden'); 
    }

    // Attach event listener for the create document form submission
    document.getElementById('create-doc-form').addEventListener('submit', async e => {
        e.preventDefault();
        const docType = document.getElementById('doc-type').value;
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        const requestBody = {
            title: document.getElementById('doc-title').value,
            description: document.getElementById('doc-description').value,
            doc_type: docType,
        };

        if (docType === 'payment') {
            requestBody.amount = parseFloat(document.getElementById('payment-amount').value);
            requestBody.recipient = document.getElementById('payment-recipient').value;
        } else if (docType === 'leave') {
            requestBody.start_date = document.getElementById('leave-start-date').value;
            requestBody.end_date = document.getElementById('leave-end-date').value;
            requestBody.leave_type = document.getElementById('leave-type').value;
        } else if (docType === 'expenditure') {
            requestBody.operation_type = document.getElementById('expenditure-operation-type').value;
            requestBody.submission_date = document.getElementById('expenditure-submission-date').value;
            requestBody.expense_date = document.getElementById('expenditure-expense-date').value;
            requestBody.payment_form = document.getElementById('expenditure-payment-form').checked ? 'bank_transfer' : 'cash';
            requestBody.counterparty_id = document.getElementById('expenditure-counterparty-id').value || null;
            requestBody.contract_id = document.getElementById('expenditure-contract').value || null;
            requestBody.currency = document.getElementById('expenditure-currency').value;
            requestBody.amount = parseFloat(document.getElementById('expenditure-amount').value);
            requestBody.comment = document.getElementById('expenditure-comment').value;
        }

        try {
            const response = await fetch(sendNewDocUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Ошибка сервера: ${response.status} ${response.statusText}`);
            }

            if (result.success) {
                const oneCResponse = result.response || {}; 

                const newLocalDoc = {
                    id: Date.now(),
                    title: requestBody.title,
                    description: requestBody.description,
                    type: requestBody.doc_type,
                    status: 'pending',
                    creatorId: userId,
                    signerId: 'manager', 
                    
                    guid: oneCResponse.GUID || null,
                    externalNumber: oneCResponse.Номер || null,

                    amount: requestBody.amount || null,
                    recipient: requestBody.recipient || null,
                    startDate: requestBody.start_date || null,
                    endDate: requestBody.end_date || null,
                    leaveType: requestBody.leave_type || null,
                    
                    operationType: requestBody.operation_type || null,
                    submissionDate: requestBody.submission_date || null,
                    expenseDate: requestBody.expense_date || null,
                    paymentForm: requestBody.payment_form || null,
                    counterpartyName: allCounterparties.find(cp => String(cp.id) === String(requestBody.counterparty_id))?.name || null,
                    contractName: requestBody.contract_id ? (contractsByCounterparty[requestBody.counterparty_id]?.find(c => String(c.id) === String(requestBody.contract_id))?.name || `Договор ID ${requestBody.contract_id}`) : null,
                    currency: requestBody.currency || null,
                    comment: requestBody.comment || null,
                };

                documents.push(newLocalDoc);

                document.getElementById('create-doc-form').reset();
                document.getElementById('specific-fields-container').innerHTML = '';
                document.getElementById('create-form-section').classList.add('hidden');
                document.getElementById('document-list-section').classList.remove('hidden');
                document.getElementById('main-title').textContent = 'Список Документов';
                renderDocumentList(documents);
                updateSidebarCounts();
                showCustomAlert(`Документ "${newLocalDoc.title}" успешно создан и отправлен в 1С. (GUID: ${newLocalDoc.guid || 'N/A'})`);

            } else {
                showCustomAlert(result.error || 'Неизвестная ошибка при создании документа.');
            }

        } catch (error) {
            console.error('Error submitting document:', error);
            showCustomAlert(`Ошибка при отправке документа: ${error.message}`);
        }
    });

    // Global click listener for hiding user dropdown (attached once)
    document.addEventListener('click', function(event) {
        const userDropdownMenu = document.getElementById('user-dropdown-menu');
        // Check if the dropdown menu exists and if the click was outside it or its parent trigger
        if (userDropdownMenu && !userDropdownMenu.classList.contains('hidden')) { // Only act if it's visible
            const userDropdownTrigger = userDropdownMenu.parentElement; // The div with onclick="toggleUserDropdown(event)"

            if (userDropdownTrigger && !userDropdownTrigger.contains(event.target)) {
                userDropdownMenu.classList.add('hidden');
            }
        }
    });

    // Initial filter application
    filterBy('all');
});

// Window resize listener (can be outside DOMContentLoaded as it listens to window)
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('hidden');
    } else {
        document.getElementById('sidebar').classList.remove('open');
        // Do not show overlay on resize if not already open
    }
});