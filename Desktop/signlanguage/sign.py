import cv2
import mediapipe as mp
import pyttsx3
import numpy as np

# Initialize Mediapipe Hand Tracking
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(min_detection_confidence=0.7)

# Initialize Text-to-Speech
engine = pyttsx3.init()

# Define Gesture Dictionary
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
}

# Function to recognize hand gestures based on landmark positions
def recognize_gesture(landmarks):
    thumb_tip = landmarks[4][0]
    index_tip = landmarks[8][0]
    middle_tip = landmarks[12][0]
    ring_tip = landmarks[16][0]
    pinky_tip = landmarks[20][0]
    
    # Thumb up detection
    if landmarks[4][1] < landmarks[3][1] and landmarks[8][1] > landmarks[6][1]:
        return "thumbs_up"
    
    # Thumb down detection
    if landmarks[4][1] > landmarks[3][1] and landmarks[8][1] > landmarks[6][1]:
        return "thumbs_down"
    
    # Peace sign (index and middle fingers up, others down)
    if landmarks[8][1] < landmarks[6][1] and landmarks[12][1] < landmarks[10][1] and \
       landmarks[16][1] > landmarks[14][1] and landmarks[20][1] > landmarks[18][1]:
        return "peace"
    
    # Fist (all fingers curled)
    if all(landmarks[i][1] > landmarks[i - 2][1] for i in [4, 8, 12, 16, 20]):
        return "fist"
    
    # Open palm (all fingers extended)
    if all(landmarks[i][1] < landmarks[i - 2][1] for i in [8, 12, 16, 20]):
        return "open_palm"
    
    # OK sign (thumb and index tip close together)
    if abs(thumb_tip - index_tip) < 0.02 and landmarks[12][1] > landmarks[10][1]:
        return "ok_sign"
    
    # Counting fingers (1-5)
    fingers_up = sum(1 for i in [8, 12, 16, 20] if landmarks[i][1] < landmarks[i - 2][1])
    
    if fingers_up == 1:
        return "one_finger"
    elif fingers_up == 2:
        return "two_fingers"
    elif fingers_up == 3:
        return "three_fingers"
    elif fingers_up == 4:
        return "four_fingers"
    elif fingers_up == 5:
        return "five_fingers"

    return "unknown"

# Open Webcam
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Convert to RGB for Mediapipe
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Extract landmark positions
            landmarks = [(lm.x, lm.y) for lm in hand_landmarks.landmark]
            gesture = recognize_gesture(landmarks)

            if gesture in gesture_dict:
                text = gesture_dict[gesture]
                cv2.putText(frame, text, (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                # Speak the detected gesture
                engine.say(text)
                engine.runAndWait()

    cv2.imshow("Sign Language Recognition", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
