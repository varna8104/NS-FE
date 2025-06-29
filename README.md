# NS-FE (NyayaSathi Frontend)

A modern Next.js frontend application for the NyayaSathi legal assistance platform.

## Features

- **Modern UI/UX**: Built with Next.js 15 and Tailwind CSS
- **Responsive Design**: Mobile-first approach with smooth animations
- **Legal Chatbot**: AI-powered legal assistance
- **Complaint Management**: Submit and track legal complaints
- **Document Upload**: Upload and summarize legal documents
- **User Authentication**: Secure login and registration system

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/varna8104/NS-FE.git
cd NS-FE
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── components/      # Reusable components
│   ├── complaints/      # Complaint management pages
│   ├── legal-chatbot/   # Chatbot interface
│   ├── login/          # Authentication pages
│   ├── register/       # User registration
│   ├── submit-complaint/ # Complaint submission
│   ├── summarize-legal-doc/ # Document processing
│   └── upload/         # File upload functionality
└── utils/              # Utility functions
    └── api.js          # API configuration
```

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for:

- Build commands
- Output directory
- Environment variables
- Framework detection

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (set in Vercel dashboard)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is part of the NyayaSathi legal assistance platform.
