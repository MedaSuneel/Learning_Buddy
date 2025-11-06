import React, { useState, useRef, useEffect } from 'react';

export default function Podcast() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState('Friendly');
  const [length, setLength] = useState('Short (2-3 mins)');
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  const [voice, setVoice] = useState(null);
  const [voices, setVoices] = useState([]);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  const utteranceRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
      if (!voice && vs.length > 0) setVoice(vs[0]);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const generatePodcast = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setScript('');

    const prompt = `
            Generate a podcast-style spoken explanation on the topic: ${topic}.  
            Audience: ${level}.  
            Tone: ${tone}.  
            Length: ${length}.
            Language: ${language}.  
            Extra notes: ${extra}.  

            Important formatting rules:  
            - Write ONLY the spoken narration, as if it’s directly read by a host.  
            - Do NOT include stage directions, sound effects, or descriptions in parentheses.  
            - Do NOT use markdown formatting (no **bold**, no headers, no lists).  
            - The response must be plain text sentences only, natural for speech.  
            - Keep it engaging and conversational, like a podcast host talking to the audience.  
            `;

    const API_URL = import.meta.env.VITE_GEMINI_API_URL;
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    try {
      const resp = await fetch(`${API_URL}?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await resp.json();
      const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated.';
      setScript(generated);
    } catch (err) {
      console.error(err);
      setScript('⚠️ Failed to generate podcast.');
    } finally {
      setLoading(false);
    }
  };

  const playPodcast = () => {
  if (!script) return;

  stopPodcast(); // stop any existing speech

  const utterance = new SpeechSynthesisUtterance(script);

  // Detect/set language (basic manual approach)
  let lang = "en-US"; // default
  if (/[\u0900-\u097F]/.test(script)) lang = "hi-IN";   // Hindi (Devanagari)
  else if (/[\u3040-\u30FF]/.test(script)) lang = "ja-JP"; // Japanese (Kana)
  else if (/[éèçàùâêîôûëïü]/.test(script)) lang = "fr-FR"; // French accents
  else if (/[а-яё]/.test(script)) lang = "ru-RU";         // Russian (Cyrillic)
  else if (/[\u4E00-\u9FFF]/.test(script)) lang = "zh-CN"; // Chinese (Simplified)
  

  utterance.lang = lang;

  // Select voice that matches language
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.lang === lang);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.onend = () => setIsSpeaking(false);

  utteranceRef.current = utterance;
  window.speechSynthesis.speak(utterance);
  setIsSpeaking(true);
  setPaused(false);
};



  const pausePodcast = () => {
    if (window.speechSynthesis.speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const resumePodcast = () => {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  };

  const stopPodcast = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setPaused(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-gray-100 p-6 w-full h-full overflow-y-auto">
  {/* Header */}
  <h2 className="text-3xl font-extrabold mb-6 text-center tracking-tight">
    🎙️ AI Podcast Generator
  </h2>

  {/* Input Section */}
  <div className="space-y-4 bg-gray-900 p-5 rounded-2xl shadow-lg">
    <input
      className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
      placeholder="Enter podcast topic..."
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <select
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>

      <select
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800"
        value={tone}
        onChange={(e) => setTone(e.target.value)}
      >
        <option>Friendly</option>
        <option>Professional</option>
        <option>Humorous</option>
        <option>Storytelling</option>
      </select>

      <select
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800"
        value={length}
        onChange={(e) => setLength(e.target.value)}
      >
        <option>Short (2-3 mins)</option>
        <option>Medium (5-7 mins)</option>
        <option>Long (10+ mins)</option>
      </select>

      <select
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        >
        <option>English</option>
        <option>Hindi</option>
        <option>Spanish</option>
        <option>French</option>
        <option>German</option>
        <option>Italian</option>
        <option>Portuguese </option>
        <option>Russian</option>
        <option>Dutch</option>
        <option>Swedish</option>
        <option>Norwegian</option>
        <option>Danish</option>
        <option>Finnish</option>
        <option>Polish</option>
        <option>Turkish</option>
        <option>Chinese</option>
        <option>Japanese</option>
        </select>

      <textarea
        className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 md:col-span-2"
        placeholder="Extra notes (optional)..."
        value={extra}
        onChange={(e) => setExtra(e.target.value)}
      />
    </div>

    <button
      onClick={generatePodcast}
      disabled={loading}
      className="w-full py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-70 transition disabled:opacity-50 cursor-pointer"
    >
      {loading ? "⏳ Generating..." : "🎧 Generate Podcast"}
    </button>
  </div>

  {/* Script + Controls */}
  {script && (
    <div className="mt-6 p-5 rounded-2xl bg-gray-900 shadow-lg">
      <h3 className="font-bold text-xl mb-3">📝 Generated Script</h3>
      <p className="whitespace-pre-line leading-relaxed text-gray-300">
        {script}
      </p>

      {/* Playback Controls */}
      <div className="mt-4 flex flex-wrap gap-3">
        {!isSpeaking && (
          <button
            onClick={playPodcast}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
          >
            ▶ Play
          </button>
        )}
        {isSpeaking && !paused && (
          <button
            onClick={pausePodcast}
            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600"
          >
            ⏸ Pause
          </button>
        )}
        {paused && (
          <button
            onClick={resumePodcast}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
          >
            ⏯ Resume
          </button>
        )}
        {(isSpeaking || paused) && (
          <button
            onClick={stopPodcast}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Voice Settings */}
      <div className="mt-6">
        <label className="block mb-2 font-medium">🎤 Select Voice:</label>
        <select
          className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800"
          value={voice?.name || ""}
          onChange={(e) =>
            setVoice(voices.find((v) => v.name === e.target.value))
          }
        >
          {voices?.length > 0 ? (
            voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))
          ) : (
            <option>No voices available</option>
          )}
        </select>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-1">
            <label className="block mb-1">Rate: {rate}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Pitch: {pitch}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
