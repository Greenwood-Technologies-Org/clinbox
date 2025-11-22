"""
Data persistence routes for saving changes back to coms.json
"""

import json
import os
from flask import Blueprint, request, jsonify

data_bp = Blueprint('data', __name__, url_prefix='/api/data')

# Path to the coms.json file
COMS_JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'src', 'data', 'coms.json')

@data_bp.route("/save", methods=["POST"])
def save_data():
    """Save data back to coms.json file."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Validate data structure
        if "problems" not in data or "threads" not in data:
            return jsonify({"success": False, "error": "Invalid data structure. Must contain 'problems' and 'threads'"}), 400
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(COMS_JSON_PATH), exist_ok=True)
        
        # Write the data to the JSON file
        with open(COMS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return jsonify({"success": True, "message": "Data saved successfully"}), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@data_bp.route("/load", methods=["GET"])
def load_data():
    """Load data from coms.json file."""
    try:
        if not os.path.exists(COMS_JSON_PATH):
            # Return empty structure if file doesn't exist
            return jsonify({
                "success": True,
                "data": {
                    "problems": [],
                    "threads": []
                }
            }), 200
        
        with open(COMS_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return jsonify({"success": True, "data": data}), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@data_bp.route("/backup", methods=["POST"])
def backup_data():
    """Create a backup of the current coms.json file."""
    try:
        if not os.path.exists(COMS_JSON_PATH):
            return jsonify({"success": False, "error": "No data file to backup"}), 404
        
        # Create backup filename with timestamp
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = COMS_JSON_PATH.replace('.json', f'_backup_{timestamp}.json')
        
        # Copy the file
        import shutil
        shutil.copy2(COMS_JSON_PATH, backup_path)
        
        return jsonify({
            "success": True, 
            "message": "Backup created successfully",
            "backup_path": backup_path
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
