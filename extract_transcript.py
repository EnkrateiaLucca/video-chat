import json
import argparse

def extract_transcript(input_file, output_file):
    # Read the input JSON file
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Extract just the transcription part
    transcript = data.get('transcription', [])
    
    # Write the transcript to the output file
    with open(output_file, 'w') as f:
        json.dump(transcript, f, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract transcript from JSON file')
    parser.add_argument('input_file', help='Input JSON file path')
    parser.add_argument('output_file', help='Output JSON file path')
    
    args = parser.parse_args()
    extract_transcript(args.input_file, args.output_file)