let currentUser = null;
let phases = [];
let applications = [];

document.addEventListener("DOMContentLoaded", () => {
    checkCurrentUser();
});

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
            <div class="nav-tabs">
                <button class="tab-btn active" onclick="switchTab('dashboard', this)">Dashboard</button>
                <button class="tab-btn" onclick="switchTab('phases', this)">7 SDM Deliverable Phases</button>
                <button class="tab-btn" onclick="switchTab('approvals', this)">Maker-Checker Approvals</button>
                <button class="tab-btn" onclick="switchTab('reports', this)">Reports & Analytics</button>
                <button class="tab-btn" onclick="switchTab('ai-agents', this)">Anthropic AI Agents</button>
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
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (tabName === 'dashboard') renderDashboardTab();
    else if (tabName === 'phases') renderPhasesTab();
    else if (tabName === 'approvals') renderApprovalsTab();
    else if (tabName === 'reports') renderReportsTab();
    else if (tabName === 'ai-agents') renderAiAgentsTab();
    else if (tabName === 'admin') renderAdminTab();
}

async function renderDashboardTab() {
    const dRes = await fetch('/api/sdm/documents');
    const docs = dRes.ok ? await dRes.json() : [];

    const pending = docs.filter(d => d.status === 'PENDING_APPROVAL').length;
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
                            <td><span class="badge badge-${d.status.toLowerCase().replace('_approval', '')}">${d.status}</span></td>
                            <td>${d.makerUsername}</td>
                            <td>
                                <button class="btn btn-primary" onclick="triggerAiReview(${d.id})">AI Pipeline Review</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderPhasesTab() {
    const dRes = await fetch('/api/sdm/documents');
    const docs = dRes.ok ? await dRes.json() : [];

    let html = `<div class="phase-grid">`;
    phases.forEach(phase => {
        const phaseDocs = docs.filter(d => d.phase.id === phase.id);
        html += `
            <div class="phase-frame">
                <h3>Phase ${phase.phaseNumber}: ${phase.phaseName}</h3>
                <p style="font-size: 12px; color: #64748b;">${phase.description}</p>

                <h4 style="margin-top: 15px;">Deliverable Documents</h4>
                ${phaseDocs.length === 0 ? '<p style="font-size: 12px; color: #94a3b8;">No documents submitted for this phase.</p>' : `
                    <table>
                        <thead>
                            <tr>
                                <th>Doc ID</th>
                                <th>Title</th>
                                <th>Code</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${phaseDocs.map(d => `
                                <tr>
                                    <td><strong>${d.docIdCode}</strong></td>
                                    <td>${d.documentTitle}</td>
                                    <td>${d.documentCode}</td>
                                    <td><span class="badge badge-${d.status.toLowerCase().replace('_approval', '')}">${d.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" onclick="openSubmitModal(${phase.id})">+ Submit Deliverable</button>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    document.getElementById('tab-content').innerHTML = html;
}

function openSubmitModal(phaseId) {
    const title = prompt("Enter Document Title:");
    if (!title) return;
    const docCode = prompt("Enter Document Code (e.g., DOC-SPEC-01):", "DOC-SPEC-01");
    if (!docCode) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('appCode', 'CTH');
        formData.append('phaseId', phaseId);
        formData.append('documentTitle', title);
        formData.append('documentCode', docCode);
        formData.append('versionNumber', '1.0');
        formData.append('description', 'Standard deliverable submission');
        formData.append('file', file);

        const res = await fetch('/api/sdm/documents/submit', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert('Document submitted successfully!');
            renderPhasesTab();
        } else {
            const data = await res.json();
            alert('Submission failed: ' + data.error);
        }
    };
    fileInput.click();
}

async function renderApprovalsTab() {
    const res = await fetch('/api/sdm/documents?status=PENDING_APPROVAL');
    const docs = res.ok ? await res.json() : [];

    document.getElementById('tab-content').innerHTML = `
        <div class="card">
            <h3>Maker-Checker Approvals (Hard Gate Sign-off)</h3>
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
                                <button class="btn btn-success" onclick="processApprovalAction(${d.id}, 'APPROVE')">Approve</button>
                                <button class="btn btn-danger" onclick="processApprovalAction(${d.id}, 'REJECT')">Reject</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function processApprovalAction(docId, action) {
    const remarks = prompt(`Enter remarks for ${action}:`, "Standard Maker-Checker verification completed.");
    if (remarks === null) return;

    const res = await fetch(`/api/sdm/documents/${docId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks })
    });

    if (res.ok) {
        alert(`Document ${action.toLowerCase()}d successfully.`);
        renderApprovalsTab();
    } else {
        const data = await res.json();
        alert('Action failed: ' + data.error);
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
    alert("Triggering 4 Anthropic AI Agents Pipeline...");
    const res = await fetch(`/api/ai/agents/process/${docId}`, { method: 'POST' });
    if (res.ok) {
        alert("AI Pipeline Execution Complete! Switching to AI Agents tab.");
        renderAiAgentsTab(docId);
    } else {
        alert("AI Pipeline Execution Failed.");
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
            <h3>Anthropic AI Agents Framework - SDM Deliverable Processing</h3>
            <p style="font-size: 12px; color: #64748b;">Delegated AI pipeline featuring Document Processor, Result Drafter, Reviewer (Hard Gates), and Log Integrity Auditor agents.</p>

            <div style="margin-bottom: 15px;">
                <label style="font-size: 12px; font-weight: bold;">Select Document to Inspect Agent Reviews:</label>
                <select onchange="renderAiAgentsTab(this.value)" style="padding: 6px; width: 300px;">
                    ${docs.map(d => `<option value="${d.id}" ${d.id == docId ? 'selected' : ''}>${d.docIdCode} - ${d.documentTitle}</option>`).join('')}
                </select>
                <button class="btn btn-primary" onclick="triggerAiReview(${docId})">Run AI Agents</button>
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
    const cRes = await fetch('/api/config');
    const configs = cRes.ok ? await cRes.json() : {};

    const uRes = await fetch('/api/admin/users');
    const users = uRes.ok ? await uRes.json() : [];

    document.getElementById('tab-content').innerHTML = `
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
                                <button class="btn btn-danger" onclick="toggleUserLock(${u.id})">${u.locked ? 'Unlock' : 'Lock'}</button>
                                <button class="btn btn-primary" onclick="resetUserPassword(${u.id})">Reset Password</button>
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

        if (res.ok) alert('Configurations saved!');
    });
}

async function toggleUserLock(userId) {
    const res = await fetch(`/api/admin/users/${userId}/toggle-lock`, { method: 'PUT' });
    if (res.ok) renderAdminTab();
}

async function resetUserPassword(userId) {
    const password = prompt("Enter new password:");
    if (!password) return;

    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });

    if (res.ok) alert("Password reset successfully!");
}

async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.reload();
}
