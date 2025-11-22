"""DSPY signatures for email processing."""

import dspy


class CategorizeEmailThread(dspy.Signature):
    """Categorize an email thread into clinical research tasks.
    
    Analyzes email content to determine if it should be assigned to an existing task
    or if a new task should be created. Specializes in clinical research workflows.
    """
    
    # Inputs
    email_thread: str = dspy.InputField(
        desc="The email thread content including subject, participants, and message bodies"
    )
    existing_tasks: str = dspy.InputField(
        desc="JSON string of existing tasks with their subjects, summaries, and current status"
    )
    user_profile: str = dspy.InputField(
        desc="Information about the current user (name, email, organization, role). Treat outputs from this person's perspective."
    )
    
    # Outputs
    action: str = dspy.OutputField(
        desc="Either 'assign_existing' to assign to an existing task, or 'create_new' to create a new task"
    )
    task_id: str = dspy.OutputField(
        desc="If action is 'assign_existing', the ID of the existing task. Otherwise, empty string."
    )
    confidence: str = dspy.OutputField(
        desc="Confidence score from 0-100 for the recommendation"
    )
    reasoning: str = dspy.OutputField(
        desc="Brief explanation of why this categorization was chosen"
    )
    new_task_subject: str = dspy.OutputField(
        desc="If action is 'create_new', a concise subject for the new task. Otherwise, empty string."
    )
    new_task_summary: str = dspy.OutputField(
        desc="If action is 'create_new', a brief summary of what the task involves. Otherwise, empty string."
    )
    new_task_priority: str = dspy.OutputField(
        desc="If action is 'create_new', priority level: 'High', 'Medium', or 'Low'. Otherwise, empty string."
    )


class DraftEmailReply(dspy.Signature):
    """Draft an email reply based on an email thread and a todo task description.

    Analyzes the email thread context and the todo task to generate an appropriate
    email reply with recipients and content.
    """

    # Inputs
    email_thread: str = dspy.InputField(
        desc="The full email thread including sender names, email addresses, timestamps, and message bodies"
    )
    todo_description: str = dspy.InputField(
        desc="The todo task description that this email reply should address (e.g., 'Confirm follow-up with internal team')"
    )
    user_profile: str = dspy.InputField(
        desc="Information about the current user composing the reply (name, email, organization, role). Use an appropriate tone and sign-off."
    )
    documents: str = dspy.InputField(
        desc="JSON string array of available documents to cite. Each item may include: type, title, date, description, and raw_text (the raw text content)."
    )
    email_context: str = dspy.InputField(
        desc="Additional email context or summaries (e.g., thread descriptions or prior decisions) to inform citations."
    )

    # Outputs
    to: str = dspy.OutputField(desc="Comma-separated list of email addresses for the 'To' field")
    cc: str = dspy.OutputField(
        desc="Comma-separated list of email addresses for the 'CC' field, or empty string if none"
    )
    bcc: str = dspy.OutputField(
        desc="Comma-separated list of email addresses for the 'BCC' field, or empty string if none"
    )
    subject: str = dspy.OutputField(
        desc="The subject line for the email reply (typically 'Re: original subject')"
    )
    body: str = dspy.OutputField(
        desc="The full content of the email reply, professionally written and addressing the todo task"
    )
    references: str = dspy.OutputField(
        desc="JSON array of references used in the draft (e.g., prior emails, attached documents). Each item should include type, title, and optional date/source."
    )
    reasoning: str = dspy.OutputField(
        desc="Brief reasoning explaining why cited references were included."
    )


class GenerateTodos(dspy.Signature):
    """Generate TODO tasks for clinical research based on task context and email threads.

    Analyzes the task details and associated email threads to suggest relevant,
    actionable TODO items that help resolve the clinical research issue.

    STRICT FILTERING: Only include TODOs that are directly actionable by the
    person described in user_profile. Exclude items that primarily require action
    from other roles (e.g., site pharmacist, data manager) unless the user's role
    is to coordinate that action. If nothing is appropriate for this user, return
    an empty list. Prefer at most 3–5 high-impact items.
    """

    # Inputs
    task_context: str = dspy.InputField(
        desc="The task details including subject, summary, urgency, and status"
    )
    email_threads: str = dspy.InputField(
        desc="JSON string of associated email threads with their messages and participants"
    )
    existing_todos: str = dspy.InputField(
        desc="JSON string of existing TODO items to analyze for completeness"
    )
    user_profile: str = dspy.InputField(
        desc="Information about the current user (name, email, organization, role). Tailor suggestions to this role."
    )

    # Outputs
    coverage_assessment: str = dspy.OutputField(
        desc="Assessment of whether existing TODOs comprehensively cover the task requirements for this user. Either 'comprehensive' if existing TODOs are sufficient, or 'gaps_identified' if new TODOs are needed"
    )
    todos: str = dspy.OutputField(
        desc="JSON array of suggested TODO objects specifically for this user (empty array if none are appropriate or coverage is comprehensive), each with 'description', 'priority' (High/Medium/Low), 'tag' (system tag like 'EDC', 'Thread 1', 'Thread 2', etc.), and 'reasoning' (why this TODO is needed)"
    )
    summary: str = dspy.OutputField(
        desc="Brief explanation of the coverage assessment and TODO generation strategy. If comprehensive, explain why existing TODOs are sufficient. If gaps identified, explain what new TODOs were suggested."
    )