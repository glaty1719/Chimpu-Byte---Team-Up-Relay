export type GateType = 'human' | 'ai' | 'team';
export type GateLeader = 'chimpu' | 'byte' | 'team';

export interface GateTask {
    id: string;
    level: number;
    title: string;
    description: string;
    iconKey: string;
    gateType: GateType;
    correctLeader: GateLeader;
    requiredSequence?: ('byte' | 'chimpu')[];
    decisionTimeSeconds: number;
    hint: string;
    educationalReason: string;
    chimpuRole?: string;
    byteRole?: string;
}

export interface LevelConfig {
    levelNumber: number;
    title: string;
    subtitle: string;
    description: string;
    tasks: GateTask[];
    badgeKey: string;
    badgeName: string;
    badgeDescription: string;
}

export const GAME_LEVELS: LevelConfig[] = [
    {
        levelNumber: 1,
        title: "Level 1: Pick the Leader",
        subtitle: "Compare Human & AI Strengths",
        description: "Choose whether Chimpu (Human) or Byte (AI) is best suited to lead each task.",
        badgeKey: "badge_level_1",
        badgeName: "Strengths Explorer",
        badgeDescription: "Mastered recognizing foundational AI and Human strengths!",
        tasks: [
            // AI-led tasks
            {
                id: "l1_t1_files",
                level: 1,
                title: "Sort Hundreds of Files",
                description: "Organize 10,000 documents into folders in seconds.",
                iconKey: "icon_file_sorting",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 4.0,
                hint: "AI processes huge datasets and repetitive sorting at lightning speed!",
                educationalReason: "AI excels at rapid data processing, indexing, and high-volume sorting."
            },
            {
                id: "l1_t2_calc",
                level: 1,
                title: "Calculate a Large Total",
                description: "Sum up millions of numbers instantly without error.",
                iconKey: "icon_calculator",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 4.0,
                hint: "Computers can compute complex calculations instantly!",
                educationalReason: "AI and computing systems calculate large equations with perfect speed and accuracy."
            },
            {
                id: "l1_t3_pattern",
                level: 1,
                title: "Find a Repeated Pattern",
                description: "Detect hidden geometric patterns across millions of pixels.",
                iconKey: "icon_pattern",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 4.0,
                hint: "AI is built to scan massive sequences and detect recurring patterns.",
                educationalReason: "Pattern recognition across large datasets is a core strength of AI models."
            },
            {
                id: "l1_t4_images",
                level: 1,
                title: "Search Many Images",
                description: "Scan thousands of photos to find matching visual tags.",
                iconKey: "icon_image_search",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 4.0,
                hint: "Searching through giant visual databases is an AI superpower.",
                educationalReason: "Computer vision allows AI to scan and match image features in milliseconds."
            },
            {
                id: "l1_t5_routes",
                level: 1,
                title: "Compare Several Routes",
                description: "Analyze 50 different road options to find the fastest travel time.",
                iconKey: "icon_route",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 4.0,
                hint: "AI calculates traffic, distance, and optimal path variations.",
                educationalReason: "AI algorithms can rapidly compute and compare numerous mathematical combinations."
            },
            // Human-led tasks
            {
                id: "l1_t6_comfort",
                level: 1,
                title: "Comfort a Sad Friend",
                description: "Listen empathetically to a classmate who is having a tough day.",
                iconKey: "icon_comfort_friend",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 4.0,
                hint: "Empathy, emotional warmth, and true care come from humans.",
                educationalReason: "Humans bring genuine empathy, personal connection, and compassion."
            },
            {
                id: "l1_t7_fairness",
                level: 1,
                title: "Decide What Is Fair",
                description: "Resolve a playground disagreement with empathy and justice.",
                iconKey: "icon_fairness",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 4.0,
                hint: "Understanding context, ethics, and moral values requires human judgment.",
                educationalReason: "Moral judgment, fairness, and ethical values belong to human decision makers."
            },
            {
                id: "l1_t8_memory",
                level: 1,
                title: "Share a Personal Memory",
                description: "Tell a real story about your family holiday or childhood.",
                iconKey: "icon_memory",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 4.0,
                hint: "Real-life personal experiences and memories belong to people.",
                educationalReason: "Only living humans experience genuine personal memories and feelings."
            },
            {
                id: "l1_t9_goal",
                level: 1,
                title: "Choose a Personal Goal",
                description: "Decide what passion or skill you want to master this year.",
                iconKey: "icon_goal",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 4.0,
                hint: "Your hopes, dreams, and personal aspirations are yours to decide.",
                educationalReason: "Humans set their own meaningful life goals, passions, and purpose."
            },
            {
                id: "l1_t10_responsibility",
                level: 1,
                title: "Take Responsibility",
                description: "Own an important decision and guide the team ethically.",
                iconKey: "icon_responsibility",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 4.0,
                hint: "Humans are accountable and responsible for final outcomes.",
                educationalReason: "Humans remain accountable and responsible for important choices and leadership."
            }
        ]
    },
    {
        levelNumber: 2,
        title: "Level 2: Strength Switch",
        subtitle: "AI Assistance & Human Verification",
        description: "AI can generate quickly, but humans must check, verify, and decide!",
        badgeKey: "badge_level_2",
        badgeName: "Smart Verifier",
        badgeDescription: "Understood AI limitations and the vital need for human checking!",
        tasks: [
            {
                id: "l2_t1_ai_story",
                level: 2,
                title: "AI-Generated Story",
                description: "Byte drafted a quick story. Who checks for accuracy and edits the story?",
                iconKey: "icon_story_check",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 3.2,
                hint: "Chimpu reviews the story to verify facts, feelings, and style.",
                educationalReason: "AI drafts text quickly, but humans must verify facts and polish creative meaning."
            },
            {
                id: "l2_t2_video_rec",
                level: 2,
                title: "Recommended Video",
                description: "Byte suggests an online video. Who checks if it is age-appropriate and safe?",
                iconKey: "icon_video_check",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 3.2,
                hint: "Humans evaluate safety, quality, and context for our community.",
                educationalReason: "Humans ensure content appropriateness, safety, and alignment with values."
            },
            {
                id: "l2_t3_hw_answer",
                level: 2,
                title: "Suggested Homework Answer",
                description: "Byte generated an answer. Who checks the reasoning to make sure it makes sense?",
                iconKey: "icon_homework_check",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 3.2,
                hint: "Always check AI suggestions before using them in your work!",
                educationalReason: "AI can make errors ('hallucinations'); humans must critically evaluate answers."
            },
            {
                id: "l2_t4_large_pattern",
                level: 2,
                title: "Large Pattern Search",
                description: "Scan millions of sensor data points to detect unusual vibrations.",
                iconKey: "icon_pattern",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 3.2,
                hint: "Byte excels at scanning massive data streams to spot micro-patterns.",
                educationalReason: "AI efficiently detects statistical patterns in vast volumes of sensor data."
            },
            {
                id: "l2_t5_data_sort",
                level: 2,
                title: "Large Data Sorting Task",
                description: "Categorize 50,000 science survey responses into structured tables.",
                iconKey: "icon_file_sorting",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 3.2,
                hint: "Byte organizes structured datasets effortlessly.",
                educationalReason: "Repetitive data categorization is completed rapidly and consistently by AI."
            },
            {
                id: "l2_t6_fact_check",
                level: 2,
                title: "Fact-Check a News Claim",
                description: "Evaluate source credibility and decide if the information is trustworthy.",
                iconKey: "icon_responsibility",
                gateType: "human",
                correctLeader: "chimpu",
                decisionTimeSeconds: 3.2,
                hint: "Critical thinking, verifying reliable sources, and truth require human discernment.",
                educationalReason: "Humans apply critical thinking to assess credibility and trustworthy sources."
            },
            {
                id: "l2_t7_speed_calc",
                level: 2,
                title: "High-Speed Formula Computation",
                description: "Process 100,000 mathematical physics equations per second.",
                iconKey: "icon_calculator",
                gateType: "ai",
                correctLeader: "byte",
                decisionTimeSeconds: 3.2,
                hint: "Raw numerical computations belong to AI and computer processing.",
                educationalReason: "Computers compute complex mathematical simulations at superhuman speeds."
            }
        ]
    },
    {
        levelNumber: 3,
        title: "Level 3: Team-Up Final",
        subtitle: "Collaborative Two-Step Sequences",
        description: "Combine Human & AI strengths in the right sequence to clear purple Team Gates!",
        badgeKey: "badge_level_3",
        badgeName: "Smart Team Captain",
        badgeDescription: "Orchestrated seamless Human + AI teamwork in perfect harmony!",
        tasks: [
            {
                id: "l3_t1_book",
                level: 3,
                title: "Book Recommendation",
                description: "Step 1: Recommend books based on topics\nStep 2: Choose the most meaningful read.",
                iconKey: "icon_story_check",
                gateType: "team",
                correctLeader: "team",
                requiredSequence: ['byte', 'chimpu'],
                decisionTimeSeconds: 4.5,
                byteRole: "Byte searches catalog & finds matching titles",
                chimpuRole: "Chimpu selects the book that touches the heart",
                hint: "First Byte recommends matching options, then Chimpu makes the final choice!",
                educationalReason: "AI filters vast choices rapidly; humans select what connects with their interests."
            },
            {
                id: "l3_t2_school_ans",
                level: 3,
                title: "Check a School Answer",
                description: "Step 1: Compute and analyze steps\nStep 2: Verify logic & understanding.",
                iconKey: "icon_homework_check",
                gateType: "team",
                correctLeader: "team",
                requiredSequence: ['byte', 'chimpu'],
                decisionTimeSeconds: 4.5,
                byteRole: "Byte calculates steps and checks formulas",
                chimpuRole: "Chimpu verifies the logic and learns the concept",
                hint: "First Byte calculates the solution, then Chimpu verifies the logic!",
                educationalReason: "AI provides calculation assistance, while humans verify comprehension."
            },
            {
                id: "l3_t3_safe_route",
                level: 3,
                title: "Plan a Safe Route",
                description: "Step 1: Compare traffic and road distance\nStep 2: Check safety and decide.",
                iconKey: "icon_route",
                gateType: "team",
                correctLeader: "team",
                requiredSequence: ['byte', 'chimpu'],
                decisionTimeSeconds: 4.5,
                byteRole: "Byte analyzes satellite traffic & shortcuts",
                chimpuRole: "Chimpu checks well-lit paths & makes final decision",
                hint: "First Byte calculates route metrics, then Chimpu decides the safest journey!",
                educationalReason: "AI optimizes travel metrics, while human judgment prioritizes personal safety."
            },
            {
                id: "l3_t4_create_story",
                level: 3,
                title: "Create an Illustrated Story",
                description: "Step 1: Choose core theme & emotional message\nStep 2: Generate visual style options.",
                iconKey: "icon_story_check",
                gateType: "team",
                correctLeader: "team",
                requiredSequence: ['chimpu', 'byte'],
                decisionTimeSeconds: 4.5,
                chimpuRole: "Chimpu writes the heart of the story & message",
                byteRole: "Byte renders colorful art variations to explore",
                hint: "First Chimpu defines the story's heart, then Byte renders art options!",
                educationalReason: "Human vision and storytelling drive the theme; AI assists with visual assets."
            },
            {
                id: "l3_t5_poster",
                level: 3,
                title: "Design a School Fair Poster",
                description: "Step 1: Generate varied design layout ideas\nStep 2: Edit text and choose the winner.",
                iconKey: "icon_image_search",
                gateType: "team",
                correctLeader: "team",
                requiredSequence: ['byte', 'chimpu'],
                decisionTimeSeconds: 4.5,
                byteRole: "Byte creates 10 creative layout drafts",
                chimpuRole: "Chimpu selects the best design & polishes message",
                hint: "First Byte drafts varied layouts, then Chimpu refines and chooses the winner!",
                educationalReason: "AI broadens exploration; human taste selects and finalizes the communication."
            },
            {
                id: "l3_t6_practice_quiz",
                level: 3,
                title: "Create Practice Questions",
                description: "Step 1: Set learning goals & topics\nStep 2: Produce diverse quiz question bank.",
                iconKey: "icon_calculator",
                gateType: "team",
                correctLeader: "team",
                requiredSequence: ['chimpu', 'byte'],
                decisionTimeSeconds: 4.5,
                chimpuRole: "Chimpu sets key lesson topics and curriculum goal",
                byteRole: "Byte generates 20 tailored practice math questions",
                hint: "First Chimpu defines what students need to learn, then Byte produces the practice drill!",
                educationalReason: "Human teachers define educational objectives; AI generates customized exercise drills."
            }
        ]
    }
];
