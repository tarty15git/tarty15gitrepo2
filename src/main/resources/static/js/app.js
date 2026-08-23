let currentUser = null;
let phases = [];
let applications = [];
let currentTabName = 'dashboard';

document.addEventListener("DOMContentLoaded", () => {
    loadSavedTheme();
    checkCurrentUser();
});

function applyColorTheme(themeName) {
    if (!themeName || themeName === 'default') {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('sdme_theme', 'default');
    } else {
        document.body.setAttribute('data-theme', themeName);
        localStorage.setItem('sdme_theme', themeName);
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('sdme_theme') || 'default';
    applyColorTheme(savedTheme);
}

async function checkCurrentUser() {
    try {
        const res = await fetch('/api/auth/current-user');
        if (res.ok) {
            currentUser = await res.json();
            renderAppView();
        } else {
            renderLoginView();
        }
    } catch (e) {
        renderLoginView();
    }
}

function renderLoginView() {
    document.getElementById('app-root').innerHTML = `
        <div style="max-width: 400px; margin: 80px auto;" class="card">
            <h2 style="text-align: center; color: var(--primary);">SDME System Login</h2>
            <form id="login-form">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="username" required value="admin">
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" required value="Admin123!">
                        <span class="password-toggle-eye" onclick="togglePasswordVisibility()">👁️</span>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
            </form>
            <div id="login-err" style="color: red; font-size: 12px; margin-top: 10px; text-align: center;"></div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            checkCurrentUser();
        } else {
            const data = await res.json();
            document.getElementById('login-err').innerText = data.error || 'Login failed';
        }
    });
}

function togglePasswordVisibility() {
    const pwdInput = document.getElementById('password');
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
    } else {
        pwdInput.type = 'password';
    }
}

function toggleAdminPasswordVisibility() {
    const pwdInput = document.getElementById('new-user-pass');
    if (pwdInput) {
        if (pwdInput.type === 'password') {
            pwdInput.type = 'text';
        } else {
            pwdInput.type = 'password';
        }
    }
}

function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('status-alert');
    if (!alertBox) return;
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = type === 'success' ? '#dcfce7' : (type === 'warning' ? '#fef3c7' : '#fee2e2');
    alertBox.style.color = type === 'success' ? '#166534' : (type === 'warning' ? '#92400e' : '#991b1b');
    alertBox.style.border = `1px solid ${type === 'success' ? '#86efac' : (type === 'warning' ? '#fde68a' : '#fca5a5')}`;
    alertBox.innerHTML = message;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDeleteConfirmationBanner(docId) {
    const confirmHtml = `
        <div class="card" style="border-left: 6px solid var(--danger); background-color: #fff1f2; margin-bottom: 20px; padding: 15px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: var(--danger);">In-Page Deletion Confirmation Required</h4>
                    <span style="font-size: 13px; color: #991b1b;">Are you sure you want to delete document ID <strong>#${docId}</strong>? This action will permanently remove the record and physical file from the system.</span>
                </div>
                <div>
                    <button class="btn btn-danger" style="padding: 8px 16px; margin-right: 10px;" onclick="confirmDeleteSubmittedDocument(${docId})">Confirm Delete</button>
                    <button class="btn btn-primary" style="padding: 8px 16px;" onclick="cancelDeleteSubmittedDocument()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    showAlert(confirmHtml, 'warning');
}

function cancelDeleteSubmittedDocument() {
    const alertBox = document.getElementById('status-alert');
    if (alertBox) alertBox.style.display = 'none';
}

async function confirmDeleteSubmittedDocument(docId) {
    const res = await fetch(`/api/sdm/documents/${docId}`, { method: 'DELETE' });
    if (res.ok) {
        showAlert('Submitted document deleted successfully.', 'success');
        refreshCurrentTab();
    } else {
        const data = await res.json();
        showAlert('Failed to delete document: ' + (data.error || 'Server error'), 'danger');
    }
}

async function renderAppView() {
    await loadInitialData();

    document.getElementById('app-root').innerHTML = `
        <header>
            <div>
                <h1>Software Development Document Environment (SDME)</h1>
                <span style="font-size: 12px; opacity: 0.8;">Active App Code: CTH | Logged in as: <strong>${currentUser.fullName} (${currentUser.role})</strong></span>
            </div>
            <div>
                <button class="btn btn-danger" onclick="handleLogout()">Logout</button>
            </div>
        </header>

        <div class="container">
            <div id="status-alert" style="display: none; padding: 12px 20px; border-radius: 6px; margin-bottom: 20px; font-weight: 600; font-size: 14px;"></div>

            <div class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('dashboard', this)">Dashboard</button>
                <button class="tab-btn" onclick="switchTab('phases', this)">SDM Deliverable Phases</button>
                <button class="tab-btn" onclick="switchTab('approvals', this)">Approvals</button>
                <button class="tab-btn" onclick="switchTab('reports', this)">Reports & Analytics</button>
                <button class="tab-btn" onclick="switchTab('ai-agents', this)">Agents</button>
                ${currentUser.role === 'ADMIN' ? '<button class="tab-btn" onclick="switchTab(\'admin\', this)">Admin Setup & Templates</button>' : ''}
            </div>

            <div id="tab-content">
                <!-- Dynamic Content Loaded Here -->
            </div>
        </div>
    `;

    renderDashboardTab();
}

async function loadInitialData() {
    const [pRes, aRes] = await Promise.all([
        fetch('/api/sdm/phases'),
        fetch('/api/sdm/applications')
    ]);
    if (pRes.ok) phases = await pRes.ok ? await pRes.json() : [];
    if (aRes.ok) applications = await aRes.ok ? await aRes.json() : [];
}

function switchTab(tabName, btn) {
    currentTabName = tabName;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (tabName === 'dashboard') renderDashboardTab();
    else if (tabName === 'phases') renderPhasesTab();
    else if (tabName === 'approvals') renderApprovalsTab();
    else if (tabName === 'reports') renderReportsTab();
    else if (tabName === 'ai-agents') renderAiAgentsTab();
    else if (tabName === 'admin') renderAdminTab();
}

function refreshCurrentTab() {
    if (currentTabName === 'dashboard') renderDashboardTab();
    else if (currentTabName === 'phases') renderPhasesTab();
    else if (currentTabName === 'approvals') renderApprovalsTab();
    else if (currentTabName === 'reports') renderReportsTab();
    else if (currentTabName === 'ai-agents') renderAiAgentsTab();
    else if (currentTabName === 'admin') renderAdminTab();
}

function openInAppDocumentViewer(docId, docTitle) {
    const container = document.getElementById('tab-content');
    const viewerHtml = `
        <div class="card" style="border-top: 4px solid var(--primary-light);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div>
                    <h3 style="margin: 0;">In-Page Document Viewer: ${docTitle}</h3>
                    <span style="font-size: 12px; color: #64748b;">Viewing document directly within embedded webpage frame in original format</span>
                </div>
                <div>
                    <a href="/api/sdm/documents/${docId}/download" class="btn btn-success" style="text-decoration: none;">Download Original File</a>
                    <button class="btn btn-primary" onclick="refreshCurrentTab()">Close Viewer</button>
                </div>
            </div>
            <div style="width: 100%; height: 600px; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: #f8fafc;">
                <iframe src="/api/sdm/documents/${docId}/view" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
        </div>
    `;
    container.innerHTML = viewerHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function renderDashboardTab() {
    const dRes = await fetch('/api/sdm/documents');
    const docs = dRes.ok ? await dRes.json() : [];

    const pending = docs.filter(d => d.status === 'PEND' || d.status === 'PENDING_APPROVAL').length;
    const approved = docs.filter(d => d.status === 'APPROVED').length;
    const rejected = docs.filter(d => d.status === 'REJECTED').length;

    document.getElementById('tab-content').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px;">
            <div class="card" style="border-left: 5px solid var(--primary-light);">
                <h3>Total Documents</h3>
                <h2 style="font-size: 28px; margin: 5px 0;">${docs.length}</h2>
            </div>
            <div class="card" style="border-left: 5px solid var(--warning);">
                <h3>Pending Approvals</h3>
                <h2 style="font-size: 28px; margin: 5px 0; color: var(--warning);">${pending}</h2>
            </div>
            <div class="card" style="border-left: 5px solid var(--success);">
                <h3>Approved Deliverables</h3>
                <h2 style="font-size: 28px; margin: 5px 0; color: var(--success);">${approved}</h2>
            </div>
            <div class="card" style="border-left: 5px solid var(--danger);">
                <h3>Rejected Deliverables</h3>
                <h2 style="font-size: 28px; margin: 5px 0; color: var(--danger);">${rejected}</h2>
            </div>
        </div>

        <div class="card">
            <h3>Recent Document Submissions</h3>
            <table>
                <thead>
                    <tr>
                        <th>Doc ID Code</th>
                        <th>App Code</th>
                        <th>Phase</th>
                        <th>Document Title</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Maker</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${docs.map(d => `
                        <tr>
                            <td><strong>${d.docIdCode}</strong></td>
                            <td>${d.appCode}</td>
                            <td>${d.phase.phaseName}</td>
                            <td>${d.documentTitle}</td>
                            <td>${d.versionNumber}</td>
                            <td><span class="badge badge-${d.status.toLowerCase()}">${d.status}</span></td>
                            <td>${d.makerUsername}</td>
                            <td>
                                <button class="btn btn-primary" style="padding: 4px 8px;" onclick="openInAppDocumentViewer(${d.id}, '${d.documentTitle.replace(/'/g, "\\'")}')">View Doc</button>
                                <a href="/api/sdm/documents/${d.id}/download" class="btn btn-success" style="padding: 4px 8px; text-decoration: none;">Download</a>
                                <button class="btn btn-primary" style="padding: 4px 8px;" onclick="triggerAiReview(${d.id})">AI Review</button>
                                <button class="btn btn-danger" style="padding: 4px 8px;" onclick="handleDeleteSubmittedDocument(${d.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderPhasesTab() {
    const [dRes, tRes] = await Promise.all([
        fetch('/api/sdm/documents'),
        fetch('/api/sdm/templates')
    ]);
    const docs = dRes.ok ? await dRes.json() : [];
    const templates = tRes.ok ? await tRes.json() : [];

    // Inline Submission Form Section directly at the TOP
    let html = `
        <div class="card" style="margin-bottom: 25px; border-top: 4px solid var(--primary-light);">
            <h3>Submit Deliverable Document</h3>
            <p style="font-size: 12px; color: #64748b;">Fill in all relevant fields below and attach document to submit directly to the platform.</p>

            <form id="inline-submit-form" onsubmit="handleInlineSubmit(event)">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div class="input-group">
                        <label>Application Code (3-Character)</label>
                        <input type="text" id="sub-app-code" value="CTH" maxlength="3" required style="text-transform: uppercase;">
                    </div>
                    <div class="input-group">
                        <label>Target Phase</label>
                        <select id="sub-phase-id" required>
                            ${phases.map(p => `<option value="${p.id}">Phase ${p.phaseNumber}: ${p.phaseName}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Document Code</label>
                        <input type="text" id="sub-doc-code" placeholder="e.g. DOC-SPEC-01" required>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div class="input-group">
                        <label>Document Title</label>
                        <input type="text" id="sub-doc-title" placeholder="e.g. Architecture Design Specification" required>
                    </div>
                    <div class="input-group">
                        <label>Version Number</label>
                        <input type="text" id="sub-version" value="1.0" required>
                    </div>
                </div>

                <div class="input-group">
                    <label>Description</label>
                    <textarea id="sub-description" rows="3" placeholder="Enter document scope or deliverable details..."></textarea>
                </div>

                <div class="input-group">
                    <label>Attach Deliverable File (.docx, .xlsx, .pptx, .xml, .pdf)</label>
                    <input type="file" id="sub-file" required>
                </div>

                <button type="submit" class="btn btn-primary" style="padding: 10px 20px;">Submit Deliverable Document</button>
            </form>
        </div>
    `;

    // Phase frames grid beneath submission section
    html += `<div class="phase-grid">`;
    phases.forEach(phase => {
        const phaseDocs = docs.filter(d => d.phase.id === phase.id);
        const phaseTemplates = templates.filter(t => t.phase && t.phase.id === phase.id);

        html += `
            <div class="phase-frame">
                <h3>Phase ${phase.phaseNumber}: ${phase.phaseName}</h3>
                <p style="font-size: 12px; color: #64748b;">${phase.description}</p>

                ${phaseTemplates.length > 0 ? `
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; margin-top: 10px;">
                        <h5 style="margin: 0 0 5px 0; color: #166534;">Compliance Templates & Guidelines</h5>
                        ${phaseTemplates.map(t => `
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 4px;">
                                <span><strong>${t.templateCode}:</strong> ${t.documentTitle} (v${t.versionNumber})</span>
                                <a href="/api/sdm/templates/${t.id}/download" class="btn btn-success" style="padding: 2px 6px; font-size: 10px; text-decoration: none;">Download Template</a>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <h4 style="margin-top: 15px;">Deliverable Documents</h4>
                ${phaseDocs.length === 0 ? '<p style="font-size: 12px; color: #94a3b8;">No documents submitted for this phase.</p>' : `
                    <table>
                        <thead>
                            <tr>
                                <th>Doc ID</th>
                                <th>Title</th>
                                <th>Code</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${phaseDocs.map(d => `
                                <tr>
                                    <td><strong>${d.docIdCode}</strong></td>
                                    <td>${d.documentTitle}</td>
                                    <td>${d.documentCode}</td>
                                    <td><span class="badge badge-${d.status.toLowerCase().replace('_approval', '')}">${d.status}</span></td>
                                    <td>
                                        <button class="btn btn-primary" style="padding: 2px 6px; font-size: 11px;" onclick="openInAppDocumentViewer(${d.id}, '${d.documentTitle.replace(/'/g, "\\'")}')">View</button>
                                        <a href="/api/sdm/documents/${d.id}/download" class="btn btn-success" style="padding: 2px 6px; text-decoration: none; font-size: 11px;">Download</a>
                                        <button class="btn btn-danger" style="padding: 2px 6px; font-size: 11px;" onclick="handleDeleteSubmittedDocument(${d.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>
        `;
    });
    html += `</div>`;

    document.getElementById('tab-content').innerHTML = html;
}

async function handleInlineSubmit(event) {
    event.preventDefault();

    const appCode = document.getElementById('sub-app-code').value.toUpperCase();
    const phaseId = document.getElementById('sub-phase-id').value;
    const docCode = document.getElementById('sub-doc-code').value;
    const docTitle = document.getElementById('sub-doc-title').value;
    const versionNumber = document.getElementById('sub-version').value;
    const description = document.getElementById('sub-description').value;
    const fileInput = document.getElementById('sub-file');

    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert("Please select a file to upload.", "danger");
        return;
    }

    const formData = new FormData();
    formData.append('appCode', appCode);
    formData.append('phaseId', phaseId);
    formData.append('documentTitle', docTitle);
    formData.append('documentCode', docCode);
    formData.append('versionNumber', versionNumber);
    formData.append('description', description);
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch('/api/sdm/documents/submit', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            showAlert('Document deliverable submitted successfully!', "success");
            renderPhasesTab();
        } else {
            const data = await res.json();
            showAlert('Submission failed: ' + (data.error || 'Server error'), "danger");
        }
    } catch (e) {
        showAlert('Error submitting document: ' + e.message, "danger");
    }
}

async function renderApprovalsTab() {
    const res = await fetch('/api/sdm/documents?status=PENDING_APPROVAL');
    let docs = res.ok ? await res.json() : [];
    if (docs.length === 0) {
        const allRes = await fetch('/api/sdm/documents');
        const allDocs = allRes.ok ? await allRes.json() : [];
        docs = allDocs.filter(d => d.status === 'PEND' || d.status === 'PENDING_APPROVAL');
    }

    document.getElementById('tab-content').innerHTML = `
        <div class="card">
            <h3>Approvals (Hard Gate Sign-off)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Doc ID Code</th>
                        <th>App Code</th>
                        <th>Phase</th>
                        <th>Document Title</th>
                        <th>Maker</th>
                        <th>Submitted Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${docs.map(d => `
                        <tr>
                            <td><strong>${d.docIdCode}</strong></td>
                            <td>${d.appCode}</td>
                            <td>${d.phase.phaseName}</td>
                            <td>${d.documentTitle}</td>
                            <td>${d.makerUsername}</td>
                            <td>${d.createdAt}</td>
                            <td>
                                <button class="btn btn-primary" style="padding: 4px 8px;" onclick="openInAppDocumentViewer(${d.id}, '${d.documentTitle.replace(/'/g, "\\'")}')">View Doc</button>
                                <a href="/api/sdm/documents/${d.id}/download" class="btn btn-success" style="padding: 4px 8px; text-decoration: none;">Download</a>
                                <button class="btn btn-success" onclick="processApprovalAction(${d.id}, 'APPROVE')">Approve</button>
                                <button class="btn btn-danger" onclick="processApprovalAction(${d.id}, 'REJECT')">Reject</button>
                                <button class="btn btn-danger" onclick="handleDeleteSubmittedDocument(${d.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function processApprovalAction(docId, action) {
    const remarkInput = document.getElementById(`remarks-${docId}`);
    const remarks = remarkInput ? remarkInput.value : "Standard Maker-Checker verification completed.";

    const res = await fetch(`/api/sdm/documents/${docId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks })
    });

    if (res.ok) {
        showAlert(`Document ${action.toLowerCase()}d successfully.`, "success");
        renderApprovalsTab();
    } else {
        const data = await res.json();
        showAlert('Action failed: ' + data.error, "danger");
    }
}

async function renderReportsTab() {
    const res = await fetch('/api/reports/online');
    const docs = res.ok ? await res.json() : [];

    document.getElementById('tab-content').innerHTML = `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3>Export Reports</h3>
                <p style="font-size: 12px; color: #64748b;">Download official compliance & status reports in PDF or Excel.</p>
            </div>
            <div>
                <a href="/api/reports/download/pdf" class="btn btn-primary" target="_blank">Download PDF Report</a>
                <a href="/api/reports/download/excel" class="btn btn-success" target="_blank">Download Excel Report</a>
            </div>
        </div>

        <div class="card">
            <h3>Online Interactive Status Report</h3>
            <table>
                <thead>
                    <tr>
                        <th>Doc ID Code</th>
                        <th>App Code</th>
                        <th>Phase</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Maker Username</th>
                        <th>Approver Name</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    ${docs.map(d => `
                        <tr>
                            <td><strong>${d.docIdCode}</strong></td>
                            <td>${d.appCode}</td>
                            <td>${d.phase.phaseName}</td>
                            <td>${d.documentTitle}</td>
                            <td><span class="badge badge-${d.status.toLowerCase().replace('_approval', '')}">${d.status}</span></td>
                            <td>${d.makerUsername}</td>
                            <td>${d.checkerUsername || '-'}</td>
                            <td>${d.updatedAt}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function triggerAiReview(docId) {
    showAlert("Triggering 4 AI Agents Pipeline...", "success");
    const res = await fetch(`/api/ai/agents/process/${docId}`, { method: 'POST' });
    if (res.ok) {
        showAlert("Agents Pipeline Execution Complete!", "success");
        renderAiAgentsTab(docId);
    } else {
        showAlert("Agents Pipeline Execution Failed.", "danger");
    }
}

async function renderAiAgentsTab(selectedDocId = null) {
    const dRes = await fetch('/api/sdm/documents');
    const docs = dRes.ok ? await dRes.json() : [];
    const docId = selectedDocId || (docs.length > 0 ? docs[0].id : null);

    let reviews = [];
    if (docId) {
        const rRes = await fetch(`/api/ai/agents/reviews/${docId}`);
        reviews = rRes.ok ? await rRes.json() : [];
    }

    document.getElementById('tab-content').innerHTML = `
        <div class="card">
            <h3>Agents Framework - SDM Deliverable Processing</h3>
            <p style="font-size: 12px; color: #64748b;">Delegated AI agent framework featuring Document Processor, Result Drafter, Reviewer (Hard Gates), and Log Integrity Auditor agents.</p>

            <div style="margin-bottom: 15px;">
                <label style="font-size: 12px; font-weight: bold;">Select Document to Inspect Agent Reviews:</label>
                <select onchange="renderAiAgentsTab(this.value)" style="padding: 6px; width: 300px;">
                    ${docs.map(d => `<option value="${d.id}" ${d.id == docId ? 'selected' : ''}>${d.docIdCode} - ${d.documentTitle}</option>`).join('')}
                </select>
                <button class="btn btn-primary" onclick="triggerAiReview(${docId})">Run Agents</button>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            ${reviews.map(r => `
                <div class="card" style="border-top: 4px solid var(--primary-light);">
                    <div style="display: flex; justify-content: space-between;">
                        <h4>${r.agentName}</h4>
                        <span class="badge badge-approved">${r.status}</span>
                    </div>
                    <p style="font-size: 11px; font-weight: bold; color: var(--primary);">${r.agentRole} | Score: ${r.score}</p>
                    <pre style="background: #f1f5f9; padding: 10px; border-radius: 4px; font-size: 11px; white-space: pre-wrap;">${r.outputText}</pre>
                </div>
            `).join('')}
        </div>
    `;
}

async function renderAdminTab() {
    const [cRes, uRes, rRes, tRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
        fetch('/api/admin/templates')
    ]);

    const configs = cRes.ok ? await cRes.json() : {};
    const users = uRes.ok ? await uRes.json() : [];
    const roles = rRes.ok ? await rRes.json() : [];
    const templates = tRes.ok ? await tRes.json() : [];

    const currentTheme = localStorage.getItem('sdme_theme') || 'default';

    document.getElementById('tab-content').innerHTML = `
        <div class="card">
            <h3>UI Color Theme Configuration</h3>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">Select and apply the system interface color palette.</p>
            <div style="display: flex; gap: 15px; align-items: center;">
                <label style="font-size: 13px; font-weight: 600;">System Palette Theme:</label>
                <select id="theme-selector" onchange="applyColorTheme(this.value)" style="padding: 8px; border-radius: 4px; border: 1px solid var(--border); width: 220px;">
                    <option value="default" ${currentTheme === 'default' ? 'selected' : ''}>Default (Navy Blue)</option>
                    <option value="emerald" ${currentTheme === 'emerald' ? 'selected' : ''}>Emerald (Forest Green)</option>
                    <option value="purple" ${currentTheme === 'purple' ? 'selected' : ''}>Purple (Royal Violet)</option>
                    <option value="sunset" ${currentTheme === 'sunset' ? 'selected' : ''}>Sunset (Deep Amber)</option>
                    <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark (Slate Charcoal)</option>
                </select>
            </div>
        </div>

        <div class="card">
            <h3>Document Templates Setup (Admin Only Compliance Guidelines)</h3>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 15px;">Upload official SDM compliance templates (.docx, .xlsx, .pptx, .pdf) that makers download and AI agents validate against.</p>

            <form id="upload-template-form" onsubmit="handleUploadTemplate(event)" style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div class="input-group">
                        <label>Target SDM Phase</label>
                        <select id="tmpl-phase-id" required>
                            ${phases.map(p => `<option value="${p.id}">Phase ${p.phaseNumber}: ${p.phaseName}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Template Code</label>
                        <input type="text" id="tmpl-code" placeholder="e.g. TMPL-ARCH-01" required>
                    </div>
                    <div class="input-group">
                        <label>Document / Template Title</label>
                        <input type="text" id="tmpl-title" placeholder="e.g. Architecture Specification Guidelines" required>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
                    <div class="input-group">
                        <label>Version Number</label>
                        <input type="text" id="tmpl-version" value="1.0" required>
                    </div>
                    <div class="input-group">
                        <label>Description / Guidelines Summary</label>
                        <input type="text" id="tmpl-desc" placeholder="e.g. Mandatory structure for system architecture deliverable">
                    </div>
                </div>

                <div class="input-group">
                    <label>Attach Template File (.docx, .xlsx, .pptx, .xml, .pdf)</label>
                    <input type="file" id="tmpl-file" required>
                </div>

                <button type="submit" class="btn btn-success">+ Upload Compliance Template</button>
            </form>

            <h4 style="margin-top: 20px;">Active Compliance Templates</h4>
            ${templates.length === 0 ? '<p style="font-size: 12px; color: #94a3b8;">No compliance templates uploaded yet.</p>' : `
                <table>
                    <thead>
                        <tr>
                            <th>Template Code</th>
                            <th>Target Phase</th>
                            <th>Title</th>
                            <th>Version</th>
                            <th>Uploaded By</th>
                            <th>Last Uploaded</th>
                            <th>Document Timestamp</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${templates.map(t => `
                            <tr>
                                <td><strong>${t.templateCode}</strong></td>
                                <td>Phase ${t.phase ? t.phase.phaseNumber : '-'}: ${t.phase ? t.phase.phaseName : '-'}</td>
                                <td>${t.documentTitle}</td>
                                <td>${t.versionNumber}</td>
                                <td>${t.uploadedBy || 'admin'}</td>
                                <td>${t.updatedAt || t.createdAt}</td>
                                <td>${t.createdAt}</td>
                                <td>
                                    <a href="/api/sdm/templates/${t.id}/download" class="btn btn-primary" style="padding: 4px 8px; text-decoration: none;">Download</a>
                                    <button class="btn btn-danger" style="padding: 4px 8px;" onclick="handleDeleteTemplate(${t.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>

        <div class="card">
            <h3>Role Management (Add / Amend / Delete System Roles & Permitted Actions)</h3>
            <form id="create-role-form" onsubmit="handleCreateRole(event)" style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 10px;">
                    <div class="input-group" style="margin-bottom: 0;">
                        <label>Role Code / Name</label>
                        <input type="text" id="new-role-name" placeholder="e.g. AUDITOR" required style="text-transform: uppercase;">
                    </div>
                    <div class="input-group" style="margin-bottom: 0;">
                        <label>Description</label>
                        <input type="text" id="new-role-desc" placeholder="e.g. Compliance & Security Auditor" required>
                    </div>
                </div>
                <div class="input-group" style="margin-bottom: 10px;">
                    <label>Permitted Actions / Permissions</label>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 12px; margin-top: 5px;">
                        <label><input type="checkbox" name="new-role-action" value="SUBMIT_DOC" checked> Submit Deliverable</label>
                        <label><input type="checkbox" name="new-role-action" value="APPROVE_DOC"> Approve Deliverable</label>
                        <label><input type="checkbox" name="new-role-action" value="DELETE_DOC"> Delete Deliverable</label>
                        <label><input type="checkbox" name="new-role-action" value="EXPORT_REPORT" checked> Export Reports</label>
                        <label><input type="checkbox" name="new-role-action" value="MANAGE_USERS"> Manage Users</label>
                        <label><input type="checkbox" name="new-role-action" value="MANAGE_ROLES"> Manage Roles</label>
                    </div>
                </div>
                <button type="submit" class="btn btn-success">+ Add Role</button>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Permitted Actions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${roles.map(r => `
                        <tr>
                            <td><strong>${r.roleName}</strong></td>
                            <td>
                                <input type="text" id="role-desc-${r.id}" value="${r.description || ''}" style="width: 100%; padding: 4px;">
                            </td>
                            <td>
                                <input type="text" id="role-actions-${r.id}" value="${r.permittedActions || ''}" style="width: 100%; padding: 4px;" placeholder="SUBMIT_DOC,VIEW_DOC">
                            </td>
                            <td>
                                <button class="btn btn-primary" onclick="handleAmendRole(${r.id})">Amend Role</button>
                                ${['ADMIN', 'MAKER', 'CHECKER'].includes(r.roleName) ? '' : `<button class="btn btn-danger" onclick="handleDeleteRole(${r.id})">Delete</button>`}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h3>Add New System User</h3>
            <form id="create-user-form" onsubmit="handleCreateUser(event)">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div class="input-group">
                        <label>Username</label>
                        <input type="text" id="new-user-name" placeholder="e.g. maker2" required>
                    </div>
                    <div class="input-group">
                        <label>Password</label>
                        <div class="password-wrapper">
                            <input type="password" id="new-user-pass" placeholder="e.g. User123!" required>
                            <span class="password-toggle-eye" onclick="toggleAdminPasswordVisibility()">👁️</span>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Role</label>
                        <select id="new-user-role" required>
                            ${roles.map(r => `<option value="${r.roleName}">${r.roleName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div class="input-group">
                        <label>Full Name</label>
                        <input type="text" id="new-user-fullname" placeholder="e.g. John Doe" required>
                    </div>
                    <div class="input-group">
                        <label>Email Address</label>
                        <input type="email" id="new-user-email" placeholder="e.g. john@cth.com" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-success">+ Create User Account</button>
            </form>
        </div>

        <div class="card">
            <h3>System Toggles & Configuration Setup</h3>
            <form id="config-form">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div class="input-group">
                        <label>AUTH_LDAP_ENABLED (Active Directory)</label>
                        <select id="cfg-ldap">
                            <option value="true" ${configs.AUTH_LDAP_ENABLED === 'true' ? 'selected' : ''}>ENABLED</option>
                            <option value="false" ${configs.AUTH_LDAP_ENABLED === 'false' ? 'selected' : ''}>DISABLED</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>NOTIF_SMS_ENABLED</label>
                        <select id="cfg-sms">
                            <option value="true" ${configs.NOTIF_SMS_ENABLED === 'true' ? 'selected' : ''}>ENABLED</option>
                            <option value="false" ${configs.NOTIF_SMS_ENABLED === 'false' ? 'selected' : ''}>DISABLED</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>NOTIF_EMAIL_ENABLED</label>
                        <select id="cfg-email">
                            <option value="true" ${configs.NOTIF_EMAIL_ENABLED === 'true' ? 'selected' : ''}>ENABLED</option>
                            <option value="false" ${configs.NOTIF_EMAIL_ENABLED === 'false' ? 'selected' : ''}>DISABLED</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Application Name</label>
                        <input type="text" id="cfg-app-name" value="${configs.APP_NAME || ''}">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Save System Configuration</button>
            </form>
        </div>

        <div class="card">
            <h3>User Maintenance & Account Controls</h3>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td><strong>${u.username}</strong></td>
                            <td>${u.fullName}</td>
                            <td>${u.email}</td>
                            <td>${u.role}</td>
                            <td>${u.locked ? '<span class="badge badge-rejected">LOCKED</span>' : '<span class="badge badge-approved">ACTIVE</span>'}</td>
                            <td>
                                <button class="btn btn-primary" onclick="toggleUserLock(${u.id})">${u.locked ? 'Unlock' : 'Lock'}</button>
                                <button class="btn btn-primary" onclick="resetUserPassword(${u.id})">Reset Pass</button>
                                <button class="btn btn-danger" onclick="deleteUserAccount(${u.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            AUTH_LDAP_ENABLED: document.getElementById('cfg-ldap').value,
            NOTIF_SMS_ENABLED: document.getElementById('cfg-sms').value,
            NOTIF_EMAIL_ENABLED: document.getElementById('cfg-email').value,
            APP_NAME: document.getElementById('cfg-app-name').value
        };

        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) showAlert('Configurations saved successfully!', 'success');
    });
}

async function handleCreateRole(e) {
    e.preventDefault();
    const checkedActions = Array.from(document.querySelectorAll('input[name="new-role-action"]:checked')).map(cb => cb.value);
    const payload = {
        roleName: document.getElementById('new-role-name').value.toUpperCase(),
        description: document.getElementById('new-role-desc').value,
        permittedActions: checkedActions.join(',')
    };

    const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        showAlert(`Role ${payload.roleName} added successfully!`, 'success');
        renderAdminTab();
    } else {
        const data = await res.json();
        showAlert('Role creation failed: ' + data.error, 'danger');
    }
}

async function handleAmendRole(roleId) {
    const descInput = document.getElementById(`role-desc-${roleId}`);
    const actionsInput = document.getElementById(`role-actions-${roleId}`);
    const newDescription = descInput ? descInput.value : '';
    const newActions = actionsInput ? actionsInput.value : '';

    const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription, permittedActions: newActions })
    });

    if (res.ok) {
        showAlert('Role amended successfully!', 'success');
        renderAdminTab();
    } else {
        const data = await res.json();
        showAlert('Amend role failed: ' + data.error, 'danger');
    }
}

async function handleDeleteRole(roleId) {
    const res = await fetch(`/api/admin/roles/${roleId}`, { method: 'DELETE' });
    if (res.ok) {
        showAlert('Role deleted successfully.', 'success');
        renderAdminTab();
    } else {
        const data = await res.json();
        showAlert('Role deletion failed: ' + data.error, 'danger');
    }
}

async function handleCreateUser(e) {
    e.preventDefault();
    const payload = {
        username: document.getElementById('new-user-name').value,
        password: document.getElementById('new-user-pass').value,
        role: document.getElementById('new-user-role').value,
        fullName: document.getElementById('new-user-fullname').value,
        email: document.getElementById('new-user-email').value
    };

    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        showAlert(`User account ${payload.username} created successfully!`, 'success');
        renderAdminTab();
    } else {
        const data = await res.json();
        showAlert('User creation failed: ' + data.error, 'danger');
    }
}

async function deleteUserAccount(userId) {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    if (res.ok) {
        showAlert('User account deleted successfully.', 'success');
        renderAdminTab();
    } else {
        const data = await res.json();
        showAlert('Delete failed: ' + data.error, 'danger');
    }
}

async function handleDeleteSubmittedDocument(docId) {
    showDeleteConfirmationBanner(docId);
}

async function toggleUserLock(userId) {
    const res = await fetch(`/api/admin/users/${userId}/toggle-lock`, { method: 'PUT' });
    if (res.ok) renderAdminTab();
}

async function resetUserPassword(userId) {
    const newPassword = "ResetPassword123!";
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
    });

    if (res.ok) showAlert(`Password reset successfully for user ID ${userId}. Temporary password: ${newPassword}`, 'success');
}

async function handleUploadTemplate(e) {
    e.preventDefault();
    const phaseId = document.getElementById('tmpl-phase-id').value;
    const templateCode = document.getElementById('tmpl-code').value;
    const documentTitle = document.getElementById('tmpl-title').value;
    const versionNumber = document.getElementById('tmpl-version').value;
    const description = document.getElementById('tmpl-desc').value;
    const fileInput = document.getElementById('tmpl-file');

    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert("Please select a template file to upload.", "danger");
        return;
    }

    const formData = new FormData();
    formData.append('phaseId', phaseId);
    formData.append('templateCode', templateCode);
    formData.append('documentTitle', documentTitle);
    formData.append('versionNumber', versionNumber);
    formData.append('description', description);
    formData.append('uploadedBy', currentUser ? currentUser.username : 'admin');
    formData.append('file', fileInput.files[0]);

    try {
        const res = await fetch('/api/admin/templates/upload', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            showAlert('Compliance document template uploaded successfully!', 'success');
            renderAdminTab();
        } else {
            const data = await res.json();
            showAlert('Upload failed: ' + (data.error || 'Server error'), 'danger');
        }
    } catch (err) {
        showAlert('Error uploading template: ' + err.message, 'danger');
    }
}

async function handleDeleteTemplate(templateId) {
    const res = await fetch(`/api/admin/templates/${templateId}`, { method: 'DELETE' });
    if (res.ok) {
        showAlert('Compliance template deleted successfully.', 'success');
        renderAdminTab();
    } else {
        const data = await res.json();
        showAlert('Template deletion failed: ' + (data.error || 'Server error'), 'danger');
    }
}

async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
}
