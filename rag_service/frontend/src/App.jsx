import React, { useState, useEffect } from 'react';

export default function App() {
  const [docs, setDocs] = useState([]);
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Local RAG Engine active (Ollama + Docling + FAISS). Upload a document or ask a question.' }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatModel, setChatModel] = useState('llama3.2:latest');
  const [embedModel, setEmbedModel] = useState('nomic-embed-text');
  const [selectedDocRecs, setSelectedDocRecs] = useState(null);
  const [ragAlert, setRagAlert] = useState(null);

  const fetchIndexStatus = async () => {
    try {
      const res = await fetch('/api/rag/index/status');
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents || []);
      }
    } catch (err) {
      console.error("Error fetching index status:", err);
    }
  };

  useEffect(() => {
    fetchIndexStatus();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/rag/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setRagAlert({ type: 'success', text: data.message });
        setSelectedFile(null);
        fetchIndexStatus();
      } else {
        setRagAlert({ type: 'danger', text: "Upload error: " + data.error });
      }
    } catch (err) {
      setRagAlert({ type: 'danger', text: "Failed to upload document: " + err.message });
    }
  };

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg = inputQuery;
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);

    try {
      const res = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, model_chat: chatModel })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botMsg = { sender: 'bot', text: '', citations: [] };

      setMessages(prev => [...prev, botMsg]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const json = JSON.parse(dataStr);
              botMsg.text += json.delta;
              if (json.citations) botMsg.citations = json.citations;
              setMessages(prev => [...prev.slice(0, -1), { ...botMsg }]);
            } catch (e) {
            }
          }
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Error connecting to SSE stream: " + err.message }]);
    }
  };

  const loadRecommendations = async (filename) => {
    try {
      const res = await fetch(`/api/rag/recommendations/${filename}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDocRecs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>SDME Local RAG Service (Docling + FAISS + Ollama)</h1>

      {ragAlert && (
        <div style={{ padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', fontWeight: 'bold', backgroundColor: ragAlert.type === 'success' ? '#dcfce7' : '#fee2e2', color: ragAlert.type === 'success' ? '#166534' : '#991b1b' }}>
          {ragAlert.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Document Ingestion & FAISS Indexing</h3>
            <form onSubmit={handleUpload}>
              <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ marginBottom: '10px' }} />
              <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Upload & Index</button>
            </form>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Indexed FAISS Vector Store ({docs.length} Documents)</h3>
            <ul>
              {docs.map(d => (
                <li key={d.id} style={{ marginBottom: '8px' }}>
                  <strong>{d.filename}</strong> ({d.size} bytes) - <span style={{ color: 'green' }}>{d.status}</span>
                  <br/>
                  <button onClick={() => loadRecommendations(d.filename)} style={{ fontSize: '11px', marginTop: '4px', cursor: 'pointer' }}>
                    View AI Recommendations
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>Model Settings</h3>
            <label>MODEL_CHAT:</label>
            <input type="text" value={chatModel} onChange={e => setChatModel(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
            <label>MODEL_EMBED:</label>
            <input type="text" value={embedModel} onChange={e => setEmbedModel(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          {selectedDocRecs && (
            <div style={{ border: '1px solid #007bff', backgroundColor: '#eef6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>AI Recommendations for: {selectedDocRecs.filename}</h3>
              {selectedDocRecs.recommendations.map((r, i) => (
                <p key={i}><strong>[{r.category}]</strong> {r.text}</p>
              ))}
            </div>
          )}

          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', height: '450px', display: 'flex', flexDirection: 'column' }}>
            <h3>Semantic Search & SSE Streaming Chat</h3>
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ marginBottom: '10px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                  <span style={{ fontWeight: 'bold', display: 'block', fontSize: '12px', color: '#666' }}>{m.sender.toUpperCase()}</span>
                  <div style={{ display: 'inline-block', backgroundColor: m.sender === 'user' ? '#007bff' : '#e9ecef', color: m.sender === 'user' ? '#fff' : '#000', padding: '8px 12px', borderRadius: '6px' }}>
                    {m.text}
                  </div>
                  {m.citations && m.citations.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                      Citations: {m.citations.map(c => c.document).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendQuery} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Ask standard compliance questions..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              />
              <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
