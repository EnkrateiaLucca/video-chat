# Video Chat

A pure HTML/JavaScript application that enables users to upload videos with their transcripts and interact with the content through an AI-powered interface. The application provides seamless video navigation and intelligent Q&A capabilities about the video content.

## Features

- Video upload support (MP4, WebM)
- Transcript upload in JSON format
- Interactive video player with standard controls
- Synchronized transcript display with real-time highlighting
- Click-to-navigate transcript segments
- Real-time transcript search functionality
- AI-powered Q&A system for video content
- Modern, responsive UI with a clean design
- Automatic scroll to current transcript segment

## How to Use

1. Open `index.html` in a modern web browser
2. Click "Select Video Folder" to upload your video and transcript files
3. Enter your OpenAI API key in the designated input field
4. Use the video controls to play/pause/seek through the video
5. Click on any transcript segment to jump to that part of the video
6. Use the search box to find specific text in the transcript
7. Ask questions about the video content using the AI Q&A interface

## Requirements

- OpenAI API key for AI Q&A functionality
- Modern web browser
- Video files in MP4 or WebM format
- Transcript files in the specified JSON format

## Transcript Format

The transcript file should be a JSON file with the following structure:

```json
{
  "transcription": [
    {
      "timestamps": {
        "from": "HH:MM:SS,mmm",
        "to": "HH:MM:SS,mmm"
      },
      "offsets": {
        "from": number,
        "to": number
      },
      "text": "transcript text"
    }
  ]
}
```

## Browser Compatibility

This application works in all modern browsers that support:
- HTML5 Video
- ES6 JavaScript
- CSS Grid and Flexbox
- FileReader API
- Web Storage API (for API key storage)

## Local Development

Since the application uses the FileReader API, you'll need to serve the files through a web server rather than opening the HTML file directly. You can use any local development server, for example:

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then visit `http://localhost:8000` in your browser.

## Security Note

The application stores the OpenAI API key in the browser's local storage. While this provides convenience, please be aware that API keys stored in local storage are accessible via JavaScript. For production environments, consider implementing proper backend authentication and API key management.

## UI Features

- Clean, modern interface with Inter font
- Responsive design that adapts to different screen sizes
- Interactive transcript segments with hover and active states
- Real-time search highlighting
- Loading and error status indicators
- Secure API key input field
- Timestamp references in AI responses for easy navigation 