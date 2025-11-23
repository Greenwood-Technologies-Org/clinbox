"""DSPY-powered API routes."""

import os

# Disable DSPy cache before importing to prevent permissions issues
os.environ["DSPY_CACHE_DISABLED"] = "1"
os.environ["DSPY_CACHE_TYPE"] = "none"

from dotenv import load_dotenv
from flask import Blueprint, jsonify, request
import dspy
import json
from app.dspy_signatures import DraftEmailReply, CategorizeEmailThread, GenerateTodos

dspy_bp = Blueprint("dspy", __name__)

# Initialize DSPY with your LLM provider
load_dotenv("../.env")
# Use Gemini 2.5 Flash - API key should be in .env as GEMINI_API_KEY
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    # Set GOOGLE_API_KEY for DSPy if it's not already set
    if not os.getenv("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = api_key
lm = dspy.LM("gemini/gemini-2.5-flash-lite", temperature=0.0, cache=False)
dspy.settings.configure(lm=lm)


@dspy_bp.route("/draft-email-reply", methods=["POST"])
def draft_email_reply():
    """Draft an email reply based on an email thread and todo task.

    Expected JSON payload:
    {
        "email_thread": "From: john@example.com\nDate: 2024-10-24 10:30 AM\nSubject: Project Update\nBody: ...\n\nFrom: jane@example.com\nDate: 2024-10-24 11:15 AM\nSubject: Re: Project Update\nBody: ...",
        "todo_description": "Confirm follow-up with internal team"
    }

    Returns:
    {
        "success": true,
        "draft": {
            "to": "john@example.com, jane@example.com",
            "cc": "manager@example.com",
            "bcc": "",
            "subject": "Re: Project Update",
            "body": "Hi John and Jane,\n\nThank you for your updates..."
        }
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["email_thread", "todo_description"]
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify(
                {"success": False, "error": f"Missing required fields: {', '.join(missing_fields)}"}
            ), 400

        # Draft the email reply using DSPY
        draft_reply_signature = dspy.ChainOfThought(DraftEmailReply)

        user_profile = json.dumps(data.get("user_profile", {}))

        # Optional context inputs
        documents = json.dumps(data.get("documents", []))
        email_context = data.get("email_context", "")

        result = draft_reply_signature(
            email_thread=data["email_thread"],
            todo_description=data["todo_description"],
            user_profile=user_profile,
            documents=documents,
            email_context=email_context,
        )

        return jsonify(
            {
                "success": True,
                "draft": {
                    "to": result.to,
                    "cc": result.cc,
                    "bcc": result.bcc,
                    "subject": result.subject,
                    "body": result.body,
                    "references": result.references if hasattr(result, "references") else "[]",
                    "reasoning": result.reasoning if hasattr(result, "reasoning") else "",
                },
            }
        ), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dspy_bp.route("/categorize-email", methods=["POST"])
def categorize_email():
    """Categorize an email thread into clinical research tasks using AI.

    Expected JSON payload:
    {
        "email_thread": {
            "id": 1,
            "subject": "Protocol Amendment Review",
            "participants": ["john@site.com", "jane@cro.com"],
            "description": "Discussion about protocol changes",
            "messages": [
                {
                    "from": "john@site.com",
                    "to": "jane@cro.com",
                    "timestamp": "2024-10-24 10:30 AM",
                    "content": "We need to review the protocol amendment..."
                }
            ]
        },
        "existing_tasks": [
            {
                "id": 1,
                "subject": "Protocol Amendment Implementation",
                "summary": "Review and implement protocol changes across all sites",
                "status": "In Progress",
                "urgency": "High"
            }
        ]
    }

    Returns:
    {
        "success": true,
        "recommendation": {
            "action": "assign_existing" | "create_new",
            "task_id": "1" (if assign_existing),
            "confidence": "85",
            "reasoning": "Email content matches existing protocol amendment task...",
            "new_task": {  (if create_new)
                "subject": "New Task Subject",
                "summary": "Task summary",
                "priority": "Medium"
            }
        }
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["email_thread", "existing_tasks"]
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify(
                {"success": False, "error": f"Missing required fields: {', '.join(missing_fields)}"}
            ), 400

        thread = data["email_thread"]
        email_content = f"""
Subject: {thread.get("subject", "")}
Participants: {", ".join(thread.get("participants", []))}
Description: {thread.get("description", "")}

Messages:
"""

        for msg in thread.get("messages", []):
            email_content += f"""
From: {msg.get("from", "")}
To: {msg.get("to", "")}
Time: {msg.get("timestamp", "")}
Content: {msg.get("content", "")}
---
"""

        # Format existing tasks as JSON string
        existing_tasks_json = json.dumps(data["existing_tasks"])

        # Use DSPy to categorize the email
        categorize_signature = dspy.ChainOfThought(CategorizeEmailThread)

        user_profile = json.dumps(data.get("user_profile", {}))

        result = categorize_signature(
            email_thread=email_content.strip(),
            existing_tasks=existing_tasks_json,
            user_profile=user_profile,
        )

        # Build response
        recommendation = {
            "action": result.action,
            "confidence": result.confidence,
            "reasoning": result.reasoning,
        }

        if result.action == "assign_existing":
            recommendation["task_id"] = result.task_id
        elif result.action == "create_new":
            recommendation["new_task"] = {
                "subject": result.new_task_subject,
                "summary": result.new_task_summary,
                "priority": result.new_task_priority,
            }

        return jsonify({"success": True, "recommendation": recommendation}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@dspy_bp.route("/generate-todos", methods=["POST"])
def generate_todos():
    """Generate TODO tasks for clinical research based on task context and email threads.

    Expected JSON payload:
    {
        "task": {
            "id": 1,
            "subject": "Subject 103-004 AE / Con Med Mismatch",
            "summary": "Data management flagged a mismatch...",
            "urgency": "High",
            "status": "In Progress"
        },
        "email_threads": [
            {
                "id": 1,
                "name": "Medical Monitor → Data Management → CRA",
                "description": "Internal thread...",
                "participants": ["Medical Monitor", "Data Management", "CRA"],
                "messages": [
                    {
                        "from": "Medical Monitor",
                        "to": "Data Management",
                        "timestamp": "2 hours ago",
                        "content": "We have identified a discrepancy..."
                    }
                ]
            }
        ],
        "existing_todos": [
            {
                "id": 1,
                "description": "Confirm follow-up with internal team",
                "status": "pending",
                "tag": "Thread 1"
            }
        ]
    }

    Returns:
    {
        "success": true,
        "todos": [
            {
                "description": "Review and verify data accuracy",
                "priority": "High",
                "tag": "EDC",
                "reasoning": "Data discrepancy requires immediate verification"
            }
        ],
        "summary": "Generated 4 TODO suggestions based on task analysis and thread content."
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["task", "email_threads", "existing_todos"]
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify(
                {"success": False, "error": f"Missing required fields: {', '.join(missing_fields)}"}
            ), 400

        task = data["task"]
        task_context = f"""
Task ID: {task.get("id", "")}
Subject: {task.get("subject", "")}
Summary: {task.get("summary", "")}
Urgency: {task.get("urgency", "")}
Status: {task.get("status", "")}
"""

        # Format email threads
        email_threads_json = json.dumps(data["email_threads"])

        # Format existing todos
        existing_todos_json = json.dumps(data["existing_todos"])

        # Use DSPy to generate TODOs
        generate_todos_signature = dspy.ChainOfThought(GenerateTodos)

        user_profile = json.dumps(data.get("user_profile", {}))

        result = generate_todos_signature(
            task_context=task_context.strip(),
            email_threads=email_threads_json,
            existing_todos=existing_todos_json,
            user_profile=user_profile,
        )

        # Parse the JSON response
        try:
            todos_list = json.loads(result.todos)
        except json.JSONDecodeError:
            # If JSON parsing fails, return an error
            return jsonify({"success": False, "error": "Invalid JSON format in AI response"}), 500

        return jsonify(
            {
                "success": True,
                "coverage_assessment": result.coverage_assessment,
                "todos": todos_list,
                "summary": result.summary,
            }
        ), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
