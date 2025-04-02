import cv2
import mediapipe as mp
import pyttsx3
import numpy as np



# Initialize Mediapipe for hand tracking
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.7)

# Initialize text-to-speech
engine = pyttsx3.init()

# Define a simple gesture dictionary (You can expand this)
gesture_dict = {
    "thumbs_up": "Hello!",
    "peace": "Thank you",
    "fist": "Yes",
}