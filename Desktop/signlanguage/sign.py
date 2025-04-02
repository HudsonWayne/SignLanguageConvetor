import cv2
import mediapipe as mp
import pyttsx3

# Initialize Mediapipe Hand Tracking
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.7)

# Initialize Text-to-Speech
engine = pyttsx3.init()

# Define Gesture Dictionary (30+ Gestures)
gesture_dict = {
    "thumbs_up": "Hello!",
    "thumbs_down": "No",
    "peace": "Thank you",
    "fist": "Yes",
    "open_palm": "Stop",
    "victory": "Victory",
    "ok_sign": "Okay",
    "one_finger": "One",
    "two_fingers": "Two",
    "three_fingers": "Three",
    "four_fingers": "Four",
    "five_fingers": "Five",
    "call_me": "Call me",
    "high_five": "High Five",
    "wave": "Goodbye",
    "rock_on": "Rock on",
    "praying_hands": "Please",
    "heart_sign": "Love",
    "clap": "Applause",
    "point_up": "Up",
    "point_down": "Down",
    "point_left": "Left",
    "point_right": "Right",
    "folded_arms": "Thinking",
    "writing_gesture": "Write",
    "reading_gesture": "Read",
    "rub_hands": "Cold",
    "snap_fingers": "Magic",
    "scratch_head": "Confused",
    "crossed_hands": "Wrong",
    "hands_on_ears": "Too loud",
    "hand_covering_mouth": "Surprise",
    "hands_shrug": "I don't know",
}


def recognize_gesture(landmarks):
    """
    Recognize different hand gestures based on finger positions.
    """
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    ring_tip = landmarks[16]
    pinky_tip = landmarks[20]

    # Check if fingers are up or down
    fingers_up = [landmarks[i][1] < landmarks[i - 2][1] for i in [8, 12, 16, 20]]

    # Thumbs Up
    if landmarks[4][1] < landmarks[3][1] and all(not f for f in fingers_up):
        return "thumbs_up"
    
    # Thumbs Down
    if landmarks[4][1] > landmarks[3][1] and all(not f for f in fingers_up):
        return "thumbs_down"

    # Peace Sign (Index & Middle Finger Up)
    if fingers_up[0] and fingers_up[1] and not fingers_up[2] and not fingers_up[3]:
        return "peace"

    # Fist (All Fingers Bent)
    if all(not f for f in fingers_up) and thumb_tip[1] > landmarks[3][1]:
        return "fist"

    # Open Palm (All Fingers Extended)
    if all(f for f in fingers_up):
        return "open_palm"

    # OK Sign (Thumb & Index Finger Touching)
    if abs(thumb_tip[0] - index_tip[0]) < 0.02 and not any(fingers_up[1:]):
        return "ok_sign"

    # High Five (All Fingers Spread Out)
    if all(fingers_up) and abs(index_tip[0] - pinky_tip[0]) > 0.1:
        return "high_five"

    # "Rock On" Gesture (Index & Pinky Up)
    if fingers_up[0] and not fingers_up[1] and not fingers_up[2] and fingers_up[3]:
        return "rock_on"
