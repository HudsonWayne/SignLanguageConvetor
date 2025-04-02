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


# Function to recognize a sign (You need to train an ML model for better accuracy)
def recognize_gesture(landmarks):
    # Placeholder logic: Detect if thumb is up (basic condition)
    if landmarks[4][1] < landmarks[3][1]:  
        return "thumbs_up"
    return "unknown"

# Open webcam
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

# Convert to RGB
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
                
                  
                # Convert text to speech
                engine.say(text)
                engine.runAndWait()

    cv2.imshow("Sign Language Recognition", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()