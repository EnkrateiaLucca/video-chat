# Project Overview
A simple web application that allows users to upload videos with their transcripts and provides an interactive interface for navigating through video content using transcript timestamps.

# Core Functionalities
1. Video Upload
   - Accept video files (MP4, WebM)
   - Accept transcript files in JSON format matching the provided sample structure
   - Validate file formats and transcript structure

2. Interactive Video Player
   - Display video player with standard controls
   - Show synchronized transcript alongside video
   - Highlight current transcript segment based on video playback
   - Allow clicking transcript segments to jump to corresponding video timestamp

3. Transcript Navigation
   - Display transcript in scrollable panel
   - Show timestamps for each transcript segment
   - Enable search functionality within transcript
   - Allow clicking timestamps to navigate video
   - Interactivity that maps to the right part of the video

# Documentation
## File Format Requirements
- Video: MP4 or WebM format
- Transcript: JSON format with structure:
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

# Current File Structure