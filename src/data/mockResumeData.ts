import { ParsedResume, TargetJobPreset, FeatureItem } from '../types';

export const SAMPLE_JOB_PRESETS: TargetJobPreset[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack & AI Engineer',
    company: 'Stripe, Scale AI, Vercel',
    level: 'Senior / Staff (5+ yrs)',
    requiredSkills: ['Next.js', 'TypeScript', 'Vector Databases', 'Python', 'Tailwind CSS', 'System Architecture', 'CI/CD Pipelines'],
    salaryRange: '$180k - $240k'
  },
  {
    id: 'job-2',
    title: 'Lead Frontend Architect',
    company: 'Linear, Figma, Notion',
    level: 'Staff (6+ yrs)',
    requiredSkills: ['React 19', 'TypeScript', 'Web Performance', 'Micro-Frontends', 'Tailwind CSS', 'State Machines', 'Design Systems'],
    salaryRange: '$190k - $260k'
  },
  {
    id: 'job-3',
    title: 'Senior Product Manager (AI & SaaS)',
    company: 'OpenAI, Anthropic, Datadog',
    level: 'Senior (4+ yrs)',
    requiredSkills: ['Product Strategy', 'LLM Integration', 'Cohort Analysis', 'A/B Testing', 'PLG Growth', 'User Research', 'SQL'],
    salaryRange: '$175k - $230k'
  }
];

export const SAMPLE_RESUMES: Record<string, ParsedResume> = {
  'sample-candidate': {
    id: 'sample-candidate',
    name: 'Candidate Profile',
    targetRole: 'Senior Full Stack & AI Engineer',
    experienceLevel: 'Senior (5.5 yrs)',
    currentCompany: 'Apex Cloud Systems',
    summary: 'Full-stack software engineer with 5+ years of production experience building high-throughput cloud infrastructure and LLM-powered SaaS applications. Specialized in TypeScript, React, Python, and scalable distributed microservices.',
    atsScore: 88,
    matchPercentage: 92,
    metricsScore: 84,
    brevityScore: 95,
    actionVerbScore: 90,
    skills: [
      'React 19', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'PostgreSQL', 
      'Pinecone / Vector DB', 'Tailwind CSS', 'Docker', 'AWS Lambda', 'GraphQL', 'Redis'
    ],
    education: 'B.S. in Computer Science — University of Washington (3.8 GPA)',
    bullets: [
      {
        id: 'b-1',
        original: 'Worked on database queries and improved speed for our search API.',
        optimized: 'Engineered Redis caching layer and indexed Postgres schemas, slashing API query response times by 48% across 3.2M daily requests.',
        improvementCategory: 'Quantifiable Metrics',
        scoreImpact: 6,
        isAccepted: false,
        explanation: 'Replaced vague "worked on" with power verb "Engineered" and introduced concrete latency and throughput telemetry metrics.'
      },
      {
        id: 'b-2',
        original: 'Helped implement an AI chatbot feature for our customer support team to save time.',
        optimized: 'Architected LLM retrieval-augmented generation (RAG) pipeline using Pinecone and GPT-4o, deflecting 41% of tier-1 support tickets and saving 180+ engineering hours/month.',
        improvementCategory: 'ATS Keywords',
        scoreImpact: 8,
        isAccepted: true,
        explanation: 'Injected high-demand recruiter keywords ("RAG", "Pinecone", "GPT-4o") with quantifiable ROI statistics.'
      },
      {
        id: 'b-3',
        original: 'Led weekly sprint planning and collaborated with product managers on new releases.',
        optimized: 'Spearheaded Agile sprint rituals for 8 cross-functional engineers, accelerating quarterly release velocity by 30% with zero critical regressions.',
        improvementCategory: 'Action Verbs',
        scoreImpact: 5,
        isAccepted: false,
        explanation: 'Elevated passive collaboration into quantifiable leadership impact with clear velocity metrics.'
      },
      {
        id: 'b-4',
        original: 'Created frontend UI components using React and Tailwind for user dashboards.',
        optimized: 'Designed and deployed accessible 40+ component design system in React 19 and Tailwind CSS, reducing frontend cycle time by 35% across 4 squad teams.',
        improvementCategory: 'Clarity & Brevity',
        scoreImpact: 4,
        isAccepted: false,
        explanation: 'Quantified component count and cross-team adoption impact.'
      }
    ],
    keywords: [
      { keyword: 'TypeScript', category: 'Technical', foundInResume: true, matchScore: 100, importance: 'Critical', frequency: 7 },
      { keyword: 'React 19 / Next.js', category: 'Technical', foundInResume: true, matchScore: 98, importance: 'Critical', frequency: 5 },
      { keyword: 'Vector Databases (RAG)', category: 'Technical', foundInResume: true, matchScore: 94, importance: 'Critical', frequency: 3 },
      { keyword: 'System Architecture', category: 'Technical', foundInResume: true, matchScore: 88, importance: 'Critical', frequency: 2 },
      { keyword: 'Distributed Systems', category: 'Technical', foundInResume: false, matchScore: 0, importance: 'Recommended', frequency: 0 },
      { keyword: 'Kubernetes / K8s', category: 'Technical', foundInResume: false, matchScore: 0, importance: 'Recommended', frequency: 0 },
      { keyword: 'Cross-functional Leadership', category: 'Leadership', foundInResume: true, matchScore: 92, importance: 'Recommended', frequency: 4 },
      { keyword: 'A/B Experimentation', category: 'Domain', foundInResume: false, matchScore: 0, importance: 'Bonus', frequency: 0 },
      { keyword: 'CI/CD Pipelines', category: 'Technical', foundInResume: true, matchScore: 90, importance: 'Recommended', frequency: 2 }
    ],
    sections: [
      {
        name: 'Professional Summary',
        score: 92,
        status: 'optimal',
        feedback: 'Clear, concise 3-line elevator pitch with relevant tech stack and years of seniority.',
        tips: ['Highlight 1 specific landmark achievement in line 2.']
      },
      {
        name: 'Work Experience',
        score: 84,
        status: 'warning',
        feedback: 'Strong technical scope, but 2 bullet points still lack quantifiable business impact metrics.',
        tips: [
          'Add percentage revenue or cost-saving metrics to role #2.',
          'Start every bullet with distinct Tier-1 action verbs (e.g., Spearheaded, Architected, Overhauled).'
        ]
      },
      {
        name: 'Technical Skills & Tools',
        score: 96,
        status: 'optimal',
        feedback: 'Well-structured categorical taxonomy matching modern AI & SaaS ATS scanners.',
        tips: ['Include cloud certification (AWS Solutions Architect) if available.']
      },
      {
        name: 'Education & Credentials',
        score: 90,
        status: 'optimal',
        feedback: 'Concise, clean formatting with degree, honors, and accredited institution.',
        tips: ['Keep at bottom of resume for senior candidates.']
      }
    ]
  },
  'sarah-chen': {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    targetRole: 'Lead Frontend Architect',
    experienceLevel: 'Staff (6 yrs)',
    currentCompany: 'Nova Interactive',
    summary: 'Frontend Architect specialized in high-performance web applications, modern micro-frontends, and design systems. Track record of scaling React/TypeScript ecosystems to 5M+ monthly active users.',
    atsScore: 91,
    matchPercentage: 95,
    metricsScore: 92,
    brevityScore: 94,
    actionVerbScore: 93,
    skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Turborepo', 'Web Vitals', 'Wasm', 'Jest / Playwright'],
    education: 'B.S. in Software Engineering — UC Berkeley',
    bullets: [
      {
        id: 'sc-1',
        original: 'Rewrote legacy JavaScript code into modern TypeScript and cleaned up packages.',
        optimized: 'Migrated 140k-line legacy codebase to strict TypeScript 5 and monorepo structure, reducing runtime production exceptions by 64%.',
        improvementCategory: 'Quantifiable Metrics',
        scoreImpact: 7,
        isAccepted: true,
        explanation: 'Provides exact scope (140k lines) and measurable quality improvement (-64% exceptions).'
      },
      {
        id: 'sc-2',
        original: 'Made web pages load much faster for mobile users.',
        optimized: 'Optimized Core Web Vitals (LCP & CLS) via server streaming and dynamic bundling, boosting Mobile PageSpeed from 42 to 98 and checkout conversions by +18%.',
        improvementCategory: 'Quantifiable Metrics',
        scoreImpact: 9,
        isAccepted: false,
        explanation: 'Directly ties technical web optimization to business revenue metrics.'
      }
    ],
    keywords: [
      { keyword: 'React 19 / Next.js', category: 'Technical', foundInResume: true, matchScore: 100, importance: 'Critical', frequency: 8 },
      { keyword: 'Design Systems', category: 'Technical', foundInResume: true, matchScore: 96, importance: 'Critical', frequency: 4 },
      { keyword: 'Web Performance / Core Web Vitals', category: 'Technical', foundInResume: true, matchScore: 95, importance: 'Critical', frequency: 3 },
      { keyword: 'Micro-Frontends', category: 'Technical', foundInResume: true, matchScore: 90, importance: 'Recommended', frequency: 2 },
      { keyword: 'State Machines (XState)', category: 'Technical', foundInResume: false, matchScore: 0, importance: 'Bonus', frequency: 0 }
    ],
    sections: [
      {
        name: 'Professional Summary',
        score: 95,
        status: 'optimal',
        feedback: 'Excellent alignment with Staff-level technical leadership roles.',
        tips: []
      },
      {
        name: 'Work Experience',
        score: 91,
        status: 'optimal',
        feedback: 'Rich in business ROI, Core Web Vitals statistics, and team mentorship achievements.',
        tips: []
      },
      {
        name: 'Technical Skills',
        score: 94,
        status: 'optimal',
        feedback: 'Modern web stack keywords accurately aligned with Tier-1 recruiters.',
        tips: []
      }
    ]
  }
};

export const FEATURES_LIST: FeatureItem[] = [
  {
    id: 'f-1',
    title: 'ATS Score',
    description: 'Instant algorithmic audit calibrated for Workday, Greenhouse, and Lever ATS systems with 0-100 scoring breakdown.',
    iconName: 'ShieldCheck',
    tag: 'ATS 99.4% Pass Rate',
    isOrangeHighlight: true,
    stats: 'Scored in 1.8s'
  },
  {
    id: 'f-2',
    title: 'Resume Rewrite',
    description: 'Transform weak bullet points into high-impact Google XYZ formula achievements with quantifiable metrics and action verbs.',
    iconName: 'Sparkles',
    tag: 'Quantifiable ROI',
    isOrangeHighlight: false,
    stats: '+38% Impact Score'
  },
  {
    id: 'f-3',
    title: 'AI Chat',
    description: 'Interactive semantic RAG assistant to answer recruiter questions, extract proof points, and tailor summaries in real-time.',
    iconName: 'Bot',
    tag: 'RAG Semantic Search',
    isOrangeHighlight: false,
    stats: 'Instant Q&A'
  },
  {
    id: 'f-4',
    title: 'Job Match',
    description: 'Paste any target job description to pinpoint missing critical keywords, required tech stack gaps, and recruiter priorities.',
    iconName: 'Target',
    tag: 'Keyword Gap Diff',
    isOrangeHighlight: true,
    stats: 'Real-time Diff'
  },
  {
    id: 'f-5',
    title: 'Recruiter Heatmap',
    description: 'Simulate the 6-second recruiter gaze pattern across your resume layout to ensure high-priority metrics grab attention first.',
    iconName: 'Eye',
    tag: '6-Second Scan',
    isOrangeHighlight: false,
    stats: 'Visual Heatmap'
  },
  {
    id: 'f-6',
    title: 'Clean Multi-Format Export',
    description: 'Export pristine ATS-safe PDF, clean Plain Text for recruiter auto-parsers, and formatted Markdown without formatting bugs.',
    iconName: 'Download',
    tag: 'ATS-Safe Formatting',
    isOrangeHighlight: true,
    stats: '1-Click Export'
  }
];
