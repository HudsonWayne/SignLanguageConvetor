import cv2
import mediapipe as mp
import pyttsx3
import numpy as np



mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.7)


engine = pyttsx3.init()

# Define a simple gesture dictionary (You can expand this)
gesture_dict = {
    "thumbs_up": "Hello!",
    "thumbs_down": "No",
    "peace": "Thank you",
    "fist": "Yes",
    "open_palm": "Stop",
    "victory": "Victory",
    "ok_sign": "Okay",
    "index_finger_up": "One",
    "two_fingers_up": "Two",
    "three_fingers_up": "Three",
    "four_fingers_up": "Four",
    "five_fingers_up": "Five",
    "clenched_fist": "Power",
    "finger_gun": "Go",
    "raised_hand": "Wait",
    "call_me": "Call me",
    "crossed_fingers": "Good luck",
    "high_five": "High Five",
    "wave": "Goodbye",
    "rock_on": "Rock on",
    "praying_hands": "Please",
    "heart_sign": "Love",
    "hands_clap": "Applause",
    "index_finger_pointing": "Look",
    "hands_open_wide": "Hug",
    "shaka_sign": "Hang loose",
    "handshake": "Nice to meet you",
    "folded_arms": "Thinking",
    "hand_on_chin": "Curious",
    "two_fingers_crossed": "Hope",
    "point_to_self": "Me",
    "point_to_other": "You",
    "hands_up": "I surrender",
    "palms_together": "Namaste",
    "index_middle_fingers_crossed": "Promise",
    "hand_circle": "I understand",
    "writing_gesture": "Write",
    "reading_gesture": "Read",
    "thumbs_shaking": "Scared",
    "index_swiping": "Swipe",
    "fist_pumping": "Excited",
    "one_hand_wave": "Come here",
    "two_hand_wave": "Go away",
    "palms_pushed_forward": "Push",
    "index_spiral": "Crazy",
    "rub_hands": "Cold",
    "snap_fingers": "Magic",
    "scratch_head": "Confused",
    "crossed_hands": "Wrong",
    "index_up_circular": "Idea",
    "hands_on_ears": "Too loud",
    "hand_covering_mouth": "Surprise",
    "hands_shrug": "I don't know",
    "point_down": "Down",
    "point_up": "Up",
    "index_side_to_side": "No way"
}



def recognize_gesture(landmarks):

    if landmarks[4][1] < landmarks[3][1]:  
        return "thumbs_up"
    return "unknown"


cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break


    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            
            landmarks = [(lm.x, lm.y) for lm in hand_landmarks.landmark]
            gesture = recognize_gesture(landmarks)

            if gesture in gesture_dict:
                text = gesture_dict[gesture]
                cv2.putText(frame, text, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                  
                
                engine.say(text)
                engine.runAndWait()

    cv2.imshow("Sign Language Recognition", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()