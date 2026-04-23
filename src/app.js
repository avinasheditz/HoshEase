import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js';
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js';

// App State & Router
const globalApp = {
    user: null,
    currentView: 'dashboard',
    db: null,
    auth: null,
    
    async init() {
        try {
            console.log('Initializing HospEase Core...');
            const configRes = await fetch('/firebase-applet-config.json');
            if (!configRes.ok) throw new Error('Firebase configuration file not found.');
            const firebaseConfig = await configRes.json();
            
            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);
            this.db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

            onAuthStateChanged(this.auth, (user) => {
                this.user = user;
                this.updateAuthUI(user);
            });

            // Event Listeners
            window.addEventListener('hashchange', () => this.handleRouting());
            
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.login(e));
            }
            
            // Global click delegation for nav
            document.body.addEventListener('click', (e) => {
                const link = e.target.closest('.nav-link');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        this.currentView = href.substring(1);
                        this.handleRouting();
                    }
                }
            });

        } catch (err) {
            console.error('Core init failure:', err);
            this.showGlobalError(`System Initialization Failed: ${err.message}`);
        }
    },

    updateAuthUI(user) {
        const authEl = document.getElementById('auth-app');
        const mainEl = document.getElementById('main-app');
        
        if (user) {
            if (authEl) authEl.style.display = 'none';
            if (mainEl) {
                mainEl.style.display = 'flex';
                mainEl.classList.remove('hidden'); // Ensure tailwind hidden is removed
            }
            this.handleRouting();
        } else {
            if (authEl) authEl.style.display = 'block';
            if (mainEl) mainEl.style.display = 'none';
        }
        if (window.lucide) window.lucide.createIcons();
    },

    showGlobalError(msg) {
        const container = document.body;
        const errDiv = document.createElement('div');
        errDiv.className = 'fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6';
        errDiv.innerHTML = `
            <div class="bg-black p-8 rounded-3xl max-w-md w-full shadow-2xl border border-white/10 text-center">
                <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <i data-lucide="shield-alert" class="text-white w-8 h-8"></i>
                </div>
                <h2 class="text-xl font-black text-white mb-2 tracking-tight">System Decryption Error</h2>
                <p class="text-slate-500 text-sm mb-8 leading-relaxed italic serif">"${msg}"</p>
                <button onclick="window.location.reload()" class="w-full h-12 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform">
                    Retry Signal Authentication
                </button>
            </div>
        `;
        container.appendChild(errDiv);
        if (window.lucide) window.lucide.createIcons();
    },

    handleRouting() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.currentView = hash;
        this.renderView(hash);
        
        // Update active nav with phase-specific coloring
        const phases = ['dashboard', 'hospitals', 'customers', 'trips', 'reviews'];
        document.querySelectorAll('.nav-link').forEach(link => {
            phases.forEach(p => link.classList.remove(`active-${p}`));
            if (link.getAttribute('href') === `#${hash}`) {
                link.classList.add(`active-${hash}`);
            }
        });
        
        const titleEl = document.getElementById('view-title');
        if (titleEl) {
            const displayNames = {
                'dashboard': 'Command Center',
                'hospitals': 'Institution Node',
                'customers': 'Node Registry',
                'trips': 'Mission Log',
                'reviews': 'Sentiment Pulse'
            };
            titleEl.innerText = displayNames[hash] || hash;
        }
        if (window.lucide) window.lucide.createIcons();
    },

    async login(e) {
        e.preventDefault();
        const btn = document.getElementById('login-button');
        if (!btn || !this.auth) return;

        const span = btn.querySelector('span');
        const originalText = span ? span.innerText : 'Login to Dashboard';
        
        const email = document.getElementById('login-username').value.trim().toLowerCase();
        const pass = document.getElementById('login-password').value.trim();

        // LOCAL BYPASS: Prioritize local authentication for demo credentials
        if (email === 'admin@hospice.com' && pass === 'password') {
            console.log('Engaging Local Authentication Bypass.');
            btn.disabled = true;
            if (span) span.innerText = 'Initializing...';
            
            setTimeout(() => {
                this.user = { email: 'admin@hospice.com', displayName: 'System Admin' };
                this.updateAuthUI(this.user);
            }, 800);
            return;
        }

        btn.disabled = true;
        if (span) span.innerText = 'Authenticating...';

        try {
            // Validation
            if (!email.includes('@')) {
                throw new Error('Please enter a valid email address.');
            }

            await signInWithEmailAndPassword(this.auth, email, pass);
        } catch (err) {
            console.error('Login error:', err);
            let message = err.message;
            if (err.code === 'auth/operation-not-allowed') {
                message = 'Email/Password sign-in is not enabled in the Firebase Console. Use admin@hospice.com / password to bypass.';
            } else if (err.code === 'auth/invalid-credential') {
                message = 'Invalid email or password. Please check your hospice credentials.';
            }

            alert('Authentication Failed: ' + message);
            btn.disabled = false;
            if (span) span.innerText = originalText;
        }
    },

    async logout() {
        console.log('Terminating Node Session...');
        try {
            if (this.auth) {
                await signOut(this.auth);
            }
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Force interface reset for local bypass and as a fallback
            this.user = null;
            this.updateAuthUI(null);
            // Clear location hash to reset view state
            window.location.hash = '#dashboard';
        }
    },

    renderView(view) {
        const content = document.getElementById('content-area');
        if (!content) return;
        content.innerHTML = '<div class="animate-pulse flex items-center justify-center h-64 text-slate-500 font-bold italic serif tracking-widest uppercase text-xs">Capturing signal...</div>';
        
        switch(view) {
            case 'dashboard': this.renderDashboard(); break;
            case 'hospitals': this.renderHospitals(); break;
            case 'customers': this.renderCustomers(); break;
            case 'trips': this.renderTrips(); break;
            case 'reviews': this.renderReviews(); break;
            default: content.innerHTML = '<div class="p-8 text-center text-slate-500 font-medium italic serif">Accessing node... View coming soon.</div>';
        }
    },

    getNodeColor(str) {
        if (!str) return 'node-color-0';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `node-color-${Math.abs(hash) % 6}`;
    },

    getStatusStyles(status) {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'completed':
                return 'bg-emerald-950/30 text-emerald-400 border-emerald-800';
            case 'requested':
                return 'bg-amber-950/30 text-amber-400 border-amber-800';
            case 'accepted':
                return 'bg-blue-950/30 text-blue-400 border-blue-800';
            case 'en_route':
                return 'bg-indigo-950/30 text-indigo-400 border-indigo-800';
            case 'inactive':
                return 'bg-slate-900/50 text-slate-500 border-slate-800';
            default:
                return 'bg-slate-900/30 text-slate-400 border-slate-700';
        }
    },

    renderDashboard() {
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                ${this.statCard('Total Hospitals', '128', '+4.5%', 'hospital', false, 'text-blue-500')}
                ${this.statCard('Active Customers', '2,450', '+12.2%', 'users', false, 'text-indigo-500')}
                ${this.statCard('Live Missions', '24', 'Live', 'activity', true, 'text-amber-500')}
                ${this.statCard('System Health', '99.9%', 'Stable', 'shield-check', false, 'text-emerald-500')}
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                    <div class="p-6 border-b border-slate-800 flex items-center justify-between bg-white/2">
                        <h3 class="font-black text-white uppercase tracking-widest text-xs">Live Mission Grid</h3>
                        <span class="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                    </div>
                    <div id="live-trips-list" class="divide-y divide-slate-800">
                        <div class="p-10 text-center text-slate-600 font-medium italic serif tracking-wide">Connecting to encrypted relay...</div>
                    </div>
                </div>
                <div class="bg-slate-900/50 rounded-3xl border border-slate-800 p-8 shadow-sm">
                    <h3 class="font-black text-white mb-8 uppercase tracking-widest text-xs font-sans">Service Performance</h3>
                    <div class="space-y-8">
                        ${this.healthBar('Critical Response', 98, 'bg-rose-500')}
                        ${this.healthBar('Medical Transit', 82, 'bg-amber-500')}
                        ${this.healthBar('Routine Support', 24, 'bg-emerald-500')}
                    </div>
                </div>
            </div>
        `;
        this.syncLiveDashboard();
    },

    renderHospitals() {
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <div class="flex items-center justify-between mb-10">
                <div>
                    <h2 class="text-3xl font-black tracking-tighter text-white mb-1">Hospital Network</h2>
                    <p class="text-sm text-slate-400 font-semibold italic serif">Global oncology and primary care nodes</p>
                </div>
                <button class="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 flex items-center gap-2 hover:bg-blue-600 transition-all hover:scale-[1.02]">
                    <i data-lucide="plus" class="w-4 h-4"></i> New Registry
                </button>
            </div>
            <div class="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-800/10 border-b border-slate-800">
                        <tr>
                            <th class="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 italic serif">Institution</th>
                            <th class="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 italic serif">Location</th>
                            <th class="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 italic serif">Status</th>
                            <th class="px-8 py-5 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 italic serif text-right">Activity</th>
                        </tr>
                    </thead>
                    <tbody id="hospitals-table-body" class="divide-y divide-slate-800/50 font-sans">
                        <tr><td colspan="4" class="p-12 text-center text-slate-600 font-medium italic serif tracking-wide">Syncing institution nodes...</td></tr>
                    </tbody>
                </table>
            </div>
        `;
        this.syncHospitals();
    },

    renderCustomers() {
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <div class="mb-10">
                <h2 class="text-3xl font-black tracking-tighter text-white mb-1">Access Registry</h2>
                <p class="text-sm text-slate-400 font-semibold italic serif">Global patient and user identity database</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="customers-grid">
                <div class="col-span-full p-12 text-center text-slate-500 font-medium italic serif tracking-wide">Accessing encrypted patient archives...</div>
            </div>
        `;
        this.syncCustomers();
    },

    renderTrips() {
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <div class="mb-10 flex items-center justify-between">
                <div>
                    <h2 class="text-3xl font-black tracking-tighter text-white mb-1">Mission Log</h2>
                    <p class="text-sm text-slate-400 font-semibold italic serif">Comprehensive transcript of all medical transits</p>
                </div>
                <div class="flex gap-3">
                    <input type="text" id="mission-search" placeholder="Search mission ID..." class="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none min-w-[280px] font-medium placeholder:text-slate-600 text-white">
                </div>
            </div>
            <div class="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-sm" id="trips-master-list">
                 <div class="p-12 text-center text-slate-600 font-medium italic serif tracking-wide">Capturing active transit vectors...</div>
            </div>
        `;
        this.syncAllTrips();

        const searchInput = document.getElementById('mission-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTrips(e.target.value));
        }
    },

    renderReviews() {
        const content = document.getElementById('content-area');
        content.innerHTML = `
            <div class="mb-10">
                <h2 class="text-3xl font-black tracking-tighter text-white mb-1">Patient Sentiment</h2>
                <p class="text-sm text-slate-400 font-semibold italic serif">Qualitative feedback and network moderation</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="reviews-grid">
                <div class="col-span-full p-12 text-center text-slate-500 font-medium italic serif tracking-wide">Synthesizing node feedback streams...</div>
            </div>
        `;
        this.syncReviews();
    },

    syncHospitals() {
        if (!this.db) return;
        const q = query(collection(this.db, 'hospitals'), orderBy('createdAt', 'desc'));
        onSnapshot(q, (snap) => {
            const body = document.getElementById('hospitals-table-body');
            if (!body) return;
            body.innerHTML = snap.docs.map(doc => {
                const h = doc.data();
                const nodeColor = this.getNodeColor(h.name);
                return `
                    <tr class="hover:bg-slate-800/50 transition-colors group">
                        <td class="px-8 py-5">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl ${nodeColor} flex items-center justify-center text-white font-black text-xs shadow-lg shadow-black/20">
                                    ${h.name ? h.name.substring(0, 2).toUpperCase() : '??'}
                                </div>
                                <div>
                                    <div class="font-black text-white group-hover:text-primary transition-colors">${h.name}</div>
                                    <div class="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-black">${h.email}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-8 py-5">
                            <div class="text-sm text-slate-400 font-medium italic serif">${h.city}, ${h.state}</div>
                        </td>
                        <td class="px-8 py-5">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${this.getStatusStyles(h.status)} border shadow-sm">${h.status}</span>
                        </td>
                        <td class="px-8 py-5 text-right font-sans">
                            <span class="text-sm font-black text-white">${h.totalTrips || 0}</span>
                            <span class="text-[10px] text-slate-500 font-black uppercase ml-1 tracking-widest">Trips</span>
                        </td>
                    </tr>
                `;
            }).join('') || '<tr><td colspan="4" class="p-12 text-center text-slate-500 font-medium italic serif">No institutions registered in this node.</td></tr>';
            if (window.lucide) window.lucide.createIcons();
        }, (err) => {
            console.error('Hospitals sync error:', err);
            const body = document.getElementById('hospitals-table-body');
            if (body) body.innerHTML = `<tr><td colspan="4" class="p-12 text-center text-red-500 italic serif font-bold">Node Archive Retrieval Failed: ${err.message}</td></tr>`;
        });
    },

    syncCustomers() {
        if (!this.db) return;
        const q = query(collection(this.db, 'customers'), orderBy('createdAt', 'desc'), limit(12));
        onSnapshot(q, (snap) => {
            const grid = document.getElementById('customers-grid');
            if (!grid) return;
            grid.innerHTML = snap.docs.map(doc => {
                const c = doc.data();
                const nodeColor = this.getNodeColor(c.name);
                return `
                    <div class="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                        <div class="flex items-center gap-5 mb-6">
                             <div class="w-12 h-12 rounded-2xl ${nodeColor} text-white flex items-center justify-center font-black uppercase text-sm shadow-lg shadow-black/20">${c.name ? c.name.substring(0, 2) : '??'}</div>
                             <div class="min-w-0">
                                <div class="font-black text-white text-lg tracking-tight truncate">${c.name || 'Unknown Patient'}</div>
                                <div class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">${c.phone || 'No Contact'}</div>
                             </div>
                        </div>
                        <div class="space-y-2 pt-4 border-t border-slate-800/50">
                            <div class="text-xs text-slate-400 italic serif font-semibold flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3 h-3 text-primary"></i> ${c.location || 'Undisclosed Location'}</div>
                            <div class="text-xs text-slate-500 font-medium flex items-center gap-1.5"><i data-lucide="mail" class="w-3 h-3 text-slate-600"></i> ${c.email || ''}</div>
                        </div>
                    </div>
                `;
            }).join('') || '<div class="col-span-full p-12 text-center text-slate-500 font-medium italic serif tracking-wide">Archives currently empty.</div>';
            if (window.lucide) window.lucide.createIcons();
        }, (err) => {
            console.error('Customers sync error:', err);
            const grid = document.getElementById('customers-grid');
            if (grid) grid.innerHTML = `<div class="col-span-full p-12 text-center text-red-500 italic serif font-bold">Node Archive Retrieval Failed: ${err.message}</div>`;
        });
    },

    syncAllTrips() {
        if (!this.db) return;
        const q = query(collection(this.db, 'trips'), orderBy('createdAt', 'desc'));
        onSnapshot(q, (snap) => {
            const list = document.getElementById('trips-master-list');
            if (!list) return;
            
            let docs = snap.docs;
            if (this.activeTripFilter) {
                docs = docs.filter(doc => {
                    const t = doc.data();
                    return doc.id.toLowerCase().includes(this.activeTripFilter) || 
                           t.pickupLocation?.toLowerCase().includes(this.activeTripFilter) || 
                           t.dropLocation?.toLowerCase().includes(this.activeTripFilter);
                });
            }

            list.innerHTML = `
                <div class="divide-y divide-slate-800">
                    ${docs.map(doc => {
                        const t = doc.data();
                        return `
                            <div class="p-8 flex items-center justify-between hover:bg-slate-800/80 transition-all group">
                                <div class="flex items-center gap-6">
                                     <div class="p-4 rounded-2xl bg-slate-800 group-hover:bg-primary/20 transition-colors"><i data-lucide="navigation" class="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors"></i></div>
                                     <div>
                                        <div class="font-black text-white group-hover:text-primary transition-colors">Mission #${doc.id.substring(0, 8).toUpperCase()}</div>
                                        <div class="text-sm text-slate-500 font-medium italic serif mt-1">${t.pickupLocation} <span class="mx-1 text-slate-700 not-italic font-sans">→</span> ${t.dropLocation}</div>
                                     </div>
                                </div>
                                <div class="text-right">
                                    <span class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Vector Status</span>
                                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${this.getStatusStyles(t.status)} border shadow-sm">${t.status}</span>
                                </div>
                            </div>
                        `;
                    }).join('') || '<div class="p-12 text-center text-slate-600 font-black italic serif tracking-[0.1em] uppercase text-xs">No mission records match your query vectors.</div>'}
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }, (err) => {
            console.error('Trips sync error:', err);
            const list = document.getElementById('trips-master-list');
            if (list) list.innerHTML = `<div class="p-12 text-center text-red-500 italic serif font-bold">Mission Vector Retrieval Failed: ${err.message}</div>`;
        });
    },

    syncReviews() {
        if (!this.db) return;
        const q = query(collection(this.db, 'reviews'), orderBy('createdAt', 'desc'));
        onSnapshot(q, (snap) => {
            const grid = document.getElementById('reviews-grid');
            if (!grid) return;
            grid.innerHTML = snap.docs.map(doc => {
                const r = doc.data();
                const nodeColor = this.getNodeColor(r.hospitalName);
                return `
                    <div class="bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex gap-1">
                                ${[...Array(5)].map((_, i) => `<i data-lucide="star" class="w-4 h-4 ${i < r.rating ? 'text-primary fill-primary' : 'text-slate-800'}"></i>`).join('')}
                            </div>
                            <span class="text-[10px] font-black uppercase tracking-widest text-slate-600">${r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <p class="text-sm text-white italic serif font-semibold leading-relaxed">"${r.comment}"</p>
                        <div class="mt-8 pt-6 border-t border-slate-800/50 flex items-center gap-3">
                             <div class="w-8 h-8 rounded-lg ${nodeColor} flex items-center justify-center text-[10px] text-white font-black">${r.hospitalName ? r.hospitalName.substring(0, 1) : 'H'}</div>
                             <div>
                                <div class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Source Node</div>
                                <div class="text-xs font-black text-slate-300 uppercase tracking-widest">${r.hospitalName}</div>
                             </div>
                        </div>
                    </div>
                `;
            }).join('') || '<div class="col-span-full p-12 text-center text-slate-500 font-medium italic serif tracking-wide">Sentiment stream currently dry.</div>';
            if (window.lucide) window.lucide.createIcons();
        }, (err) => {
            console.error('Reviews sync error:', err);
            const grid = document.getElementById('reviews-grid');
            if (grid) grid.innerHTML = `<div class="col-span-full p-12 text-center text-red-500 italic serif font-bold">Sentiment Pulse Retrieval Failed: ${err.message}</div>`;
        });
    },

    statCard(title, value, change, icon, highlight=false, iconColor='text-slate-500') {
        return `
            <div class="p-8 bg-slate-900/80 rounded-3xl border border-slate-800 group hover:shadow-2xl hover:shadow-primary/10 transition-all ${highlight ? 'bg-primary/5 border-primary/20' : ''}">
                <div class="flex items-center justify-between mb-6">
                    <div class="p-3 rounded-2xl bg-slate-800 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <i data-lucide="${icon}" class="w-6 h-6 ${highlight ? 'text-amber-500 group-hover:text-white' : iconColor + ' group-hover:text-white'} transition-colors"></i>
                    </div>
                    <span class="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 shadow-sm">${change}</span>
                </div>
                <p class="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] serif italic mb-2">${title}</p>
                <p class="text-3xl font-black text-white tracking-tighter">${value}</p>
            </div>
        `;
    },

    healthBar(label, value, color) {
        return `
            <div class="space-y-3">
                <div class="flex justify-between text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                    <span>${label}</span>
                    <span class="font-sans text-xs text-slate-400 font-bold">${value}%</span>
                </div>
                <div class="h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800">
                    <div class="h-full rounded-full ${color} shadow-[0_0_12px_rgba(255,255,255,0.05)] transition-all duration-1000" style="width: ${value}%"></div>
                </div>
            </div>
        `;
    },

    syncLiveDashboard() {
        if (!this.db) return;
        const tr = query(collection(this.db, 'trips'), orderBy('createdAt', 'desc'), limit(5));
        onSnapshot(tr, (snap) => {
            const list = document.getElementById('live-trips-list');
            if (!list) return;
            list.innerHTML = snap.docs.map(doc => {
                const t = doc.data();
                const nodeColor = this.getNodeColor(t.hospitalId);
                return `
                    <div class="p-6 flex items-center gap-6 hover:bg-slate-800/80 transition-all group cursor-pointer border-l-4 border-transparent hover:border-primary">
                        <div class="w-12 h-12 rounded-2xl ${nodeColor} flex items-center justify-center group-hover:scale-105 transition-all shadow-lg shadow-black/20">
                            <i data-lucide="map-pin" class="w-5 h-5 text-white"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">Trip #${doc.id.substring(0, 6).toUpperCase()}</p>
                            <p class="text-xs text-slate-400 font-medium italic serif mt-0.5 truncate">Hosp: ${t.hospitalId} <span class="not-italic text-slate-700 mx-1">/</span> Dest: ${t.dropLocation}</p>
                        </div>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${this.getStatusStyles(t.status)} border shadow-sm">${t.status}</span>
                    </div>
                `;
            }).join('') || '<div class="p-10 text-center text-slate-600 italic serif font-medium">No active vectors in proximity detection.</div>';
            lucide.createIcons();
        }, (err) => {
            console.error('Live dashboard sync error:', err);
            const list = document.getElementById('live-trips-list');
            if (list) list.innerHTML = `<div class="p-10 text-center text-red-500 italic serif font-bold">Relay Connection Abandoned: ${err.message}</div>`;
        });
    }
};

window.app = globalApp;
globalApp.init();
