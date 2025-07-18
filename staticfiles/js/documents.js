// Document filtering
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
    
    // In a real implementation, this would make an AJAX call to your Django backend
    console.log(`Filtering by: ${category}`);
}

// Toggle functions
function toggleDocumentFiltersMenu() {
    toggleSubmenu('document-filters-submenu', 'doc-filters-caret');
}

function toggleIncomingMenu() {
    toggleSubmenu('incoming-submenu', 'incoming-caret');
}

function toggleOutgoingMenu() {
    toggleSubmenu('outgoing-submenu', 'outgoing-caret');
}

function toggleCreateDocumentMenu() {
    toggleSubmenu('create-document-submenu', 'create-doc-caret');
}

function toggleSubmenu(submenuId, caretId) {
    const submenu = document.getElementById(submenuId);
    const caret = document.getElementById(caretId);
    submenu.classList.toggle('hidden');
    caret.classList.toggle('fa-caret-down');
    caret.classList.toggle('fa-caret-up');
}

// Form handling
function showCreateForm(type) {
    document.getElementById('document-list-section').classList.add('hidden');
    document.getElementById('create-form-section').classList.remove('hidden');
    document.getElementById('doc-type').value = type;
    document.getElementById('main-title').textContent = `Создать ${getDocTypeName(type)}`;
    
    renderSpecificFormFields(type);
    
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

function cancelCreateForm() {
    document.getElementById('create-doc-form').reset();
    document.getElementById('specific-fields-container').innerHTML = '';
    document.getElementById('create-form-section').classList.add('hidden');
    document.getElementById('document-list-section').classList.remove('hidden');
    document.getElementById('main-title').textContent = 'Список Документов';
}

// Document viewing
function viewDoc(id) {
    // This would be replaced with an AJAX call to get document details
    console.log(`Viewing document with ID: ${id}`);
}

// Helper functions
function getDocTypeName(type) {
    const docTypes = {
        'payment': 'Заявка на оплату',
        'memo': 'Служебная записка',
        'contract': 'Договор',
        'leave': 'Заявка на отпуск',
        'payment_plan': 'План платежей'
    };
    return docTypes[type] || type;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    document.getElementById('create-doc-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission via AJAX
        console.log('Form submitted');
    });
    
    // Initial filter
    filterBy('all');
});