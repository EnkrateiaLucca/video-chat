// DOM Elements
const videoPlayer = document.getElementById('videoPlayer');
const transcriptContainer = document.getElementById('transcriptContainer');
const folderInput = document.getElementById('folderInput');
const searchInput = document.getElementById('searchInput');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiButton = document.getElementById('saveApiButton');
const responseContainer = document.getElementById('responseContainer');
const statusMessage = document.getElementById('statusMessage');
const toggleApiVisibility = document.getElementById('toggleApiVisibility');
const header = document.querySelector('.header');
const uploadContainer = document.querySelector('.upload-container');
const apiKeyPopup = document.getElementById('apiKeyPopup');
const apiToggle = document.getElementById('apiToggle');

// State
let transcriptData = null;
let transcriptFullText = '';
let apiKey = localStorage.getItem('openaiApiKey') || '';
let isProcessing = false;
let activeSegmentId = null;
let searchTimeout = null;
let lastPlayedTime = 0;
let autoHideTimeout = null;
let isApiPopupMinimized = true;

// Initialize
if (apiKey) {
    apiKeyInput.value = apiKey;
    askButton.disabled = !transcriptData;
}

// Event Listeners
folderInput.addEventListener('change', handleFolderUpload);
searchInput.addEventListener('input', handleTranscriptSearch);
saveApiButton.addEventListener('click', handleApiKeySave);
askButton.addEventListener('click', handleAskQuestion);

// File Upload Handler
async function handleFolderUpload(event) {
    const files = Array.from(event.target.files);
    const videoFile = files.find(file => file.name.match(/\.(mp4|webm)$/i));
    const transcriptFile = files.find(file => file.name.endsWith('.json'));

    if (!videoFile || !transcriptFile) {
        showStatus('Please select a folder containing both video and transcript files', 'error');
        return;
    }

    // Load video
    const videoUrl = URL.createObjectURL(videoFile);
    videoPlayer.src = videoUrl;

    // Load transcript
    try {
        const transcript = await readTranscriptFile(transcriptFile);
        transcriptData = transcript;
        renderTranscript(transcript);
        if (apiKey) askButton.disabled = false;
        showStatus('Files loaded successfully!', 'success');
    } catch (error) {
        showStatus('Error loading transcript: ' + error.message, 'error');
    }
}

// Transcript Functions
async function readTranscriptFile(file) {
    const text = await file.text();
    return JSON.parse(text);
}

function renderTranscript(transcript) {
    transcriptContainer.innerHTML = '';
    
    const segments = Array.isArray(transcript) ? transcript : 
                    transcript.transcription ? transcript.transcription : 
                    [transcript];

    segments.forEach((segment, index) => {
        const div = document.createElement('div');
        div.className = 'transcript-segment';
        div.dataset.segmentId = index;
        
        const { timestamp, text, time } = extractSegmentInfo(segment);
        
        div.innerHTML = `
            <span class="timestamp">${formatTimestamp(timestamp)}</span>
            <p>${formatText(text)}</p>
        `;

        div.addEventListener('click', () => {
            if (time !== undefined) {
                videoPlayer.currentTime = time;
                videoPlayer.play();
            }
            highlightSegment(div, index);
        });

        transcriptContainer.appendChild(div);
    });
}

// Helper functions for transcript formatting
function extractSegmentInfo(segment) {
    if (typeof segment === 'object') {
        const timestamp = segment.timestamp || 
                       (segment.timestamps ? `${segment.timestamps.from} - ${segment.timestamps.to}` : '') ||
                       segment.time || '';
                       
        const text = segment.text || segment.content || segment.transcript || '';
        const time = typeof timestamp === 'number' ? timestamp : 
                   segment.timestamp || 
                   (segment.timestamps ? parseTimestamp(segment.timestamps.from) : undefined);
        
        return { timestamp, text, time };
    }
    
    return { timestamp: '', text: segment, time: undefined };
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    if (typeof timestamp === 'number') {
        return formatTimeToString(timestamp);
    }
    return timestamp;
}

function formatTimeToString(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }
    return `${padZero(minutes)}:${padZero(secs)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function formatText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Enhanced timestamp parsing
function parseTimestamp(timestamp) {
    if (typeof timestamp === 'number') return timestamp;
    if (!timestamp || typeof timestamp !== 'string') return 0;

    try {
        if (timestamp.includes(':')) {
            const parts = timestamp.split(':');
            if (parts.length === 3) {
                const [hours, minutes, seconds] = parts;
    return (parseInt(hours) * 3600) +
           (parseInt(minutes) * 60) +
                       parseFloat(seconds.replace(',', '.'));
            } else if (parts.length === 2) {
                const [minutes, seconds] = parts;
                return (parseInt(minutes) * 60) + 
                       parseFloat(seconds.replace(',', '.'));
            }
        }
        return parseFloat(timestamp) || 0;
    } catch (e) {
        console.error('Error parsing timestamp:', e);
        return 0;
    }
}

// Improved segment highlighting
function highlightSegment(segment, index) {
    if (activeSegmentId === index) return;

    const allSegments = document.querySelectorAll('.transcript-segment');
    allSegments.forEach(s => s.classList.remove('active'));
    
    segment.classList.add('active');
    activeSegmentId = index;

    // Smooth scroll to segment
    const containerRect = transcriptContainer.getBoundingClientRect();
    const segmentRect = segment.getBoundingClientRect();
    
    if (segmentRect.top < containerRect.top || segmentRect.bottom > containerRect.bottom) {
        const scrollPosition = segment.offsetTop - (containerRect.height / 2) + (segmentRect.height / 2);
        transcriptContainer.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: 'smooth'
        });
    }
}

// Search Function
function handleTranscriptSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const segments = transcriptContainer.getElementsByClassName('transcript-segment');
    
    Array.from(segments).forEach(segment => {
        const text = segment.querySelector('p').textContent.toLowerCase();
        segment.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

// AI Q&A Functions
function handleApiKeySave() {
    const newApiKey = apiKeyInput.value.trim();
    if (newApiKey) {
        apiKey = newApiKey;
        localStorage.setItem('openaiApiKey', apiKey);
        askButton.disabled = !transcriptData;
        showStatus('API key saved successfully!', 'success');
    } else {
        showStatus('Please enter a valid API key', 'error');
    }
}

async function handleAskQuestion() {
    const question = questionInput.value.trim();
    if (!question) {
        showStatus('Please enter a question', 'error');
        return;
    }
    
    if (!apiKey) {
        showStatus('Please enter your OpenAI API key', 'error');
        return;
    }
    
    showStatus('Processing your question...', 'loading');
    responseContainer.style.display = 'none';
    
    try {
        const response = await fetchAIResponse(question);
        displayAIResponse(response);
        showStatus('', '');
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    }
}

async function fetchAIResponse(question) {
    // Ensure transcript data is in array format
    const segments = Array.isArray(transcriptData) ? transcriptData : 
                    transcriptData.transcription ? transcriptData.transcription : 
                    [transcriptData];

    const context = segments.map(segment => {
        const { timestamp, text } = extractSegmentInfo(segment);
        return `[${timestamp}] ${text}`;
    }).join(' ');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are an AI assistant that helps answer questions about video content based on its transcript. 
                    When answering, always include timestamp references from the transcript that support your answer.
                    Format timestamps exactly as they appear in the transcript.
                    Provide concise, accurate answers based only on the transcript content.`
                },
                {
                    role: 'user',
                    content: `Here is the transcript:\n\n${context}\n\nQuestion: ${question}`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function displayAIResponse(response) {
    // First, find and wrap all timestamp patterns with clickable spans
    const processedResponse = response.replace(
        /\[(\d{2}:\d{2}:\d{2}(?:,\d{3})?(?:\s*-\s*\d{2}:\d{2}:\d{2}(?:,\d{3})?)?)\]/g,
        (match, timestamp) => {
            // For timestamp ranges, use the start time as the clickable timestamp
            const startTime = timestamp.split('-')[0].trim();
            return `<span class="timestamp-reference" data-timestamp="${startTime}">${match}</span>`;
        }
    );
    
    responseContainer.innerHTML = processedResponse;
    responseContainer.style.display = 'block';
    
    // Add click handlers to timestamps
    responseContainer.querySelectorAll('.timestamp-reference').forEach(element => {
        element.addEventListener('click', () => {
            const timestamp = element.dataset.timestamp;
            // Parse the timestamp to seconds
            const seconds = parseTimestampWithMilliseconds(timestamp);
            if (!isNaN(seconds)) {
                // Set video time and play
                videoPlayer.currentTime = seconds;
                videoPlayer.play();
                
                // Find and highlight corresponding transcript segment
                highlightTranscriptSegmentAtTime(seconds);
            }
        });
    });
}

function parseTimestampWithMilliseconds(timestamp) {
    if (!timestamp) return 0;
    
    try {
        // Remove any whitespace
        timestamp = timestamp.trim();
        
        // Split into time and milliseconds
        const [timeStr, msStr] = timestamp.split(',');
        
        // Split time into hours, minutes, seconds
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        
        // Convert to total seconds
        let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        
        // Add milliseconds if present
        if (msStr) {
            totalSeconds += parseInt(msStr) / 1000;
        }
        
        return totalSeconds;
    } catch (error) {
        console.error('Error parsing timestamp:', error);
        return 0;
    }
}

function highlightTranscriptSegmentAtTime(timeInSeconds) {
    const segments = transcriptContainer.getElementsByClassName('transcript-segment');
    let foundSegment = false;
    
    Array.from(segments).forEach(segment => {
        const timestampEl = segment.querySelector('.timestamp');
        if (!timestampEl) return;
        
        const timeText = timestampEl.textContent;
        const [startStr, endStr] = timeText.split(' - ').map(t => t.trim());
        
        const startTime = parseTimestampWithMilliseconds(startStr);
        const endTime = endStr ? parseTimestampWithMilliseconds(endStr) : startTime + 10;
        
        if (timeInSeconds >= startTime && timeInSeconds <= endTime) {
            highlightSegment(segment);
            // Only scroll if not already visible
            const containerRect = transcriptContainer.getBoundingClientRect();
            const segmentRect = segment.getBoundingClientRect();
            
            if (segmentRect.top < containerRect.top || segmentRect.bottom > containerRect.bottom) {
                segment.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            foundSegment = true;
        }
    });
    
    return foundSegment;
}

// Status message handling
function showStatus(message, type = '') {
    if (!message) {
        statusMessage.style.display = 'none';
        return;
    }
    
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    if (type) statusMessage.classList.add(type);
    
    if (type === 'loading') {
        statusMessage.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="loading-spinner"></div>
                ${message}
            </div>
        `;
    }
    
    statusMessage.style.display = 'block';
}

// Initialize UI handlers
function initializeUIHandlers() {
    apiToggle.addEventListener('click', toggleApiPopup);
}

// Toggle API popup
function toggleApiPopup() {
    isApiPopupMinimized = !isApiPopupMinimized;
    apiKeyPopup.classList.toggle('minimized', isApiPopupMinimized);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeUIHandlers();
}); 