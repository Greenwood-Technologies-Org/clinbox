#!/usr/bin/env python3
"""
Convert generated email threads to Gmail API format for simulated inbox
"""

import json
import os
from datetime import datetime
import base64
import hashlib


def generate_id(seed):
    """Generate a unique ID based on seed"""
    return hashlib.md5(str(seed).encode()).hexdigest()[:16]


def timestamp_to_millis(timestamp_str):
    """Convert ISO timestamp to milliseconds"""
    dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    return int(dt.timestamp() * 1000)


def create_snippet(body, max_length=150):
    """Create email snippet from body"""
    # Remove extra whitespace and newlines
    snippet = " ".join(body.split())
    if len(snippet) > max_length:
        snippet = snippet[:max_length] + "..."
    return snippet


def encode_body(text):
    """Encode body text to base64"""
    return base64.urlsafe_b64encode(text.encode()).decode().rstrip("=")


def convert_email_to_gmail_format(email, thread_id, is_first_in_thread):
    """Convert a single email from thread format to Gmail API format"""
    email_id = generate_id(email["message_id"])

    # Determine labels
    labels = ["INBOX"]
    if is_first_in_thread:
        labels.append("UNREAD")
    if "URGENT" in email["subject"].upper():
        labels.append("IMPORTANT")

    # Build headers
    headers = [
        {"name": "Delivered-To", "value": "alex.johnson@denalitx.com"},
        {"name": "Return-Path", "value": f"<{email['from_address']}>"},
        {"name": "From", "value": email["from_address"]},
        {"name": "To", "value": ", ".join(email["to_addresses"])},
        {"name": "Subject", "value": email["subject"]},
        {"name": "Date", "value": email["timestamp"]},
        {"name": "Message-ID", "value": f"<{email['message_id']}@mail.example.com>"},
        {"name": "MIME-Version", "value": "1.0"},
        {
            "name": "Content-Type",
            "value": 'multipart/alternative; boundary="000000000000a1b2c3d4e5f6"',
        },
    ]

    if email["cc_addresses"]:
        headers.insert(4, {"name": "Cc", "value": ", ".join(email["cc_addresses"])})

    if email["in_reply_to"]:
        headers.append(
            {"name": "In-Reply-To", "value": f"<{email['in_reply_to']}@mail.example.com>"}
        )
        headers.append(
            {"name": "References", "value": f"<{email['in_reply_to']}@mail.example.com>"}
        )

    # Build body parts
    body_data = encode_body(email["body"])
    parts = [
        {
            "partId": "0",
            "mimeType": "text/plain",
            "filename": "",
            "headers": [{"name": "Content-Type", "value": 'text/plain; charset="UTF-8"'}],
            "body": {"size": len(email["body"]), "data": body_data},
        }
    ]

    # Add attachments if present
    if email["attachments"]:
        for idx, attachment in enumerate(email["attachments"], start=1):
            parts.append(
                {
                    "partId": str(idx),
                    "mimeType": "application/pdf",
                    "filename": attachment,
                    "headers": [
                        {"name": "Content-Type", "value": "application/pdf"},
                        {
                            "name": "Content-Disposition",
                            "value": f'attachment; filename="{attachment}"',
                        },
                    ],
                    "body": {
                        "attachmentId": generate_id(f"{email['message_id']}-{attachment}"),
                        "size": 0,
                    },
                }
            )

    return {
        "id": email_id,
        "threadId": thread_id,
        "labelIds": labels,
        "snippet": create_snippet(email["body"]),
        "historyId": str(int(timestamp_to_millis(email["timestamp"]) / 1000)),
        "internalDate": str(timestamp_to_millis(email["timestamp"])),
        "payload": {
            "partId": "",
            "mimeType": "multipart/alternative",
            "filename": "",
            "headers": headers,
            "body": {"size": len(email["body"])},
            "parts": parts,
        },
        "sizeEstimate": len(email["body"]) + 1000,
        "raw": None,
    }


def main():
    # Input and output directories
    input_dir = (
        "/Users/roshankern/Desktop/Github/clinbox/backend/email_gen/generated_email_threads_2"
    )
    output_dir = "/Users/roshankern/Desktop/Github/clinbox/simulated_backend/simulated_inbox"

    # Process each thread file
    email_data = {}

    for i in range(10):
        thread_file = os.path.join(input_dir, f"thread_{i:03d}.json")

        if not os.path.exists(thread_file):
            print(f"Warning: {thread_file} not found")
            continue

        with open(thread_file, "r") as f:
            thread_data = json.load(f)

        # For threads with multiple emails, we'll use the first email as the main one
        # and create a single combined email file
        emails = thread_data["emails"]

        # Use the first email's message_id to create thread_id
        thread_id = generate_id(emails[0]["message_id"])

        # Convert first email (the main one we'll display)
        gmail_email = convert_email_to_gmail_format(emails[0], thread_id, True)

        # Add thread metadata
        gmail_email["threadEmails"] = [
            convert_email_to_gmail_format(email, thread_id, idx == 0)
            for idx, email in enumerate(emails)
        ]

        # Save to file
        output_file = os.path.join(output_dir, f"email_{i + 1:03d}.json")
        with open(output_file, "w") as f:
            json.dump(gmail_email, f, indent=2)

        # Add to email_data
        email_data[f"email_{i + 1:03d}.json"] = {
            "folder": "Important" if "IMPORTANT" in gmail_email["labelIds"] else "Inbox"
        }

        print(f"Created {output_file}")

    # Create email_data.json
    email_data_file = os.path.join(output_dir, "email_data.json")
    with open(email_data_file, "w") as f:
        json.dump(email_data, f, indent=2)

    print(f"\nCreated {email_data_file}")
    print(f"Successfully converted {len(email_data)} email threads")


if __name__ == "__main__":
    main()
