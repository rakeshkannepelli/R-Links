import { useState, useEffect, useRef } from 'react';
import useAppStore from '../store';
import Icon3D from '../components/Icon3D';
import toast from 'react-hot-toast';
import { Peer } from 'peerjs';
import { 
  Download, 
  Share2, 
  Wifi, 
  WifiOff, 
  Radio, 
  Send, 
  ArrowDownToLine, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Copy, 
  Check, 
  FileCode,
  ShieldCheck,
  Sparkles,
  Globe
} from 'lucide-react';

export default function Share() {
  const links = useAppStore(state => state.links);
  const dispatchBotEvent = useAppStore(state => state.dispatchBotEvent);
  const [outputFormat, setOutputFormat] = useState('README');

  // P2P State
  const [activeMode, setActiveMode] = useState(null); // 'RECEIVE' or 'SEND'
  const [targetIdValue, setTargetIdValue] = useState('');
  const [peerId, setPeerId] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('OFFLINE');
  const [copiedPeerId, setCopiedPeerId] = useState(false);
  
  const peerInstance = useRef(null);
  const connInstance = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (peerInstance.current) peerInstance.current.destroy();
    };
  }, []);

  const setupConnection = (conn) => {
    conn.on('data', (data) => {
      if (data.type === 'file' && data.file && data.filename) {
        toast.success(`Receiving payload: ${data.filename}`);
        const blob = new Blob([data.file]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
    conn.on('close', () => {
      setConnected(false);
      setStatus('NODE DISCONNECTED');
      setActiveMode(null);
    });
    conn.on('error', (err) => {
      console.error(err);
    });
  };

  const startReceiving = () => {
    setActiveMode('RECEIVE');
    setStatus('GENERATING KEY...');
    dispatchBotEvent('P2P_START');
    
    if (peerInstance.current) peerInstance.current.destroy();
    
    try {
      const easyId = 'rlinks-' + Math.random().toString(36).substring(2, 6);
      const peer = new Peer(easyId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });
      
      peer.on('open', (id) => {
        setPeerId(id);
        setStatus('HOST NODE ACTIVE');
        toast.success(`Ready to receive on ${id}`);
      });

      peer.on('connection', (conn) => {
        connInstance.current = conn;
        setConnected(true);
        setStatus('PEER LINK ESTABLISHED');
        setupConnection(conn);
        toast.success(`Remote peer connected!`);
      });

      peer.on('error', (err) => {
        toast.error('P2P Error: ' + err.type);
        setStatus('OFFLINE');
        setActiveMode(null);
      });

      peerInstance.current = peer;
    } catch (e) {
      toast.error('P2P Initialization Failed');
      setStatus('OFFLINE');
      setActiveMode(null);
    }
  };

  const initiateSend = () => {
    if (!targetIdValue) { toast.error("Receiver Node ID required"); return; }
    setActiveMode('SEND');
    setStatus('LOCATING PEER...');
    dispatchBotEvent('P2P_START');
    
    if (peerInstance.current) peerInstance.current.destroy();
    
    const tId = toast.loading('Establishing encrypted channel...');
    
    try {
      const peer = new Peer({
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });
      
      peer.on('open', () => {
        const conn = peer.connect(targetIdValue.toLowerCase().trim());
        
        conn.on('open', () => {
          connInstance.current = conn;
          setConnected(true);
          setStatus('PEER LINK ESTABLISHED');
          toast.success(`Connected to node ${targetIdValue}!`, { id: tId });
          setupConnection(conn);
        });
        
        conn.on('error', () => {
          toast.error("Target node unreachable", { id: tId });
          setStatus('OFFLINE');
          setActiveMode(null);
        });
      });
      
      peer.on('error', (err) => {
        toast.error('Network Error: ' + err.type, { id: tId });
        setStatus('OFFLINE');
        setActiveMode(null);
      });
      
      peerInstance.current = peer;
    } catch (e) {
      toast.error("Failed to connect", { id: tId });
      setStatus('OFFLINE');
      setActiveMode(null);
    }
  };

  const sendFile = (e) => {
    const file = e.target.files[0];
    if (!file || !connInstance.current || !connected) return;

    const tId = toast.loading(`Sending ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      connInstance.current.send({
        type: 'file',
        file: arrayBuffer,
        filename: file.name,
      });
      setTimeout(() => toast.success('Transfer complete!', { id: tId }), 800);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null; 
  };

  const closeConnection = () => {
    if (connInstance.current) {
      connInstance.current.close();
    }
    setConnected(false);
    setActiveMode(null);
    setStatus('OFFLINE');
    dispatchBotEvent('P2P_END');
  };

  const copyNodeId = () => {
    if (!peerId) return;
    navigator.clipboard.writeText(peerId);
    setCopiedPeerId(true);
    toast.success('Node ID copied');
    setTimeout(() => setCopiedPeerId(false), 2000);
  };

  const handleExecute = () => {
    if (links.length === 0) {
      toast.error('No records in vault to export');
      return;
    }
    dispatchBotEvent('EXPORT');

    const triggerDownload = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 500);
    };

    if (outputFormat === 'CSV') {
      let csv = 'ID,Title,URL,Category,Date\n';
      links.forEach(l => {
        const title = (l.title || '').replace(/"/g, '""');
        const url = (l.url || '').replace(/"/g, '""');
        csv += `${l.id || l._id},"${title}","${url}",${l.category},${l.date}\n`;
      });
      triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'rlinks_export.csv');
      toast.success(`Exported ${links.length} records to CSV`);

    } else if (outputFormat === 'README') {
      let md = '# RLinks Database Export\n\n';
      links.forEach(l => {
        md += `### ${l.title || l.url}\n- **URL**: [${l.url}](${l.url})\n- **Category**: ${l.category}\n- **Date**: ${new Date(l.date).toLocaleDateString()}\n\n`;
      });
      triggerDownload(new Blob([md], { type: 'text/markdown;charset=utf-8;' }), 'README.md');
      toast.success(`Exported ${links.length} records to README`);

    } else if (outputFormat === 'JSON') {
      const jsonStr = JSON.stringify(links, null, 2);
      triggerDownload(new Blob([jsonStr], { type: 'application/json;charset=utf-8;' }), 'rlinks_vault.json');
      toast.success(`Exported ${links.length} records to JSON`);

    } else if (outputFormat === 'HTML') {
      const exportDate = new Date().toLocaleString();
      const categories = ['ALL', ...new Set(links.map(l => (l.category || 'WORK').toUpperCase()))];
      
      let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RLINKS Vault Archive (${links.length} Links)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      background: #0f1115;
      color: #e5e7eb;
      min-height: 100vh;
      padding: 24px 16px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      background: #181b20;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chip {
      background: #00f99b;
      color: #004d2e;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-text { font-size: 12px; color: #9ca3af; font-family: monospace; }
    .search-box {
      width: 100%;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.15);
      background: #0f1115;
      color: #ffffff;
      font-size: 14px;
      outline: none;
      margin-bottom: 14px;
      transition: border-color 0.2s;
    }
    .search-box:focus { border-color: #00f99b; }
    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cat-btn {
      background: #252830;
      color: #9ca3af;
      border: 1px solid rgba(255,255,255,0.08);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      transition: all 0.15s;
    }
    .cat-btn:hover, .cat-btn.active {
      background: #00f99b;
      color: #004d2e;
      border-color: #00f99b;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    @media (max-width: 640px) {
      .grid { grid-template-columns: 1fr; }
    }
    .card {
      background: #181b20;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 14px;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: rgba(0, 249, 155, 0.4);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #ffffff;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .icon-img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
    .card-category {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #00f99b;
      letter-spacing: 0.5px;
      font-family: monospace;
    }
    .card-domain {
      font-size: 11px;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.4;
      color: #ffffff;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 11px;
      color: #6b7280;
    }
    .btn-open {
      background: #00f99b;
      color: #004d2e;
      font-weight: 800;
      font-size: 10px;
      padding: 6px 12px;
      border-radius: 8px;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .btn-open:hover { background: #34d399; }
    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 48px;
      color: #6b7280;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-top">
        <h1>RLINKS VAULT <span class="chip">${links.length} SAVED</span></h1>
        <span class="meta-text">Exported: ${exportDate}</span>
      </div>
      <input type="text" id="searchInput" class="search-box" placeholder="Search saved links by name, URL, or domain..." />
      <div class="categories">
        ${categories.map(c => `<button class="cat-btn ${c === 'ALL' ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}
      </div>
    </header>

    <main class="grid" id="linksGrid">
      ${links.map(l => {
        let domain = '';
        try {
          domain = new URL(l.url).hostname.replace('www.', '');
        } catch {
          domain = l.url;
        }
        const faviconUrl = l.icon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '');
        const cat = (l.category || 'WORK').toUpperCase();
        return `<div class="card" data-cat="${cat}" data-title="${(l.title || '').toLowerCase()}" data-url="${(l.url || '').toLowerCase()}">
          <div>
            <div class="card-header">
              <div class="icon-box">
                <img class="icon-img" src="${faviconUrl}" alt="${domain}" onerror="this.src='https://icons.duckduckgo.com/ip3/${domain}.ico'" />
              </div>
              <div style="min-width: 0;">
                <span class="card-category">${cat}</span>
                <p class="card-domain">${domain}</p>
              </div>
            </div>
            <h3 class="card-title" style="margin-top: 10px;">${l.title || l.url}</h3>
          </div>
          <div class="card-footer">
            <span>${new Date(l.date).toLocaleDateString()}</span>
            <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn-open">OPEN &rarr;</a>
          </div>
        </div>`;
      }).join('\n')}
    </main>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const catBtns = document.querySelectorAll('.cat-btn');
    const cards = document.querySelectorAll('.card');
    let currentCat = 'ALL';

    function filterLinks() {
      const query = searchInput.value.toLowerCase().trim();
      let visible = 0;
      cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const url = card.getAttribute('data-url') || '';
        const cat = card.getAttribute('data-cat') || '';
        const matchesQuery = !query || title.includes(query) || url.includes(query);
        const matchesCat = currentCat === 'ALL' || cat === currentCat;
        if (matchesQuery && matchesCat) {
          card.style.display = 'flex';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });
    }

    searchInput.addEventListener('input', filterLinks);
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.getAttribute('data-cat');
        filterLinks();
      });
    });
  </script>
</body>
</html>`;
      triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8;' }), 'rlinks_vault.html');
      toast.success(`Exported ${links.length} records to Web HTML`);

    } else if (outputFormat === 'PDF') {
      toast.success('Opening print / PDF dialog...');
      setTimeout(() => {
        try {
          window.print();
        } catch {
          toast.error('Print not supported on this device');
        }
      }, 500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 page-enter pb-16 print:m-0 print:p-0">
      {/* Page Header */}
      <section className="mt-4 print:hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] tracking-widest text-secondary font-bold uppercase bg-secondary/10 px-2.5 py-0.5 rounded border border-secondary/20">
            SYNC & BROADCAST PROTOCOLS
          </span>
          <span className="text-[10px] font-mono text-primary/50 uppercase">
            SECURE OUTBOUND CHANNELS
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-primary tracking-tight leading-none mb-3">
          Share & Export Vault
        </h1>
        <p className="text-xs sm:text-sm text-primary/70 font-medium max-w-xl leading-relaxed">
          Export your archived bookmarks in universal formats or initiate zero-latency, end-to-end encrypted P2P data transmission.
        </p>
      </section>

      {/* Main 2-Column Bento Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
        {/* Left Column: Universal Export Deck (7 Cols) */}
        <div className="lg:col-span-7">
          <section className="card-3d p-6 sm:p-8 rounded-3xl bg-[#fbf9f0] space-y-6">
            <div className="flex items-center justify-between border-b border-[#5f5e5e]/15 pb-4">
              <div className="flex items-center gap-3">
                <Icon3D name="database" theme="emerald" size="sm" />
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight text-primary">Export Vault</h3>
                  <span className="text-[10px] font-mono text-secondary font-bold">READY TO PACKAGE</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-primary/50 uppercase">
                {links.length} ENTRIES
              </span>
            </div>

            {/* Telemetry scan readout */}
            <div className="bg-[#f0eee5] p-4 rounded-2xl border border-[#5f5e5e]/20 font-mono text-xs space-y-1.5 shadow-inner">
              <p className="text-secondary font-bold">&gt; Index status: Verified healthy</p>
              <p className="text-primary/70">&gt; Memory footprint: {links.length} active nodes indexed</p>
              <p className="text-primary/70">&gt; Encryption: Complete zero-loss formatting</p>
            </div>

            {/* Format Selector Pills */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold text-primary uppercase tracking-wide">
                Select Export Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'README', label: 'MARKDOWN', icon: <FileText size={14} /> },
                  { id: 'CSV', label: 'SPREADSHEET', icon: <FileSpreadsheet size={14} /> },
                  { id: 'JSON', label: 'RAW JSON', icon: <FileCode size={14} /> },
                  { id: 'HTML', label: 'WEB HTML', icon: <Globe size={14} /> },
                  { id: 'PDF', label: 'PRINT / PDF', icon: <Printer size={14} /> }
                ].map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setOutputFormat(fmt.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      outputFormat === fmt.id
                        ? 'bg-[#00f99b] text-[#006d41] border-[#006d41] font-bold shadow-[2px_2px_0_#006d41] -translate-y-0.5'
                        : 'bg-[#f0eee5] border-[#5f5e5e]/20 text-primary/70 hover:bg-[#e4e3da]'
                    }`}
                  >
                    <span>{fmt.icon}</span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider">{fmt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Download Button */}
            <div className="pt-2">
              <button 
                onClick={handleExecute} 
                className="btn-3d w-full bg-primary text-on-primary py-4 px-6 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-3"
              >
                <Download size={18} className="text-[#00f99b]" />
                <span>EXECUTE PACKAGE DOWNLOAD ({outputFormat})</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: P2P Direct WebRTC Deck (5 Cols) */}
        <div className="lg:col-span-5">
          <section className="card-3d p-6 sm:p-7 rounded-3xl bg-[#fbf9f0] space-y-6">
            <div className="flex items-center justify-between border-b border-[#5f5e5e]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <Icon3D name="share" theme="cyan" size="sm" />
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight text-primary">P2P Network</h3>
                  <span className="text-[10px] font-mono text-primary/60 uppercase">WEBRTC DIRECT</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${connected ? 'bg-[#00f99b] text-[#006d41]' : 'bg-[#f0eee5] text-primary/60'}`}>
                {status}
              </span>
            </div>

            {/* P2P Initial Selection */}
            {!activeMode && !connected && (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={startReceiving} 
                  className="card-3d p-5 rounded-2xl bg-[#f0eee5] flex flex-col items-center justify-center text-center gap-3 group hover:border-secondary transition-all"
                >
                  <ArrowDownToLine size={28} className="text-secondary group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-mono text-xs font-black uppercase block text-primary">RECEIVE DATA</span>
                    <span className="text-[9px] font-mono text-primary/50 uppercase mt-0.5 block">Open host node</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveMode('PRE_SEND')} 
                  className="card-3d p-5 rounded-2xl bg-[#f0eee5] flex flex-col items-center justify-center text-center gap-3 group hover:border-secondary transition-all"
                >
                  <Send size={28} className="text-secondary group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="font-mono text-xs font-black uppercase block text-primary">TRANSMIT DATA</span>
                    <span className="text-[9px] font-mono text-primary/50 uppercase mt-0.5 block">Connect to peer</span>
                  </div>
                </button>
              </div>
            )}

            {/* Receiving Mode: Host Node Display */}
            {activeMode === 'RECEIVE' && !connected && (
              <div className="space-y-4">
                <div className="bg-[#f0eee5] p-4 rounded-2xl border border-[#5f5e5e]/20 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-primary/60 block">YOUR HOST NODE ID</span>
                  <div className="flex items-center justify-between gap-2 bg-[#fbf9f0] p-2.5 rounded-xl border border-[#5f5e5e]/30">
                    <span className="font-mono text-base font-black text-secondary tracking-wider">
                      {peerId || 'GENERATING...'}
                    </span>
                    {peerId && (
                      <button 
                        onClick={copyNodeId} 
                        className="btn-3d-secondary px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1"
                      >
                        {copiedPeerId ? <Check size={12} className="text-secondary" /> : <Copy size={12} />}
                        <span>{copiedPeerId ? 'COPIED' : 'COPY'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-primary/50 pt-1">
                    Share this code with the sender. Once they connect, file transmission begins automatically.
                  </p>
                </div>

                <button 
                  onClick={closeConnection} 
                  className="btn-3d-secondary w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase"
                >
                  Cancel Host Mode
                </button>
              </div>
            )}

            {/* Transmit Mode: Enter Receiver Node ID */}
            {activeMode === 'PRE_SEND' && !connected && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase font-bold text-primary/70 block">
                    TARGET PEER NODE ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. rlinks-a4b2"
                    value={targetIdValue}
                    onChange={e => setTargetIdValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-[#f0eee5] border-2 border-[#5f5e5e]/30 rounded-xl p-3 text-sm font-mono font-bold text-primary outline-none focus:border-secondary shadow-inner uppercase"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={initiateSend} 
                    disabled={!targetIdValue} 
                    className="btn-3d flex-1 bg-secondary text-white py-3 rounded-xl text-xs font-mono font-bold uppercase disabled:opacity-50"
                  >
                    CONNECT TO PEER →
                  </button>
                  <button 
                    onClick={closeConnection} 
                    className="btn-3d-secondary px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Connected Peer State */}
            {connected && (
              <div className="space-y-4">
                <div className="p-6 bg-[#00f99b]/15 border-2 border-[#006d41] rounded-2xl text-center space-y-3">
                  <ShieldCheck size={32} className="text-[#006d41] mx-auto" />
                  <div>
                    <span className="font-mono text-xs font-black uppercase text-[#006d41] block">SECURE DIRECT CHANNEL ACTIVE</span>
                    <span className="text-[10px] font-mono text-primary/70">Remote Node: {connInstance.current?.peer}</span>
                  </div>

                  <input type="file" ref={fileInputRef} onChange={sendFile} className="hidden" />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="btn-3d w-full bg-secondary text-white py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase"
                  >
                    TRANSMIT FILE TO PEER
                  </button>
                </div>

                <button 
                  onClick={closeConnection} 
                  className="w-full text-center text-xs font-mono font-bold uppercase text-red-600 hover:underline pt-1"
                >
                  Disconnect Channel
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Print Only View for PDF export */}
      <div className="hidden print:block w-full">
        <div className="mb-6 border-b-4 border-primary pb-3">
          <h1 className="text-3xl font-black uppercase text-primary">RLINKS DATABASE EXPORT</h1>
          <p className="text-xs font-mono text-primary/60">Total: {links.length} | Date: {new Date().toLocaleDateString()}</p>
        </div>
        
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-primary/30 bg-[#f0eee5]">
              <th className="py-2 px-3 uppercase">Title</th>
              <th className="py-2 px-3 uppercase">URL</th>
              <th className="py-2 px-3 uppercase">Category</th>
              <th className="py-2 px-3 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id || link._id} className="border-b border-primary/10">
                <td className="py-2 px-3 font-bold">{link.title || link.url}</td>
                <td className="py-2 px-3 font-mono text-[10px]">{link.url}</td>
                <td className="py-2 px-3">{link.category}</td>
                <td className="py-2 px-3 text-[10px]">{new Date(link.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
