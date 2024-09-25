from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from flask_cors import CORS
import requests
import os

app = Flask(__name__)

# Enable CORS for all routes and allow requests from external URL
CORS(app, resources={r"/*": {"origins": os.getenv('EXTERNAL_URL')}})

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    register = request.json.get('register')
    password = request.json.get('password')

    # Authentication and schedule URLs
    auth_url = os.getenv('CETI_AUTH_URL')
    schedule_url = os.getenv('CETI_SCHEDULE_URL')

    # Form data for authentication
    data = {
        'registro': register,
        'password': password,
    }

    # Log in by sending the data with POST
    session = requests.Session()
    response = session.post(auth_url, data=data)

    # If the login was successful, make the request to the schedule URL
    if response.status_code == 200:
        schedule_response = session.get(schedule_url)

        # Parse the HTML
        soup = BeautifulSoup(schedule_response.text, 'html.parser')

        # Try to find the table
        table = soup.find("table", class_="tabla")

        if table:
            # If the table exists, extract the rows
            rows = table.find_all("tr")

            try:
                # Extract specific data
                register = rows[0].find_all("td")[1].text.strip()  # Register
                name = rows[0].find_all("td")[3].text.strip()  # Name
                education_level = rows[1].find_all("td")[1].text.strip()  # Education Level
                major = rows[1].find_all("td")[3].text.strip()  # Major
                campus = rows[2].find_all("td")[1].text.strip()  # Campus
                level = rows[2].find_all("td")[5].text.strip()  # Level
                shift = rows[3].find_all("td")[1].text.strip()  # Shift
                group = rows[3].find_all("td")[5].text.strip()  # Group
                gmail_email = rows[4].find_all("td")[5].text.strip()  # Gmail Email

                # Prepare the extracted data
                extracted_data = {
                    'campus': campus,
                    'major': major,
                    'group': group,
                    'institutional_mail': gmail_email,
                    'level': level,
                    'education_level': education_level,
                    'name': name,
                    'register': register,
                    'shift': shift,
                }

                return jsonify(extracted_data), 200
            except (IndexError, AttributeError) as e:
                # Handle errors if data extraction fails
                return jsonify({'error': 'Could not extract schedule information. Please check the entered data.'}), 500
        else:
            # If the table was not found in the HTML
            return jsonify({'error': 'Schedule information table not found on the page.'}), 500
    else:
        # If the login failed
        return jsonify({'error': 'Authentication failed. Please check your register and password.'}), 401

if __name__ == '__main__':
    app.run(debug=True)
