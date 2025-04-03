from pyfingerprint.pyfingerprint import PyFingerprint
import database

#Initial scanner

def initial_scanner():
    try:
        f = PyFingerprint('/dev/ttyUSB0', 57600, 0xFFFFFFFF, 0x00000000)
        
        if not f.verifyPassword():
            raise ValueError("Fingerprint scanner password is incorrect")
        
        return f
    
    except Exception as e:
        print("Failed to initialize fingerprint scanner: " + e)
        return None


# Function to enroll a new fingerprint
def enroll_fingerprint(employee_name):
    f = initialize_scanner()
    if not f:
        return
    
    print("Place your finger on the scanner...")
    
    while not f.readImage():
        pass

    f.convertImage(0x01)
    
    result = f.searchTemplate()
    position_number = result[0]

    if position_number >= 0:
        print("Fingerprint already exists at position", position_number)
        return
    
    f.createTemplate()
    fingerprint_data = str(f.downloadCharacteristics(0x01))

    database.add_employee(employee_name, fingerprint_data)
    print(f"Employee {employee_name} added successfully!")

# Function to verify a fingerprint
def verify_fingerprint():
    f = initialize_scanner()
    if not f:
        return

    print("Place your finger on the scanner for verification...")

    while not f.readImage():
        pass

    f.convertImage(0x01)
    
    result = f.searchTemplate()
    position_number = result[0]

    if position_number == -1:
        print("Fingerprint not recognized.")
    else:
        print(f"Fingerprint recognized! Position: {position_number}")