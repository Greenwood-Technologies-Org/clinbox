# Makora Bio Backend

Flask backend for the Makora Bio website with DSPY integration for LLM workflows.

## Prerequisites

- Python 3.11 or higher
- [uv](https://github.com/astral-sh/uv) package manager

## Installation

### 1. Install uv

If you haven't already installed `uv`, you can install it with:

```bash
# On macOS and Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or with pip
pip install uv
```

### 2. Set up the environment

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment and install dependencies:

```bash
# Create virtual environment with uv
uv venv

# Activate the virtual environment
# On macOS/Linux:
source .venv/bin/activate
```

### 3. Install dependencies

```bash
# Install all dependencies from pyproject.toml
uv pip install -e .

# Or install with development dependencies
uv pip install -e ".[dev]"
```

```python
python -m ipykernel install --user --name=makora-bio-backend --display-name "makora-bio-backend"
```

### 4. Configure environment variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys and configuration:

```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

## Running the Application

### Development mode

```bash
# Make sure your virtual environment is activated
source .venv/bin/activate

# Run the Flask app
python main.py
```

The server will start on `http://localhost:5001`

**Note for macOS users:** Port 5000 may be in use by AirPlay Receiver. If you get an "Address already in use" error:
- Either disable AirPlay Receiver in System Settings → General → AirDrop & Handoff
- Or run on a different port: Modify `main.py` to use port 5001 or set `FLASK_PORT=5001` in your `.env` file

### Production mode

```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py      # Application factory
│   ├── routes.py        # API routes
│   └── config.py        # Configuration settings
├── main.py              # Entry point
├── pyproject.toml       # Project dependencies and configuration
├── .env.example         # Example environment variables
└── README.md            # This file
```

## API Endpoints

### Health Check
- `GET /health` - Check if the service is running

### API Routes
- `GET /api/test` - Test endpoint
- `POST /api/dspy/test` - DSPY test endpoint (placeholder)

## Using uv Commands

### Add a new dependency

```bash
# Add a regular dependency
uv pip install package-name

# Add a development dependency
uv pip install --dev package-name
```

### Update dependencies

```bash
uv pip install --upgrade package-name
```

### Sync dependencies

```bash
uv pip sync
```

## Development

### Running tests

```bash
pytest
```

### Code formatting

```bash
# Format code with black
black .

# Lint with ruff
ruff check .
```

### Type checking

```bash
mypy .
```

## DSPY Integration

DSPY (Declarative Self-improving Language Programs) is included for building LLM workflows. 

To use DSPY:

1. Configure your LLM provider in `.env` (e.g., OpenAI API key)
2. Import and use DSPY in your routes:

```python
import dspy

# Configure your LM
lm = dspy.OpenAI(model="gpt-4")
dspy.settings.configure(lm=lm)

# Create DSPY modules and use them in your endpoints
```

## Next Steps

- [ ] Implement DSPY workflows in `app/routes.py`
- [ ] Add authentication/authorization
- [ ] Set up database integration if needed
- [ ] Add comprehensive tests
- [ ] Configure production deployment

## Troubleshooting

### Virtual environment not activating

Make sure you're in the `backend` directory and run:
```bash
source .venv/bin/activate
```

### Import errors

Ensure all dependencies are installed:
```bash
uv pip install -e .
```

### Port already in use

**Common on macOS:** Port 5000 is used by AirPlay Receiver by default.

Solutions:
1. Disable AirPlay Receiver: System Settings → General → AirDrop & Handoff → Turn off "AirPlay Receiver"
2. Use a different port by modifying `main.py` to use port 5001 or another available port
3. Set `FLASK_PORT=5001` in your `.env` file

### Build errors with uv

If you see "Unable to determine which files to ship inside the wheel", make sure your `pyproject.toml` has:
```toml
[tool.hatch.build.targets.wheel]
packages = ["app"]
```
