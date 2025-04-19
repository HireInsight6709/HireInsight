import whisper
from pydub import AudioSegment
import os
import torch
from datetime import datetime
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
from pyannote.audio import Audio
from pyannote.core import Segment
from sklearn.cluster import AgglomerativeClustering
import numpy as np
import wave
import contextlib
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def transcribe_audio_with_speaker_diarization(mp3_file_path):
    # Convert MP3 to WAV and ensure mono channel
    audio = AudioSegment.from_mp3(mp3_file_path)
    audio = audio.set_channels(1)
    wav_file_path = mp3_file_path.replace('.mp3', '.wav')
    audio.export(wav_file_path, format="wav")
    
    # Load Whisper model
    model = whisper.load_model("large")
    print("Transcribing audio...")
    result = model.transcribe(wav_file_path)
    segments = result["segments"]
    
    # Speaker embedding extraction
    embedding_model = PretrainedSpeakerEmbedding(
        "speechbrain/spkrec-ecapa-voxceleb", device=torch.device("cuda" if torch.cuda.is_available() else "cpu"))
    audio_tool = Audio()
    
    # Get the duration of the audio
    with contextlib.closing(wave.open(wav_file_path, 'r')) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)

    # Generate embeddings
    def segment_embedding(segment):
        start, end = segment["start"], min(duration, segment["end"])
        waveform, _ = audio_tool.crop(wav_file_path, Segment(start, end))
        return embedding_model(waveform[None])

    embeddings = np.zeros((len(segments), 192))
    for i, segment in enumerate(segments):
        embeddings[i] = segment_embedding(segment)
    
    # Perform speaker clustering
    embeddings = np.nan_to_num(embeddings)
    clustering = AgglomerativeClustering(n_clusters=2).fit(embeddings)
    labels = clustering.labels_
    
    # Assign speaker labels
    for i, segment in enumerate(segments):
        segment["speaker"] = f"SPEAKER {labels[i] + 1}"
    
    # Merge consecutive segments by the same speaker
    merged_segments = []
    current_speaker = segments[0]["speaker"]
    current_text = segments[0]["text"]
    start_time = segments[0]["start"]

    for i in range(1, len(segments)):
        if segments[i]["speaker"] == current_speaker:
            current_text += " " + segments[i]["text"]
        else:
            merged_segments.append({
                "speaker": current_speaker,
                "start": start_time,
                "end": segments[i-1]["end"],
                "text": current_text
            })
            current_speaker = segments[i]["speaker"]
            current_text = segments[i]["text"]
            start_time = segments[i]["start"]
    
    merged_segments.append({
        "speaker": current_speaker,
        "start": start_time,
        "end": segments[-1]["end"],
        "text": current_text
    })
    
    # Save transcription
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    transcript_file = f"transcript_with_speakers_{timestamp}.txt"
    with open(transcript_file, "w") as f:
        for segment in merged_segments:
            f.write(f"{segment['speaker']} [{segment['start']}s - {segment['end']}s]: {segment['text']}\n")
    
    print(f"Transcription complete! File saved as '{transcript_file}'.")
    os.remove(wav_file_path)
    return transcript_file

def analyze_transcription(file_path):
    """Perform text analysis using Gemini API"""
    with open(file_path, 'r', encoding='utf-8') as file:
        transcription_text = file.read()
    
    if len(transcription_text.split()) > 2:
        input_prompt = """
        Analyze the following interview transcript and provide a structured report. The report should include:

        Clarity of Responses (Score out of 10) (30-50 words): Evaluate how clear and well-structured the candidate's answers are.
        Relevance of Responses (Score out of 10) (30-50 words): Assess how directly the candidate's answers address the interviewer’s questions.
        Confidence (Score out of 10) (30-50 words): Measure the candidate's confidence based on tone and assertiveness.
        Technical Skills (Score out of 10) (30-50 words): Assess the candidate’s knowledge of relevant technologies, domain expertise, and problem-solving abilities.
        Communication Skills (Score out of 10) (30-50 words): Evaluate the candidate’s ability to express thoughts clearly, concisely, and effectively.
        Overall Performance (Score out of 10): Provide an overall evaluation of the candidate's responses.
        Strengths: Highlight key areas where the candidate performed well.
        Weaknesses: Identify areas where the candidate could improve.
        Summary (About 200 words): Provide a concise summary of the candidate’s overall interview performance, including key takeaways, notable strengths, and areas of improvement.


        Interview Transcription:
        {text}
        """.format(text=transcription_text)
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(input_prompt)
        print("\nAnalysis Results:\n")
        print(response.text)
    else:
        print("Transcription file is empty or too short.")

if __name__ == "__main__":
    mp3_file = "Audio6.mp3"
    transcript_file = transcribe_audio_with_speaker_diarization(mp3_file)
    analyze_transcription(transcript_file)
