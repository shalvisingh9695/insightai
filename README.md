# InsightAI 🚀

AI-powered Resume Analyzer with RAG

## Features
- **Resume Upload & Parsing**: Drag-and-drop PDF upload powered by `pdf-parse` or direct resume text input.
- **AI-based Question Answering**: Interactive RAG (Retrieval-Augmented Generation) resume chat powered by the Gemini API and MongoDB vector document storage.
- **ATS Score**: Comprehensive ATS scoring benchmark analyzing keyword density, Google XYZ impact verbs, and formatting readability against top hiring platforms (Workday, Greenhouse, Lever).
- **Dynamic Dashboard**: Interactive candidate intelligence cards showcasing Candidate Name, Target Role, Experience duration, and verified Skills (as interactive tags), along with recruiter heatmaps and section diagnostics.
- **JWT Authentication**: Persistent user sessions, login/registration modal, welcome greetings, and secure token storage in `localStorage`.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion (`motion/react`)
- **Backend**: Node.js, Express, `pdf-parse`, JSON Web Tokens (JWT), `bcryptjs`
- **Database**: MongoDB (Mongoose schemas for Resumes, Chunks, and User Profiles)
- **AI / LLM**: Google Gemini API (`@google/genai`) for RAG semantic search, resume Q&A, and XYZ bullet optimization

## Live Link
- **Shared App**: [https://ais-pre-j2vghupjle4kcjx5kzmz5k-49500876120.asia-east1.run.app](https://ais-pre-j2vghupjle4kcjx5kzmz5k-49500876120.asia-east1.run.app)
- **Development App**: [https://ais-dev-j2vghupjle4kcjx5kzmz5k-49500876120.asia-east1.run.app](https://ais-dev-j2vghupjle4kcjx5kzmz5k-49500876120.asia-east1.run.app)

## Screenshots
- **Candidate Intelligence Dashboard**: Real-time ATS benchmark vitals, keyword matrix, and candidate profile cards (Name, Role, Experience, Skills tags with hover effects).
- **RAG Resume Chat & QA**: Grounded question-answering with semantic chunk citations directly from candidate resumes.
- **Google XYZ Bullet Optimizer**: Rewrite bullets with quantifiable action verbs, metrics, and measurable impact.
- **6-Second Recruiter Heatmap**: Visual attention distribution simulating top recruiter screening patterns.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB instance (or local MongoDB daemon)
- Google Gemini API Key (`GEMINI_API_KEY`)

### Quick Start
```bash
# Install dependencies
npm install

# Run development server (Vite + Express on port 3000)
npm run dev

# Run production build
npm run build
```
