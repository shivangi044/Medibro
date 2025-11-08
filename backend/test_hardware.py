"""
MediBro Hardware Simulator
A simple tool to test hardware API integration without actual hardware
"""

import requests
import time
from datetime import datetime
import json

# ============================================
# CONFIGURATION - Change these values
# ============================================
SERVER_URL = "http://localhost:5000/api/hardware"  # Change to your server IP
BOT_ID = "MD-BOT-01"  # Your bot ID

class Colors:
    """ANSI color codes for pretty printing"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.HEADER}{text:^60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

# ============================================
# API Functions
# ============================================

def test_health_check():
    """Test 1: Health Check"""
    print_header("Test 1: Health Check")
    try:
        response = requests.get(
            f"{SERVER_URL}/health",
            params={"botId": BOT_ID},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Server is running!")
            print_info(f"Bot ID: {data.get('botId', 'N/A')}")
            print_info(f"Bot Registered: {data.get('botRegistered', False)}")
            print_info(f"Timestamp: {data.get('timestamp', 'N/A')}")
            return True
        else:
            print_error(f"Health check failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print_error(f"Connection error: {e}")
        return False

def test_fetch_schedule():
    """Test 2: Fetch Schedule"""
    print_header("Test 2: Fetch Schedule")
    try:
        response = requests.get(
            f"{SERVER_URL}/schedule",
            params={"botId": BOT_ID},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            count = data.get('scheduleCount', 0)
            print_success(f"Schedule fetched: {count} medicine(s)")
            
            if count > 0:
                print_info("\nSchedule Details:")
                for idx, medicine in enumerate(data.get('data', []), 1):
                    print(f"\n  {idx}. {Colors.BOLD}{medicine['medicineName']}{Colors.END}")
                    print(f"     Dosage: {medicine['dosage']}")
                    print(f"     Slot: {medicine['slot']}")
                    print(f"     Time: {medicine['scheduledTime']}")
                    print(f"     Log ID: {medicine['logId']}")
                    print(f"     Status: {medicine['status']}")
            else:
                print_warning("No medicines scheduled for dispensing")
            
            return data.get('data', [])
        else:
            print_error(f"Failed to fetch schedule: {response.status_code}")
            print(response.text)
            return []
    except Exception as e:
        print_error(f"Error: {e}")
        return []

def test_update_status(log_id):
    """Test 3: Update Status"""
    print_header("Test 3: Update Medicine Status")
    print_info(f"Updating status for log ID: {log_id}")
    
    try:
        payload = {
            "botId": BOT_ID,
            "logId": log_id,
            "status": "dispensed",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        response = requests.post(
            f"{SERVER_URL}/update-status",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Status updated successfully!")
            print_info(f"New Status: {data['data']['status']}")
            print_info(f"Taken Time: {data['data']['takenTime']}")
            return True
        else:
            print_error(f"Failed to update status: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_get_slots():
    """Test 4: Get Slot Configuration"""
    print_header("Test 4: Get Slot Configuration")
    try:
        response = requests.get(
            f"{SERVER_URL}/slots",
            params={"botId": BOT_ID},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            count = data.get('slotCount', 0)
            print_success(f"Slot configuration retrieved: {count} slot(s)")
            
            if count > 0:
                print_info("\nSlot Configuration:")
                for slot in data.get('data', []):
                    print(f"\n  Slot {Colors.BOLD}{slot['slot']}{Colors.END}:")
                    print(f"    Medicine: {slot['medicineName']}")
                    print(f"    Dosage: {slot['dosage']}")
                    print(f"    Remaining: {slot['remaining']}")
                    print(f"    Times: {', '.join(slot['times'])}")
            else:
                print_warning("No slots configured")
            
            return True
        else:
            print_error(f"Failed to get slots: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def simulate_dispense(slot, medicine_name):
    """Simulate medicine dispensing"""
    print(f"\n{Colors.YELLOW}🔔 DISPENSING MEDICINE...{Colors.END}")
    print(f"   Medicine: {Colors.BOLD}{medicine_name}{Colors.END}")
    print(f"   Slot: {Colors.BOLD}{slot}{Colors.END}")
    print("   [Motor activating...]")
    time.sleep(1)
    print("   [LED blinking...]")
    time.sleep(1)
    print("   [Buzzer beeping...]")
    time.sleep(1)
    print_success("Medicine dispensed successfully!")

# ============================================
# Main Menu
# ============================================

def show_menu():
    print_header("MediBro Hardware Simulator")
    print(f"{Colors.CYAN}Server URL: {Colors.END}{SERVER_URL}")
    print(f"{Colors.CYAN}Bot ID: {Colors.END}{BOT_ID}\n")
    
    print("Available Tests:")
    print("  1. Health Check")
    print("  2. Fetch Medicine Schedule")
    print("  3. Update Medicine Status (after dispensing)")
    print("  4. Get Slot Configuration")
    print("  5. Simulate Complete Dispense Flow")
    print("  6. Run All Tests")
    print("  7. Change Configuration")
    print("  0. Exit")
    print()

def change_configuration():
    """Change server URL and Bot ID"""
    global SERVER_URL, BOT_ID
    
    print_header("Change Configuration")
    new_url = input(f"Enter new server URL (current: {SERVER_URL}): ").strip()
    if new_url:
        SERVER_URL = new_url
        print_success(f"Server URL updated to: {SERVER_URL}")
    
    new_bot_id = input(f"Enter new Bot ID (current: {BOT_ID}): ").strip()
    if new_bot_id:
        BOT_ID = new_bot_id
        print_success(f"Bot ID updated to: {BOT_ID}")

def simulate_complete_flow():
    """Simulate complete medicine dispensing flow"""
    print_header("Complete Dispense Flow Simulation")
    
    # Step 1: Health check
    print_info("Step 1: Checking server connection...")
    if not test_health_check():
        print_error("Cannot proceed without server connection")
        return
    
    # Step 2: Fetch schedule
    print_info("\nStep 2: Fetching today's schedule...")
    schedule = test_fetch_schedule()
    
    if not schedule:
        print_warning("No medicines to dispense. Please add medicines through the mobile app first.")
        return
    
    # Step 3: Simulate dispensing
    print_info("\nStep 3: Simulating medicine dispensing...")
    for medicine in schedule:
        simulate_dispense(medicine['slot'], medicine['medicineName'])
        
        # Update status
        print_info("\nStep 4: Updating status in backend...")
        test_update_status(medicine['logId'])
        
        if len(schedule) > 1:
            print_info("\nWaiting 3 seconds before next medicine...")
            time.sleep(3)
    
    print_success("\n✓ Complete flow simulation finished!")

def run_all_tests():
    """Run all tests sequentially"""
    print_header("Running All Tests")
    
    test_health_check()
    time.sleep(1)
    
    schedule = test_fetch_schedule()
    time.sleep(1)
    
    if schedule:
        test_update_status(schedule[0]['logId'])
        time.sleep(1)
    
    test_get_slots()
    
    print_success("\n✓ All tests completed!")

def main():
    """Main function"""
    while True:
        show_menu()
        choice = input(f"{Colors.BOLD}Select option (0-7): {Colors.END}").strip()
        
        if choice == '1':
            test_health_check()
        elif choice == '2':
            test_fetch_schedule()
        elif choice == '3':
            schedule = test_fetch_schedule()
            if schedule:
                log_id = schedule[0]['logId']
                test_update_status(log_id)
            else:
                print_warning("No medicines in schedule to update")
        elif choice == '4':
            test_get_slots()
        elif choice == '5':
            simulate_complete_flow()
        elif choice == '6':
            run_all_tests()
        elif choice == '7':
            change_configuration()
        elif choice == '0':
            print_header("Goodbye!")
            break
        else:
            print_error("Invalid option. Please try again.")
        
        input(f"\n{Colors.CYAN}Press Enter to continue...{Colors.END}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Interrupted by user{Colors.END}")
    except Exception as e:
        print_error(f"Unexpected error: {e}")
