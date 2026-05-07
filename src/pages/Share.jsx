import { useState, useEffect, useRef } from 'react';
import useAppStore from '../store';
import toast from 'react-hot-toast';
import { Peer } from 'peerjs';

export default function Share() {
  const links = useAppStore(state => state.links);
  const [outputFormat, setOutputFormat] = useState('README');

  // P2P State
  const [activeMode, setActiveMode] = useState(null); // 'RECEIVE' or 'SEND'
  const [targetIdValue, setTargetIdValue] = useState('');
  const [peerId, setPeerId] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('OFFLINE');
  
  const peerInstance = useRef(null);
  const connInstance = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
        if (peerInstance.current) peerInstance.current.destroy();
    }
  }, []);

  const setupConnection = (conn) => {
    conn.on('data', (data) => {
      if (data.type === 'file' && data.file && data.filename) {
        toast.success(`Receiving file: ${data.filename}`);
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
    
    if (peerInstance.current) peerInstance.current.destroy();
    
    try {
      const easyId = 'node-' + Math.random().toString(36).substr(2, 4);
      const peer = new Peer(easyId, {
        config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
      });
      
      peer.on('open', (id) => {
        setPeerId(id);
        setStatus('LISTENING');
        toast.success(`Ready to receive on ${id}`);
      });

      peer.on('connection', (conn) => {
        connInstance.current = conn;
        setConnected(true);
        setStatus('LINK ESTABLISHED');
        setupConnection(conn);
        toast.success(`Target connected!`);
      });

      peer.on('error', (err) => {
        toast.error('Network Error: ' + err.type);
        setStatus('OFFLINE');
        setActiveMode(null);
      });

      peerInstance.current = peer;
    } catch (e) {
      toast.error('Initialization Failed');
      setStatus('OFFLINE');
      setActiveMode(null);
    }
  };

  const initiateSend = () => {
    if (!targetIdValue) { toast.error("Receiver Node required"); return; }
    setActiveMode('SEND');
    setStatus('LOCATING NODE...');
    
    if (peerInstance.current) peerInstance.current.destroy();
    
    const tId = toast.loading('Connecting...');
    
    try {
       const peer = new Peer({
         config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
       });
       
       peer.on('open', () => {
          const conn = peer.connect(targetIdValue.toLowerCase().trim());
          
          conn.on('open', () => {
             connInstance.current = conn;
             setConnected(true);
             setStatus('LINK ESTABLISHED');
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
  };

  const handleExecute = () => {
    if (links.length === 0) {
        toast.error('No records to export');
        return;
    }
    
    if (outputFormat === 'CSV') {
        let csv = 'ID,Title,URL,Category,Date\n';
        links.forEach(l => {
          csv += `${l.id},"${l.title}","${l.url}",${l.category},${l.date}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rlinks_export.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${links.length} records to CSV`);
    } else if (outputFormat === 'README') {
        let md = '# RLinks Database Export\n\n';
        links.forEach(l => {
          md += `### ${l.title}\n- **URL**: [${l.url}](${l.url})\n- **Category**: ${l.category}\n- **Date**: ${new Date(l.date).toLocaleDateString()}\n\n`;
        });
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'README.md';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${links.length} records to README`);
    } else if (outputFormat === 'PDF') {
        toast.success('Initializing PDF print sequence');
        setTimeout(() => window.print(), 500);
    }
  };


  return (
    <>
      <div className="max-w-5xl mx-auto mt-8 w-full print:m-0 print:p-0">
        {/* Page Header Section */}
        <section className="mb-12 print:hidden">
          <div className="flex flex-col md:flex-row items-baseline gap-2 md:gap-4 mb-2">
            <span className="text-secondary font-bold text-xl hidden md:block">/root/protocols/</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-primary">TRANSFER_MODES</h2>
          </div>
          <p className="text-on-surface-variant max-w-2xl font-medium border-l-4 border-secondary pl-4 py-2 bg-surface-container-low text-sm md:text-base">
            Configure outbound synchronization pathways and initialize peer discovery protocols.
          </p>
        </section>

        {/* Print-only Header for PDF Generation */}
        <div className="hidden print:block mb-8 border-b-4 border-primary pb-4">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-primary">RLINKS DATABASE EXPORT</h1>
            <p className="text-sm font-mono text-primary/60">Total Verified Entries: {links.length} | Generate Date: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Bento-style Layout for Transfer Tools */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 print:hidden">
          {/* Export Section */}
          <div className="md:col-span-7 bg-surface-container-highest p-6 md:p-8 sticky-note tilt-left border-2 border-outline/20 relative">
            <div className="absolute top-0 right-0 p-2 text-[10px] font-bold text-outline uppercase tracking-widest hidden sm:block">MODE: ARCHIVE</div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">file_upload</span>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight uppercase">Export Workspace</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-surface p-4 border border-outline/10 font-mono text-xs md:text-sm space-y-2 text-on-surface-variant">
                <p>&gt; Scanning local directory...</p>
                <p>&gt; Found {links.length} verified entries.</p>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Select Format Output:</span>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <button onClick={() => setOutputFormat('README')} className={`py-3 font-bold tracking-widest uppercase text-xs md:text-sm border-2 transition-all ${outputFormat === 'README' ? 'bg-primary text-on-primary border-primary shadow-[4px_4px_0px_#00f99b]' : 'bg-surface text-primary border-primary/50 hover:bg-primary/10'}`}>README</button>
                  <button onClick={() => setOutputFormat('CSV')} className={`py-3 font-bold tracking-widest uppercase text-xs md:text-sm border-2 transition-all ${outputFormat === 'CSV' ? 'bg-primary text-on-primary border-primary shadow-[4px_4px_0px_#00f99b]' : 'bg-surface text-primary border-primary/50 hover:bg-primary/10'}`}>CSV</button>
                  <button onClick={() => setOutputFormat('PDF')} className={`py-3 font-bold tracking-widest uppercase text-xs md:text-sm border-2 transition-all ${outputFormat === 'PDF' ? 'bg-primary text-on-primary border-primary shadow-[4px_4px_0px_#00f99b]' : 'bg-surface text-primary border-primary/50 hover:bg-primary/10'}`}>PDF</button>
                </div>
              </div>
              <div className="pt-2">
                <button onClick={handleExecute} className="w-full bg-secondary text-on-secondary py-4 font-bold tracking-widest uppercase text-sm md:text-lg pixel-border active:translate-y-1 transition-all flex items-center justify-center gap-3">
                  EXECUTE_DOWNLOAD
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Network & P2P Section */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-low border-2 border-outline/20 p-6 sticky-note tilt-right w-full">
              <div className="flex items-center gap-2 mb-4">
                <span className={`material-symbols-outlined ${connected ? 'text-secondary' : 'text-tertiary'} ${connected ? 'animate-pulse' : ''}`}>lan</span>
                <h4 className="text-lg font-bold uppercase tracking-tight">{connected ? 'P2P Link Active' : 'Zero-Lag WebRTC Transfer'}</h4>
              </div>
              
              <div className="bg-surface p-3 mb-4 font-mono text-xs text-on-surface-variant flex flex-col gap-1 border border-outline/10">
                <span className="text-primary/60 uppercase">NETWORK_STATUS:</span>
                <span className={connected ? 'text-[#00f99b] font-bold' : 'text-secondary font-bold'}>{status}</span>
              </div>
              
              {!activeMode && !connected && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={startReceiving} className="bg-surface-container border-2 border-outline/20 hover:border-secondary p-6 text-center transition-all group flex flex-col items-center gap-3">
                     <span className="material-symbols-outlined text-4xl text-primary group-hover:text-secondary mb-2">call_received</span>
                     <span className="font-black tracking-widest uppercase text-sm block">RECEIVE FILE</span>
                     <span className="text-[9px] text-primary/50 font-bold uppercase tracking-widest hidden sm:block">Become host node</span>
                  </button>
                  <button onClick={() => setActiveMode('PRE_SEND')} className="bg-surface-container border-2 border-outline/20 hover:border-secondary p-6 text-center transition-all group flex flex-col items-center gap-3">
                     <span className="material-symbols-outlined text-4xl text-primary group-hover:text-secondary mb-2">send</span>
                     <span className="font-black tracking-widest uppercase text-sm block">SEND FILE</span>
                     <span className="text-[9px] text-primary/50 font-bold uppercase tracking-widest hidden sm:block">Connect to target</span>
                  </button>
                </div>
              )}

              {activeMode === 'RECEIVE' && !connected && (
                <div className="space-y-4">
                  <div className="bg-surface-container border border-outline/20 p-6 text-center">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">TELL THE SENDER TO ENTER THIS ID:</p>
                    <div className="text-3xl sm:text-5xl font-black text-secondary tracking-tighter mb-4">{peerId || '...'}</div>
                    <p className="text-[10px] font-bold text-[#00f99b] uppercase tracking-widest mt-2 flex justify-center items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00f99b] animate-ping"></span> WAITING FOR SENDER NODE...</p>
                  </div>
                  <button onClick={closeConnection} className="w-full bg-surface-container text-primary py-3 font-bold uppercase tracking-widest text-xs border border-outline/20 hover:bg-surface transition-all">Cancel</button>
                </div>
              )}

              {activeMode === 'PRE_SEND' && !connected && (
                <div className="space-y-4">
                  <div className="bg-surface-container border border-outline/20 p-4 relative group">
                    <div className="absolute -top-2 left-3 bg-surface-container-low px-1.5 text-[9px] font-black tracking-widest uppercase text-secondary">TARGET DIRECTORY</div>
                    <label className="text-[10px] font-bold text-outline my-2 uppercase tracking-widest block">ENTER THE RECEIVER'S NODE ID:</label>
                    <div className="flex border border-outline/20 focus-within:border-secondary transition-colors">
                      <span className="bg-primary/5 px-3 py-2 flex items-center justify-center border-r border-outline/20 text-primary/40 material-symbols-outlined text-sm">radar</span>
                      <input type="text" value={targetIdValue} onChange={e => setTargetIdValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="e.g. node-x7yz" className="w-full bg-transparent p-3 sm:p-4 text-primary font-bold tracking-widest text-sm sm:text-lg outline-none font-mono" />
                    </div>
                  </div>

                  <button onClick={initiateSend} disabled={!targetIdValue} className="w-full mt-2 bg-primary text-on-primary py-4 font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-surface-variant hover:text-primary border-2 border-primary transition-all shadow-[6px_6px_0px_#5f5e5e] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    CONNECT & SEND
                  </button>
                  <button onClick={closeConnection} className="w-full text-primary py-3 font-bold uppercase tracking-widest text-xs hover:underline transition-all">Cancel</button>
                </div>
              )}

              {connected && (
                <div className="mt-4 border-t border-outline/10 pt-6 flex flex-col gap-3">
                  <div className="p-8 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center gap-4 bg-primary/5 transition-all hover:bg-primary/10 relative overflow-hidden group">
                     {/* decorative scanline */}
                     <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,249,155,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                     
                     <input type="file" ref={fileInputRef} onChange={sendFile} className="hidden" />
                     <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl text-secondary">electric_bolt</span>
                     </div>
                     <div className="relative z-10">
                       <span className="text-sm font-bold uppercase tracking-widest block text-primary">E2E Secure Transfer</span>
                       <span className="text-[10px] font-medium uppercase tracking-widest opacity-60">P2P Encrypted • Node: {connInstance.current?.peer}</span>
                     </div>
                     <button onClick={() => fileInputRef.current.click()} className="mt-2 bg-secondary text-on-secondary px-8 py-4 uppercase font-black tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] border-2 border-primary hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all w-full relative z-10 hidden sm:block">
                       SELECT PAYLOAD TO TRANSMIT
                     </button>
                     {/* mobile fallback button text */}
                     <button onClick={() => fileInputRef.current.click()} className="mt-2 bg-secondary text-on-secondary px-8 py-4 uppercase font-black tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] border-2 border-primary hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all w-full relative z-10 block sm:hidden">
                       SEND FILE
                     </button>
                  </div>
                  <button onClick={closeConnection} className="text-[10px] font-bold text-error uppercase tracking-widest mt-3 hover:underline">SEVER CONNECTION</button>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Print Only Data View for PDF generation */}
        <div className="hidden print:block w-full">
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="border-b-2 border-primary/20 bg-surface-container-low">
                        <th className="py-2 px-4 uppercase text-xs">Title</th>
                        <th className="py-2 px-4 uppercase text-xs">URL</th>
                        <th className="py-2 px-4 uppercase text-xs">Category</th>
                        <th className="py-2 px-4 uppercase text-xs">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {links.map((link) => (
                        <tr key={link.id} className="border-b border-primary/10">
                            <td className="py-2 px-4 font-bold">{link.title || 'Unknown Entry'}</td>
                            <td className="py-2 px-4 font-mono text-[10px]">{link.url}</td>
                            <td className="py-2 px-4">{link.category}</td>
                            <td className="py-2 px-4 text-xs">{new Date(link.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </>
  );
}
