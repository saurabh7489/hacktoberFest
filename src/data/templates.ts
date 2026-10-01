import type { EmailTone, RecipientType, EmailIntent, EmailLength } from '../types';

export interface EmailTemplate {
  id: string;
  category: string;
  title: string;
  badge: string;
  description: string;
  tone: EmailTone;
  recipient: RecipientType;
  intent: EmailIntent;
  length: EmailLength;
  notes: string;
  keyPoints: string[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'deadline-extension',
    category: 'Workplace & Projects',
    title: 'Request Deadline Extension',
    badge: 'High Impact',
    description: 'Ask for more time on a project while demonstrating progress and accountability.',
    tone: 'Executive / Formal',
    recipient: 'Boss / Senior Executive',
    intent: 'Action Request / Ask',
    length: 'balanced',
    notes: 'Need an extra 3 days on the Q3 Marketing Analysis report due to delayed third-party audit data. 70% already completed.',
    keyPoints: [
      'Current completion status: 70% completed',
      'Reason: Third-party analytics export arrived 48 hours late',
      'Proposed new submission date: Thursday by 5 PM EST',
      'Willing to share preliminary draft today if helpful',
    ],
  },
  {
    id: 'unresponsive-followup',
    category: 'Sales & Client',
    title: 'Follow Up with Unresponsive Client',
    badge: 'Sales',
    description: 'Politely bump an unanswered proposal without sounding needy or aggressive.',
    tone: 'Direct & Concise',
    recipient: 'Client / Customer',
    intent: 'Gentle Reminder / Follow-up',
    length: 'concise',
    notes: 'Sent proposal 6 days ago regarding the cloud migration plan. Checking if they reviewed it or have questions.',
    keyPoints: [
      'Refer to proposal sent on Thursday',
      'Acknowledge busy schedule',
      'Offer 10-minute low-friction walkthrough',
      'Confirm if Q4 kickoff timeline is still the target',
    ],
  },
  {
    id: 'graceful-decline',
    category: 'Professional Boundaries',
    title: 'Gracefully Decline Request or Project',
    badge: 'Diplomacy',
    description: 'Say no politely while maintaining great rapport and protecting your bandwidth.',
    tone: 'Diplomatic & Tactful',
    recipient: 'Colleague / Team Member',
    intent: 'Declining / Saying No',
    length: 'balanced',
    notes: 'Colleague asked me to lead the upcoming internal workshop committee. Currently committed to product launch.',
    keyPoints: [
      'Express genuine gratitude for the invite and recognition',
      'Direct reason: Core bandwidth allocated to upcoming v2.0 product launch',
      'Offer alternative: Can review agenda or recommend Sarah from design team',
      'Wish great success for the session',
    ],
  },
  {
    id: 'salary-review',
    category: 'Career & HR',
    title: 'Request Salary & Compensation Review',
    badge: 'Career',
    description: 'Propose a meeting to review compensation based on expanded scope and performance.',
    tone: 'Executive / Formal',
    recipient: 'Boss / Senior Executive',
    intent: 'Meeting Scheduling / Recap',
    length: 'balanced',
    notes: 'Exceeded revenue targets by 24% and led cross-department onboarding. Want to schedule a formal compensation review.',
    keyPoints: [
      'Accomplishment: Surpassed annual quota by 24%',
      'Took on leadership of cross-functional team onboarding',
      'Request 30-minute discussion ahead of annual planning cycle',
      'Will prepare brief achievement portfolio for review',
    ],
  },
  {
    id: 'post-interview-thankyou',
    category: 'Job Search',
    title: 'Post-Interview Thank You & Next Steps',
    badge: 'Recruiting',
    description: 'Reinforce strong fit, reference a specific topic discussed, and ask about next steps.',
    tone: 'Friendly & Warm',
    recipient: 'Job Recruiter / Hiring Manager',
    intent: 'Thank You & Appreciation',
    length: 'balanced',
    notes: 'Interviewed today for Senior Product Manager role. Enjoyed discussion on scaling customer onboarding automation.',
    keyPoints: [
      'Thank interview panel for their time and insights',
      'Mention excitement regarding the onboarding automation initiative',
      'Reiterate relevant experience scaling similar B2B SaaS flows',
      'Inquire about anticipated timeline for next stage',
    ],
  },
  {
    id: 'apology-service-issue',
    category: 'Client & Customer Service',
    title: 'Apology & Service Recovery',
    badge: 'Customer Care',
    description: 'Take ownership of a disruption or delay with empathy, root cause, and remediation.',
    tone: 'Apologetic & Empathetic',
    recipient: 'Client / Customer',
    intent: 'Apology & Issue Resolution',
    length: 'balanced',
    notes: 'Our reporting dashboard experienced 4 hours downtime yesterday during their monthly closing.',
    keyPoints: [
      'Sincere apology for the unexpected disruption during critical close period',
      'Root cause: Database failover latency during maintenance window',
      'Immediate action taken: Permanent cluster capacity expanded',
      'Offering 15% credit on this month invoice and scheduled check-in call',
    ],
  },
  {
    id: 'cold-outreach-partnership',
    category: 'Business Development',
    title: 'Strategic Partnership Cold Outreach',
    badge: 'Growth',
    description: 'High-conversion cold email offering mutual value with zero spam vibe.',
    tone: 'Persuasive & Sales',
    recipient: 'Prospective Client / Lead',
    intent: 'Cold Outreach / Pitch',
    length: 'concise',
    notes: 'Reaching out to Head of Partnerships at FinTech startup to propose integrating our automated verification API.',
    keyPoints: [
      'Specific compliment on their recent Series A expansion',
      'Identified mutual benefit: Cut user KYC drop-off by 35%',
      'Low friction CTA: 10-minute exploratory chat or async deck',
    ],
  },
  {
    id: 'urgent-blocker-escalation',
    category: 'Workplace & Projects',
    title: 'Urgent Blocker Escalation',
    badge: 'Action-First',
    description: 'Flag critical dependencies or blocked tasks needing immediate executive decision.',
    tone: 'Urgent & Action-Oriented',
    recipient: 'Boss / Senior Executive',
    intent: 'Action Request / Ask',
    length: 'concise',
    notes: 'Security vendor has not delivered audit signoff; sprint deployment scheduled for tomorrow 9 AM.',
    keyPoints: [
      'Critical blocker: Missing vendor audit approval',
      'Impact: Launch tomorrow morning at risk',
      'Decision needed: Authorize emergency vendor escalation or approve 24hr rollout delay',
      'Available for emergency huddle at 2:00 PM',
    ],
  },
];
