/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Educational Content, Videos, Quizzes & Reward Configurations
 */

const LEARNING_CONTENT = {
  // ==========================================
  // ROOM 1 KNOWLEDGE BOXES
  // ==========================================
  1: {
    id: 1,
    boxName: 'Knowledge Box 01',
    boxLocation: 'Table Secret Drawer',
    videoTitle: 'How close are you with an entrepreneurial mindset?',
    videoTopic: 'deAsra inspireLIFE • Core Entrepreneurial Drive',
    videoDuration: 10,
    videoSummary: 'Entrepreneurship is not just starting a venture; it is a creative stance towards problems, viewing obstacles as puzzle invitations.',
    quiz: [
      {
        question: 'When faced with a sudden, difficult challenge, you usually:',
        options: [
          'Look for someone else to solve it',
          'Avoid it until it goes away',
          'Break it down and start figuring out what can be done',
          'Get excited about cracking it creatively'
        ],
        correct: [2, 3], // Multiple valid growth choices
        explanation: 'Entrepreneurs take proactive initiative by breaking obstacles into actionable steps and applying creative thinking.'
      },
      {
        question: 'You come across a persistent problem in your college/workplace/community. What is your reaction?',
        options: [
          'Complain about it on social media',
          'Ignore it, thinking it is not your job',
          'Try to think of a temporary quick fix',
          'Start thinking: "What if I solved it in a better, permanent way?"'
        ],
        correct: [3],
        explanation: 'Opportunity recognition begins with asking "What if I solved it better?" rather than passive acceptance.'
      },
      {
        question: 'How do you honestly perceive failure during an experiment?',
        options: [
          'I avoid it at all costs',
          'It completely demotivates me for a long time',
          'I accept it passively and move on',
          'I try to extract the lesson and come back stronger'
        ],
        correct: [3],
        explanation: 'A resilient growth mindset treats failure as actionable feedback that fuels future breakthroughs.'
      }
    ],
    reward: {
      id: 'painting_piece_1',
      name: 'Painting Piece 1 (The Spark)',
      icon: '🧩',
      type: 'painting_piece',
      desc: 'The first missing canvas fragment, glowing with creative inspiration.'
    },
    xpAward: 150
  },

  2: {
    id: 2,
    boxName: 'Knowledge Box 02',
    boxLocation: 'Bookshelf Secret Steel Safe',
    videoTitle: '1.2. Personal Finance Snapshot — "Your Money Story So Far"',
    videoTopic: 'Financial Awareness & Capital Mindfulness',
    videoDuration: 10,
    videoSummary: 'Every venture starts with personal financial discipline. Knowing where money flows gives you the runway to build without desperation.',
    quiz: [
      {
        question: 'When you want to start something new and impactful, you tend to:',
        options: [
          'Wait for the perfect time or someone to push me',
          'Overthink until the moment passes',
          'Do basic research and give it a preliminary try',
          'Start small immediately and learn along the way'
        ],
        correct: [2, 3],
        explanation: 'Starting with small, low-risk pilots builds momentum and provides real-world feedback faster than waiting for perfection.'
      },
      {
        question: 'When you hear the word "entrepreneur", what comes to mind first?',
        options: [
          'Big billionaire corporations and luxury',
          'A risky life with no stability or guarantees',
          'Someone who builds and manages things',
          'Someone who creates value and finds smart ways to solve problems'
        ],
        correct: [3],
        explanation: 'True entrepreneurship is the art of value creation: identifying human needs and building sustainable solutions.'
      }
    ],
    reward: {
      id: 'painting_piece_2',
      name: 'Painting Piece 2 (The Blueprint)',
      icon: '🧩',
      type: 'painting_piece',
      desc: 'The second canvas fragment, depicting structured financial discipline.'
    },
    extraReward: {
      id: 'mysterious_note_time',
      name: 'Mysterious Note',
      icon: '📜',
      type: 'clue_note',
      desc: '"Three have passed, One more to soar. Only then, Time opens the door." (Clue: 4:00)'
    },
    xpAward: 150
  },

  3: {
    id: 3,
    boxName: 'Knowledge Box 03',
    boxLocation: 'Wall Clock Hidden Compartment',
    videoTitle: '1.3. What Do You Want People to Remember About You?',
    videoTopic: 'Personal Branding & Lasting Value',
    videoDuration: 10,
    videoSummary: 'Your brand is not your logo; it is the trust and distinct value you deliver when you enter and leave a room.',
    quiz: [
      {
        question: 'Do you regularly set small milestone goals and track your progress?',
        options: [
          'Rarely or never',
          'Only when forced by an external deadline',
          'Yes, I make an active effort to track them',
          'Yes, I love structuring and celebrating small wins'
        ],
        correct: [2, 3],
        explanation: 'Consistent goal-tracking transforms abstract ambitions into measurable weekly progress.'
      },
      {
        question: 'How comfortable are you with actively asking for help or constructive feedback?',
        options: [
          'I find it uncomfortable and usually avoid it',
          'I avoid it unless it is an absolute emergency',
          'I seek it when I genuinely need clarity',
          'I actively invite input from mentors to grow faster'
        ],
        correct: [2, 3],
        explanation: 'Leveraging feedback loops accelerates learning and protects you from blind spots.'
      }
    ],
    reward: {
      id: 'painting_piece_3',
      name: 'Painting Piece 3 (The Horizon)',
      icon: '🧩',
      type: 'painting_piece',
      desc: 'The third and final canvas piece. The painting can now be restored on Wall 3!'
    },
    xpAward: 150
  },

  // ==========================================
  // SPECIALIZED ROOMS KNOWLEDGE BOXES (2-5)
  // ==========================================
  4: {
    id: 4,
    boxName: 'Knowledge Box 04',
    boxLocation: 'Opportunity Matrix Wall (Room 2)',
    videoTitle: 'The Growth Mindset: Transforming Friction into Opportunity',
    videoTopic: 'Room 2: Entrepreneurial Mindset',
    videoDuration: 10,
    videoSummary: 'Cultivate intellectual curiosity, embrace ambiguity, and build high-conviction decision habits.',
    quiz: [
      {
        question: 'Which habit is most crucial for developing an opportunity-spotting mindset?',
        options: [
          'Waiting for proven market trends before acting',
          'Observing daily consumer frustrations and asking "How might we..."',
          'Copying existing business models without alteration',
          'Relying solely on intuition without gathering customer data'
        ],
        correct: [1],
        explanation: 'Curious inquiry into daily customer pain points is the primary engine of genuine breakthrough innovation.'
      }
    ],
    reward: {
      id: 'mindset_key',
      name: 'Mindset Mastery Emblem',
      icon: '🔑',
      type: 'room_key',
      desc: 'Proof of mastering the resilient entrepreneurial mindset.'
    },
    xpAward: 200
  },

  5: {
    id: 5,
    boxName: 'Knowledge Box 05',
    boxLocation: 'Vault Matrix (Room 3)',
    videoTitle: 'Personal Finance & Capital Allocation for Founders',
    videoTopic: 'Room 3: Personal Finance Management',
    videoDuration: 10,
    videoSummary: 'Mastering the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings/Investments for sustained freedom.',
    quiz: [
      {
        question: 'Under the standard 50/30/20 financial rule, what does the 20% represent?',
        options: [
          'Discretionary luxury spending',
          'Emergency savings, investments, and debt reduction',
          'Office rent and utilities',
          'Marketing budget for experimental campaigns'
        ],
        correct: [1],
        explanation: 'Allocating 20% to emergency savings and investments provides personal stability and venture runway.'
      }
    ],
    reward: {
      id: 'finance_key',
      name: 'Financial Vault Emblem',
      icon: '🔑',
      type: 'room_key',
      desc: 'Proof of mastering financial discipline and cash flow awareness.'
    },
    xpAward: 200
  },

  6: {
    id: 6,
    boxName: 'Knowledge Box 06',
    boxLocation: 'Identity Mirror (Room 4)',
    videoTitle: 'Crafting Your Authentic Professional Reputation',
    videoTopic: 'Room 4: Personal Branding',
    videoDuration: 10,
    videoSummary: 'Your brand is the intersection of your unique strengths, reliability, and the clear problem you solve for others.',
    quiz: [
      {
        question: 'What is the most effective foundation for an authentic personal brand?',
        options: [
          'Posting viral content regardless of relevance',
          'Delivering consistent value in your specific domain and building trust',
          'Exaggerating accomplishments to impress investors',
          'Mirroring competitors completely'
        ],
        correct: [1],
        explanation: 'Authentic personal brands are anchored in consistent execution, integrity, and distinct problem-solving capability.'
      }
    ],
    reward: {
      id: 'branding_key',
      name: 'Branding Studio Emblem',
      icon: '🔑',
      type: 'room_key',
      desc: 'Proof of mastering personal identity and professional presence.'
    },
    xpAward: 200
  },

  7: {
    id: 7,
    boxName: 'Knowledge Box 07',
    boxLocation: 'Innovation Circuit (Room 5)',
    videoTitle: 'From Problem Definition to Scalable Solution Architecture',
    videoTopic: 'Room 5: Problem Solving & Idea Generation',
    videoDuration: 10,
    videoSummary: 'Great entrepreneurs do not fall in love with their initial idea; they fall in love with understanding the customer problem deeply.',
    quiz: [
      {
        question: 'What is the first step in effective business idea generation?',
        options: [
          'Building a complex website immediately',
          'Deeply understanding customer pain points and validating the need',
          'Hiring a full marketing agency',
          'Applying for large loans before talking to users'
        ],
        correct: [1],
        explanation: 'Problem validation ensures you are creating a product people genuinely want and need.'
      }
    ],
    reward: {
      id: 'innovation_key',
      name: 'Master Innovation Emblem',
      icon: '👑',
      type: 'room_key',
      desc: 'The ultimate emblem of full entrepreneurial mastery across all 5 chambers.'
    },
    xpAward: 250
  }
};

window.LEARNING_CONTENT = LEARNING_CONTENT;
