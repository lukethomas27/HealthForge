# MediBridge (HealthForge)

**MediBridge** is a modern healthcare communication platform designed to solve the "information gap" in patient care. Research shows that patients retain less than 20% of what they are told during medical appointments. MediBridge bridges this gap by transforming complex clinical consultations into actionable, plain-language health plans for patients, while providing doctors with high-fidelity transcriptions and AI-assisted diagnostic insights.

## 🚀 Key Features

### For Doctors
- **AI-Powered Transcription:** Seamlessly captures patient consultations using Deepgram and Anthropic's Claude API.
- **Clinical Insights:** Generates automated summaries, differential diagnoses, and medication cross-referencing with confidence scoring.
- **Holistic Patient Views:** Integrates simulated wearable data (Heart Rate, Sleep) and environmental factors (AQI, Pollen) to provide a 360-degree view of patient health.
- **RLS-Protected Data:** Secure multi-tenant architecture ensures doctors only access their authorized patient records.

### For Patients
- **Plain-Language Summaries:** Translates "doctor-speak" into clear, understandable language with a "Simplify" toggle for maximum accessibility.
- **Interactive Action Plans:** Converts clinical advice into a daily checklist of medications, lifestyle changes, and warning signs.
- **Family Sharing:** Securely share health insights and action plans with family members or caregivers.
- **Historical Tracking:** Access a complete, searchable history of all past visits and insights.

## 🛠️ Technical Stack

- **Frontend:** React 19, Tailwind CSS, Lucide React, React Router 7.
- **Backend/Database:** Supabase (PostgreSQL) with Row-Level Security (RLS).
- **AI/ML:** Anthropic SDK (Claude) for medical reasoning, Deepgram for speech-to-text.
- **State Management:** React Context API and custom hooks for real-time transcription.
- **Design System:** "The Clinical Sanctuary"—A custom, high-end editorial design system focused on "Soft Medical" aesthetics to reduce patient anxiety and improve doctor efficiency.

## 🏛️ Architecture & Security

MediBridge is built with a security-first approach:
- **Database Schema:** Robust PostgreSQL schema with migrations for family sharing, doctor addendums, and insight approval workflows.
- **Security:** Extensive Supabase RLS (Row-Level Security) policies ensure data privacy and HIPAA-compliant data access patterns.
- **Scalability:** Modular component architecture with a clear separation between data fetching, business logic (AI generation), and UI presentation.

## 📖 Design Philosophy

The project follows a unique "Soft Medical Editorial" design system. Moving away from sterile, rigid medical grids, MediBridge uses:
- **Tonal Layering:** Depth created through subtle background shifts rather than harsh borders.
- **Editorial Typography:** A dual-font approach (Manrope for headlines, Inter for data) to balance authority with readability.
- **Asymmetric Layouts:** Intentional whitespace to signal high-value information and reduce cognitive load.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Account & CLI

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/medibridge.git
   cd medibridge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with your Supabase and API credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_key
   DEEPGRAM_API_KEY=your_deepgram_key
   ```
4. Initialize Supabase:
   ```bash
   supabase start
   supabase db reset # This will apply all migrations and seed data
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

---
*Built with a focus on human-centric healthcare and AI-assisted clinical precision.*
