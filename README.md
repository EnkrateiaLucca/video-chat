# Video Transcript Navigator

A pure HTML/JavaScript application that allows users to upload videos with their transcripts and provides an interactive interface for navigating through video content using transcript timestamps.

## Features

- Video upload support (MP4, WebM)
- Transcript upload in JSON format
- Interactive video player with standard controls
- Synchronized transcript display
- Click-to-navigate transcript segments
- Real-time transcript highlighting during playback
- Search functionality within transcript
- Automatic scroll to current transcript segment

## How to Use

1. Open `index.html` in a modern web browser
2. Upload your video file (MP4 or WebM format)
3. Upload your transcript file (JSON format)
4. Use the video controls to play/pause/seek through the video
5. Click on any transcript segment to jump to that part of the video
6. Use the search box to find specific text in the transcript

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
- CSS Grid
- FileReader API

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