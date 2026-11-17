/* ==========================================================================
   TechNation 2027 — site content
   Every page renders from this file. The festival, event, rule, team and
   contact details below come from the official TechNation 2027 Event
   Brochure (Department of Computer Science, Shree Damodar College of
   Commerce & Economics, Margao, Goa).
   When backend.js is running, the dashboard (/admin/) becomes the source of
   truth for everything it manages (events, schedule, team, sponsors…).
   ========================================================================== */
window.TN = {
  fest: {
    name: "TechNation",
    theme: "Connect. Learn. Transform.",
    host: "National Level Tech-Fest",
    edition: "2027",
    start: "2027-01-08T09:00:00+05:30",
    end: "2027-01-09T18:00:00+05:30",
    // Teams must confirm participation at least one week before the fest.
    earlyBirdEnds: "2027-01-01T23:59:59+05:30",
    teamFee: 3000,                                // ₹ per team of 10–12 students; covers every event
    college: "Shree Damodar College of Commerce & Economics",
    department: "Department of Computer Science",
    trust: "Vidya Vikas Mandal",
    venue: "Shree Damodar Educational Campus, G R Kare Road, Tansor, Comba, Margao, Salcete, Goa 403601",
    venueShort: "Shree Damodar College, Margao",
    coords: "15.28° N · 73.96° E",                // Comba, Margao (approximate)
    email: "cs.sdcc@vvm.edu.in",
    phone: "+91 98221 67259",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Shree+Damodar+College+of+Commerce+%26+Economics%2C+Comba%2C+Margao%2C+Goa+403601",
    website: "https://technation.vercel.app",     // official event website
    collegeUrl: "https://damodarcollege.edu.in",  // college website
    brochureUrl: "",                              // PDF link; Brochure buttons appear once set
    socials: [
      { name: "Instagram", icon: "instagram", href: "https://www.instagram.com/damodar_college/" },
      { name: "College website", icon: "globe", href: "https://damodarcollege.edu.in" },
      { name: "Email", icon: "mail", href: "mailto:cs.sdcc@vvm.edu.in" },
    ],
  },

  // Event count is added automatically from the events below.
  stats: [
    { n: 2, suffix: "", label: "Days on campus" },
    { n: 4, suffix: "", label: "Event categories" },
    { n: 12, suffix: "", label: "Students per team" },
  ],

  // Words wrapped in *asterisks* light up in the accent colour as you scroll.
  about:
    "Emerging from its roots as *Spectra in 2011*, TechNation has grown into a premier *National IT Festival* showcasing creativity, skill and digital innovation. Hosted by the Department of Computer Science at Shree Damodar College, Margao, it unites the brightest minds in computing, design and technology for two days of *competitions, hackathons, design challenges, data quests and tech expressions*. From prompt to possibilities: *Connect. Learn. Transform.*",

  // Longer story paragraphs for the About page.
  story: [
    "TechNation is more than an event. It is a creative and collaborative ecosystem where students get real-world exposure, cross-institutional collaboration, and the leadership, teamwork and problem-solving skills that technology careers demand.",
    "The Department of Computer Science at Shree Damodar College of Commerce & Economics runs the fest with its student tech club, TechTrendz. The Department offers BCA (since 1997) and B.Voc. (Software Technologies, since 2019) with NASSCOM-aligned certifications, and holds MoUs with SSC NASSCOM, the Goa Technology Association, CodeMax, Umang Software and S. S. Technologies.",
    "Established in 1973 as the flagship institution of Vidya Vikas Mandal, the College is accredited with an 'A' Grade by NAAC and approved by UGC and AICTE. It pioneered Goa University's BCA, BBA (Financial Services) and M.Com. programmes.",
  ],

  verticals: [
    { title: "On-stage events", href: "events.html#on-stage", kind: "lecture", hue: 228, text: "TeamVerse, QBIT, Code-a-thon, Tech-Persona and Tech-Hire: pitch, perform and present in front of the judges." },
    { title: "Off-stage events", href: "events.html#off-stage", kind: "design", hue: 330, text: "Reel-O-Tech: capture Day 1 on campus and turn it into a reel that goes live on Instagram." },
    { title: "Lab events", href: "events.html#lab", kind: "code", hue: 190, text: "CodeRush, CineBytes, UXplorer, QueryQuest, AdCraft, PowerBit and CypherCell: build, debug, design and decode against the clock." },
    { title: "Gaming events", href: "events.html#gaming", kind: "gaming", hue: 280, text: "FIFA 24, Mortal Kombat 11 and RC Car Gaming: knockout brackets until one champion remains." },
    { title: "Overall champions", href: "events.html", kind: "spark", hue: 45, text: "Every event earns points. The team with the most points lifts the Overall Winner trophy at the valedictory." },
  ],

  /* ------------------------------------------------------------ events
     Per-event dates, times and venues were left blank in the brochure; the
     fest runs 8–9 January 2027 on campus. Fill the slots in the dashboard
     once the day-wise timetable is finalised. */
  // Shown as "Flagship events" on the home page, in this order (event ids).
  featured: ["code-a-thon", "tech-hire", "powerbit"],

  competitions: [
    /* ------------------------------------------------- off-stage */
    {
      id: "reel-o-tech", name: "Reel-O-Tech", cat: "Off-stage", kind: "design", hue: 330, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Reel Making Competition", rounds: "Shoot on Day 1 · Submit on Day 2", theme: "Glimpses of Day 1",
      date: "2027-01-09", time: "10:00", venue: "Within the campus",
      tagline: "Capture Day 1 on campus and turn it into a reel the whole fest will watch.",
      overview: "Participants must create an engaging reel video based on the glimpses of Day 1. The reel must be posted on your personal Instagram account, tagging the college's official account (@damodar_college), and must contain all the moments of Day 1 within the campus.",
      statement: "Shoot within the campus on 8 January and submit the finished reel on Day 2 (9 January) at 10 AM sharp.",
      rules: [
        "The reel should be shot within the campus.",
        "Aspect ratio 1.91:1 to 9:16; frame rate minimum 30 FPS.",
        "Resolution minimum 720 pixels; length 20–60 seconds.",
        "Reels must be original and creative, without any copyright violations.",
        "Participants are solely responsible for any plagiarism issues.",
        "The reel must be submitted on Day 2 at 10 AM sharp.",
        "The organising committee reserves the right to disqualify entries for lack of originality, plagiarism or failure to comply with the rules.",
      ],
      judging: [
        "Creativity: The reel must be creative and edited properly.",
        "Real captures: The reel should contain real moments of Day 1 and is judged on how well the shots are captured.",
      ],
      coordinators: [
        { name: "Ms. Pratistha Joshi", role: "Student coordinator", phone: "9321769043", email: "2508045.pratistha.sdcce@vvm.edu.in" },
        { name: "Mr. Sarth Shanbhag", role: "Faculty coordinator", phone: "9975388868", email: "sarth.shanbhag@vvm.edu.in" },
      ],
    },

    /* -------------------------------------------------- on-stage */
    {
      id: "teamverse", name: "TeamVerse", cat: "On-stage", kind: "spark", hue: 200, prize: 0, fee: 0,
      team: "All members in video · 1 at screening", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Digital Identity Showcase", rounds: "1 round · Video screening", theme: "Introduce your team, anonymously",
      date: "2027-01-08", time: "", venue: "",
      tagline: "The opening showcase: introduce your whole team in a 3–4 minute video, without revealing your college.",
      overview: "A creative yet technically driven introductory event that challenges teams to present their members and collective talents through a short digital video. It celebrates innovation, collaboration, storytelling and technical finesse while strictly maintaining institutional anonymity, and serves as the opening showcase of TechNation, setting the tone for creativity and excellence.",
      statement: "Through this video you need to introduce all the members of the team. Every team member appears in the video, and any one member must be present during the screening. Submit it through the provided submission link (Google Form) by the deadline stated in the brochure (13 January, 2:00 PM); a confirmation email follows by 14 January, 11:30 AM. If a video is rejected for identity disclosure, one final resubmission is permitted by 15 January, 2:00 PM. Missing the resubmission deadline results in zero marks.",
      rules: [
        "Only one video submission per team is allowed.",
        "The duration of the video should be 3–4 minutes per team; videos that run longer or shorter may be penalised or rejected.",
        "File name format: TeamVerse_Imaginary_Team_Name.mp4 (an imaginary team name such as Alpha, Beta, etc.).",
        "Accepted format MP4; maximum file size 200 MB.",
        "Recommended resolution 1080p (Full HD) and not less than 720p (HD); aspect ratio 16:9.",
        "Audio must be clear and audible, with no copyrighted background music unless royalty-free and acknowledged.",
        "The video must not show or mention your college name, logo, uniform or any branding. Any identity reveal leads to rejection.",
        "The video must be submitted only through the provided submission link, on or before the deadline.",
      ],
      judging: [
        "Team participation and time-duration compliance",
        "Creativity, originality and the overall impression created by the video",
        "Video quality, use of special effects and technical presentation",
      ],
      coordinators: [
        { name: "Ms. Adaa Shaikh", role: "Student coordinator", phone: "7745093223", email: "2408001.adaa.sdcce@vvm.edu.in" },
        { name: "Ms. Girija Gaonkar", role: "Faculty coordinator", phone: "8329038979", email: "girija.gaonkar@vvm.edu.in" },
      ],
    },
    {
      id: "qbit", name: "QBIT", cat: "On-stage", kind: "business", hue: 45, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Innovate & Pitch", rounds: "1 round · Pitch + mandatory Q&A", theme: "Technology-driven startup ideas",
      date: "", time: "", venue: "",
      tagline: "Pitch a technology-driven startup idea that solves a real societal, environmental or industry problem.",
      overview: "QBIT inspires undergraduate students to conceptualise, innovate and present technology-driven startup ideas that address contemporary societal, environmental and industry-specific challenges. Participants integrate advanced technological concepts and demonstrate critical thinking, feasibility and entrepreneurial insight in their pitch.",
      statement: "Prepare a structured 10–15 slide pitch deck covering: the problem statement; the proposed tech solution (innovation, working model, technological components); target audience or market segment; business / revenue model; prototype or system workflow (optional but strongly encouraged); and a feasibility & impact assessment. Suggested domains include AI & ML, IoT, cloud, cybersecurity, FinTech, HealthTech & MedTech, EdTech, robotics & automation, bioinformatics & biometrics, green/clean tech, Agri-Tech, big data & analytics, mobile and web computing, GPS and location-based services, recommendation systems, smart sensor networks, AR & VR, drones and UAVs, edge computing, wearables, blockchain and NLP.",
      rules: [
        "Ideas must be technology-driven, offering feasible and impactful solutions to real-world issues.",
        "Only original and innovative ideas are allowed; any form of plagiarism leads to immediate disqualification.",
        "Topics are allotted based on the registration sequence of institutions. Once registered, teams receive an official communication from the Event Teacher In-charge for topic selection and must confirm their chosen topic by email to the coordinators.",
        "Email the 10–15 slide presentation to the faculty event coordinator on or before the submission deadline.",
        "The presentation and pitch must be delivered strictly in English.",
        "References for data, visuals or statistics may be included, but copying content is prohibited and results in disqualification.",
        "Participants must adhere strictly to the time limits and maintain professional, disciplined and ethical conduct.",
        "A mandatory question-and-answer round follows each presentation.",
      ],
      judging: [
        "Innovation & originality — 10 points",
        "Relevance and potential impact of the problem identified — 10 points",
        "Technical feasibility & practical application — 10 points",
        "Quality of presentation and communication skills — 10 points",
        "Ability to respond effectively during Q&A — 10 points",
      ],
      coordinators: [
        { name: "Mr. Blesson Helgi", role: "Student coordinator", phone: "9607063505", email: "2408006.blesson.sdcce@vvm.edu.in" },
        { name: "Ms. Urvi Kamat", role: "Student coordinator", phone: "952926766", email: "2508075.urvi.sdcce@vvm.edu.in" },
        { name: "Ms. Annette Santimano", role: "Faculty coordinator", phone: "9763553379", email: "annette.santimano@vvm.edu.in" },
      ],
    },
    {
      id: "code-a-thon", name: "Code-a-thon", cat: "On-stage", kind: "code", hue: 168, prize: 0, fee: 0,
      team: "Max 2 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Rapid AI Build (Hackathon)", rounds: "1 round · 4-hour build", theme: "Announced at the start",
      date: "", time: "", venue: "",
      tagline: "Four hours to build and present a working full-stack web or mobile app with AI tools.",
      overview: "A 4-hour challenge where participants build a full-stack web or mobile app using AI tools. Teams plan, develop and present a working prototype based on the given theme. The event promotes creativity, teamwork and the practical use of AI in real-world development.",
      statement: "Build a working prototype on the theme announced at the start, within four hours, on your own laptop. Submit a zipped folder of the entire project with a README that states the project title, the tech stack (frontend / backend / database) and how AI tools were used.",
      rules: [
        "The project must be developed during the event and must follow the theme announced at the start.",
        "Participants are required to bring their own laptops.",
        "All work must be completed within the 4-hour time limit.",
        "Copying, reusing pre-built projects or plagiarised work results in disqualification.",
        "The submitted website is evaluated according to the judging criteria provided.",
        "Use of mobile phones and USB drives is strictly prohibited.",
        "Submit a zipped folder of the entire project along with a README file.",
      ],
      judging: [
        "Creativity & originality: uniqueness and innovation in the idea — 15 points",
        "Relevance to theme: how clearly the project reflects the given theme — 10 points",
        "Design & user experience: visual appeal, layout, usability and clarity — 10 points",
        "Technical implementation: quality of code, structure, features and execution — 10 points",
        "Presentation & explanation: ability to present the work — 5 points",
      ],
      coordinators: [
        { name: "Ms. Tanzilla Shaikh", role: "Student coordinator", phone: "937305304", email:"2511031.tanzila.sdcce@vvm.edu.in" },
        { name: "Mr. Clayton Araujo", role: "Faculty coordinator", phone: "8888494772", email: "clayton.araujo@vvm.edu.in" },
      ],
    },
    {
      id: "tech-persona", name: "Tech-Persona", cat: "On-stage", kind: "lecture", hue: 28, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Voices of IT", rounds: "1 round · 4 min speaking + 4 min Q&A", theme: "Portraying an IT personality",
      date: "", time: "", venue: "",
      tagline: "Dress up, speak up and become a legend of IT for eight minutes.",
      overview: "Portraying IT personalities: four minutes of speaking followed by four minutes of questions from the judges, all answered in the style of the chosen personality.",
      statement: "Once a team registers, the Team Leader is sent a list of personality names to choose from. The participant dresses up and presents in the speaking style of the chosen IT personality, using the video clips provided to learn about them.",
      rules: [
        "Once a team registers, the Team Leader is sent options of personality names to choose from.",
        "The participant has to dress up and present in the speaking style of the chosen IT personality.",
        "Video clips relevant to the IT personality are provided for learning about and portraying them.",
        "Each participant gets 4 minutes to present, followed by questions from the judges about the IT personality.",
        "Questions from the judges must be answered in the same style as the portrayed IT personality.",
      ],
      judging: [
        "Relevant costume and style — 10 points",
        "Portraying the chosen IT personality (vocabulary and speaking style) — 20 points",
        "Knowledge about the IT personality — 10 points",
        "Overall response to questions from the judges — 10 points",
        "Total — 50 points",
      ],
      coordinators: [
        { name: "Mr. Mohammad Ali", role: "Student coordinator", phone: "7972155089", email:"2408019.ali.sdcce@vvm.edu.in" },
        { name: "Ms. Sweta P. Shet Verenkar", role: "Faculty coordinator", phone: "9923644584", email: "sweta.verenkar@vvm.edu.in" },
      ],
    },
    {
      id: "tech-hire", name: "Tech-Hire", cat: "On-stage", kind: "business", hue: 215, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Simulated Tech Interview", rounds: "Round 1 MCQ test · Round 2 Technical interview (top 5)", theme: "Tech job roles allotted by lots",
      date: "", time: "", venue: "",
      tagline: "A simulated technology job interview: 20 MCQs, then a face-to-face panel for the top five.",
      overview: "A simulated technology job interview where participants experience a real-world recruitment process. Round 1 – MCQ Test: Participants answer 20 multiple-choice questions based on a randomly allotted tech role, assessing technical knowledge, logical reasoning and problem-solving skills. Round 2 – Technical Interview: The top five participants face a face-to-face interview with a panel of judges, involving technical concepts, practical scenarios and HR/behavioral questions. Evaluation is based on technical knowledge, analytical thinking, problem-solving, communication and professionalism",
      statement: "Job roles are allotted using lots: Software Tester (manual testing, Selenium and Postman); Graphic Designer (Canva, Photoshop and the Adobe suite); AI and Data Analytics (Python, machine learning and Power BI); UI/UX Designer (Figma, wireframing and prototyping); SQL Developer (MySQL, joins and database design). Round 1 is 20 MCQs for 20 marks in 20 minutes, subject to the organisers' decision. The top 5 qualify for Round 2, and the final ranking is based on Round 2 scores.",
      rules: [
        "Round 1 – MCQ Test",
        "- All participants must appear for the MCQ test individually.",
        "- Participants will be allotted the following job roles using lots:",
        "  - Software Tester (Manual Testing, Selenium and Postman)",
        "  - Graphic Designer (Canva, Photoshop and Adobe suite)",
        "  - AI and Data Analytics (Python, Machine Learning and Power BI)",
        "  - UI/UX Designer (Figma, wireframing and prototyping)",
        "  - SQL Developer (MySQL, joins and database design)",
        "- The test will assess logical reasoning (debugging/coding), analytical thinking, problem-solving ability, and job-role-related knowledge.",
        "Round 2 – Technical Interview",
        "- The 5 shortlisted participants from Round 1 will qualify for the technical interview.",
        "- Each shortlisted participant will attend a face-to-face interview conducted by a panel of judges.",
        "- The interview will be based on the job role allotted in Round 1.",
        "- Questions may include technical concepts, problem-solving tasks, practical scenarios, and HR or behavioural questions.",
        "- Participants will be evaluated on:",
        "  - Technical knowledge",
        "  - Problem-solving ability",
        "  - Communication skills",
        "  - Confidence and professionalism",
        "  - Analytical and practical thinking",
        "- Each participant must answer the questions independently.",
        "- The final ranking will be based on the Round 2 scores.",
      ],
      judging: [
        "Round 1 — 20 points",
        "Round 2 — 80 points (technical knowledge, problem-solving, communication, confidence and professionalism, analytical and practical thinking)",
        "Total — 100 points",
      ],
      coordinators: [
        { name: "Ms. Saniya Irdisi", role: "Student coordinator", phone: "9634443009", email: "2508061.saniya.sdcce@vvm.edu.in" },
        { name: "Ms. Ankita Naik", role: "Faculty coordinator", phone: "9673497991", email: "ankita.naik@vvm.edu.in" },
        { name: "Mr. Amogh Pai Raiturkar", role: "Faculty coordinator", phone: "9765855958", email: "amogh.pairaiturkar@vvm.edu.in" },
      ],
    },

    /* ------------------------------------------------------- lab */
    {
      id: "coderush", name: "CodeRush", cat: "Lab", kind: "code", hue: 200, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Python Debug Duel", rounds: "Round 1 Debugging · Round 2 Coding (top 5)", theme: "Python",
      date: "", time: "", venue: "",
      tagline: "Find the bugs on paper, then code the solution in PyCharm.",
      overview: "A coding and debugging programming event that tests coding accuracy, logical thinking and debugging efficiency using Python.",
      statement: "Round 1 — Debugging / error identification: participants receive a printed Python code file containing errors, identify them and write the corrections. Only the top 5 move on. Round 2 — Coding: a problem statement with an expected result; code it in Python using PyCharm so the output matches. This round decides the Winner and Runner-up.",
      rules: [
        "Round 1: participants receive a printed Python code file containing some errors.",
        "Identify the errors and write the corrections.",
        "Only the top 5 participants move to Round 2.",
        "Round 2: participants are given a problem statement with an expected result.",
        "Coding must be done in Python using PyCharm; the output must match the expected result.",
        "Round 2 determines the Winner and the Runner-up.",
      ],
      judging: ["Accuracy of error identification and corrections (Round 1)", "Correctness of output against the expected result (Round 2)"],
      coordinators: [
        { name: "Ms. Shravani Kalghatkar", role: "Student coordinator", phone: "7276397079", email: "2508067.shravani.sdcce@vvm.edu.in" },
        { name: "Mr. Shabir Shaikh Bani", role: "Student coordinator", phone: "9356409835", email: "2508064.shabir.sdcce@vvm.edu.in" },
        { name: "Ms. Rama Borkar", role: "Faculty coordinator", phone: "9823456324", email: "rama.borkar@vvm.edu.in" },
      ],
    },
    {
      id: "cinebytes", name: "CineBytes", cat: "Lab", kind: "design", hue: 350, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Trailer Forge", rounds: "1 round", theme: "A 1–2 minute trailer from a 40-minute film",
      date: "", time: "", venue: "",
      tagline: "Cut a 40-minute film down to a 1–2 minute trailer in OpenShot.",
      overview: "A 40-minute video (preferably animated) is provided. Based on this video, a trailer of 1–2 minutes needs to be created.",
      statement: "All required files are given at the venue and there is no internet access. Using only OpenShot Video Editor and the given resources, create a 1–2 minute trailer within the allotted time.",
      rules: [
        "A 40-minute (preferably animated) video is provided; create a 1–2 minute trailer based on it.",
        "Internet access is not provided during the competition.",
        "All required files are given at the venue.",
        "Participants must bring their own audio-listening device (wired or wireless).",
        "Only OpenShot Video Editor is allowed for creating the trailer.",
        "No help is provided except in case of hardware or software issues.",
        "Any unauthorised help or tools lead to disqualification.",
      ],
      judging: ["Story flow & selection of scenes", "Creativity & originality", "Editing skills", "Technical quality"],
      coordinators: [
        { name: "Mr. Rishabh Bhasker Meatri", role: "Student coordinator", phone: "9421311858", email: "2608044.rishabh.sdcce@vvm.edu.in" },
        { name: "Vibhuti Prasad Padhy", role: "Student coordinator", phone: "9861935701", email: "2608075.vibhuthi.sdcce@vvm.edu.in" },
        { name: "Mr. Samuel Godinho", role: "Faculty coordinator", phone: "8975868065", email: "samuel.godinho@vvm.edu.in" },
      ],
    },
    {
      id: "uxplorer", name: "UXplorer", cat: "Lab", kind: "design", hue: 280, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Design with Purpose", rounds: "1 round · Wireframes + clickable prototype", theme: "Provided on the day",
      date: "", time: "", venue: "",
      tagline: "A real-world case study, Figma, and the clock: design an interface people would actually use.",
      overview: "UXplorer is a UI/UX design challenge where creativity meets problem-solving. Participants receive a real-world case study with a design task and, using Figma, craft an intuitive and visually compelling user interface. The event also emphasises prototyping, turning ideas into interactive, user-friendly experiences.",
      statement: "Design wireframes and a clickable prototype in Figma for the given theme, audience and problem, from scratch, within the event window.",
      rules: [
        "Participants must have knowledge of Figma.",
        "Individual participation: no teams, no groups.",
        "The theme is provided on the day of the event.",
        "Internet is available for downloading images needed for the design, strictly not for downloading templates.",
        "No pre-made templates, purchased UI kits or copied full-screen designs are allowed.",
        "All designs must be created from scratch during the event window and must reflect the given theme, audience and problem.",
        "Complete the project within the allotted time, which typically includes wireframes and a clickable prototype.",
        "Follow standard UI/UX practices for user interface and prototyping.",
      ],
      judging: [
        "Creativity & originality — 20",
        "User experience (flow & functionality) — 20",
        "User interface (visual quality) — 20",
        "Prototype & interactions — 20",
        "Presentation & explanation — 20",
      ],
      coordinators: [
        { name: "Ms. Adaa Shaikh", role: "Student coordinator", phone: "7745093223", email: "2408001.adaa.sdcce@vvm.edu.in" },
        { name: "Ms. Disha Malvanker", role: "Faculty coordinator", phone: "7083261998", email: "disha.malvankar@vvm.edu.in" },
      ],
    },
    {
      id: "queryquest", name: "QueryQuest", cat: "Lab", kind: "science", hue: 190, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "From Tables to Triumph", rounds: "1 round", theme: "SQL on a given dataset",
      date: "", time: "", venue: "",
      tagline: "Nested queries, complex sub-queries and a ticking clock.",
      overview: "Query Quest is a database event where participants receive a dataset and must write SQL queries, including nested queries, to retrieve the correct data. It tests logical thinking, database knowledge and query-building skills.",
      statement: "Write correct SQL for the given dataset, including nested and complex sub-queries, within the time limit, and submit the queries in a Notepad file.",
      rules: [
        "Queries must be written using correct SQL syntax for the given dataset.",
        "Queries include nested and complex sub-queries.",
        "Internet access or external help is not allowed.",
        "The time limit must be strictly followed.",
        "In case of a tie, accuracy and execution time are considered.",
        "Queries must be submitted in a Notepad file.",
      ],
      judging: ["Accuracy of query and result — 20 points", "Use of correct SQL syntax & logic — 20 points", "Time management — 10 points"],
      coordinators: [
        { name: "Ms. Sapna Kumari", role: "Student coordinator", phone: "7499140422", email: "2511030.sapna.sdcce@vvm.edu.in" },
        { name: "Ms. Samira Vengurlekar", role: "Faculty coordinator", phone: "9527817135", email: "samira.vengurlekar@vvm.edu.in" },
      ],
    },
    {
      id: "adcraft", name: "AdCraft", cat: "Lab", kind: "spark", hue: 310, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Prompt the Vision. Create the Impact.", rounds: "1 round", theme: "A 1-minute video ad on the given theme",
      date: "", time: "", venue: "",
      tagline: "Generate every shot with Grok, cut it in OpenShot, and sell the idea in sixty seconds.",
      overview: "A creative event that challenges participants to design a digital video advertisement entirely through effective prompting. Using Grok, participants generate visuals based on how clearly and creatively they prompt. It is a test of both creativity and smart AI usage.",
      statement: "Create a 1-minute video advertisement on the given theme: generate multiple clips with Grok (grok.com/imagine), combine and edit them in OpenShot Video Editor, and add sound effects only from Pixabay. Save the final ad, all raw clips, audio and exported files in a desktop folder named after your team, and submit a Word document containing every prompt used.",
      rules: [
        "Accounts required: create accounts on Grok (grok.com/imagine), Pixabay (pixabay.com) and OpenShot beforehand.",
        "Create a 1-minute video advertisement based on the given theme.",
        "Generate multiple clips using Grok and use OpenShot Video Editor to combine, arrange and edit them into the final advertisement.",
        "Sound effects only from Pixabay, added through the video editor.",
        "No other websites, AI tools or external software are permitted.",
        "Participants must have knowledge of OpenShot video editing software.",
        "Create a folder on the desktop named after your team and save the final advertisement, raw clips, audio and exported files inside it.",
        "Submit a Word document containing all prompts used in Grok.",
        "Any violation of the rules results in immediate disqualification.",
      ],
      judging: [
        "Prompt creativity and quality: clarity, originality and effectiveness of the prompts — 25 points",
        "Visual output and clip quality: relevance of generated clips to the theme — 25 points",
        "Editing and technical execution: smooth joins, clean cuts, transitions and sound integration — 25 points",
        "Message clarity and creativity: strength of the concept and clear communication of the idea — 25 points",
      ],
      coordinators: [
        { name: "Mr. Mohammed Ali", role: "Student coordinator", phone: "7972155089", email: "2408019.ali.sdcce@vvm.edu.in" },
        { name: "Mr. Muaz Pathan", role: "Student coordinator", phone: "9767702818", email: "2408059.muaz.sdcce@vvm.edu.in" },
        { name: "Ms. Sneha Prabhudessai", role: "Faculty coordinator", phone: "9765855958", email: "sneha.prabhudessai@vvm.edu.in" },
      ],
    },
    {
      id: "powerbit", name: "PowerBit", cat: "Lab", kind: "science", hue: 52, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Power the Data. Own the Insights.", rounds: "1 round · 3 hours", theme: "Given on the spot",
      date: "", time: "", venue: "",
      tagline: "Three hours, one dataset, a dashboard with real insights in Power BI.",
      overview: "Data Analytics using Power BI is a 3-hour professional competition in which participants analyse datasets, build interactive dashboards and present meaningful insights. It develops industry-aligned analytics competencies while fostering critical thinking, visualisation skills and real-world problem-solving, cultivating future-ready data analysts.",
      statement: "Topics, themes and datasets are provided on the spot. Submit a fully functional Power BI report (.pbix) with a PDF export of the dashboard and a brief 150–200 word summary of insights within the 3-hour window. The report should clearly reflect data cleaning, modelling, visualisation and insights.",
      rules: [
        "Participants must report to the venue on time.",
        "Topics, themes and datasets are provided on the spot.",
        "The total duration is 3 hours, during which all work must be completed and submitted; late submissions are not evaluated.",
        "Internet use is restricted to Power BI documentation and DAX references; browsing external dashboards or ready-made templates is prohibited.",
        "Work only on the dataset provided; external data sources are not allowed.",
        "Submit the Power BI (.pbix) file and a PDF export before the deadline, with a 150–200 word summary of insights.",
        "Dashboard designs must be original; plagiarism or pre-built templates mean immediate disqualification.",
        "Any malpractice, technical manipulation or disturbance during the event leads to disqualification.",
      ],
      judging: [
        "Data cleaning & preparation — 20 points (handling missing values, duplicates and inconsistencies; logical transformation steps)",
        "Data modelling & DAX usage — 20 points (relationships, model structure and schema; meaningful DAX measures)",
        "Dashboard design & visualisation quality — 25 points (layout clarity, choice of visuals, colour and readability)",
        "Insight generation & interpretation — 25 points (accuracy and depth of insights, relevance to the theme, actionable conclusions)",
        "Interactivity & advanced features — 10 points (slicers, filters, drill-throughs, bookmarks)",
      ],
      coordinators: [
        { name: "Ms. Prema M", role: "Student coordinator", phone: "7219521813", email: "2408014.prema.sdcce@vvm.edu.in" },
        { name: "Mr. Sameer Patil", role: "Faculty coordinator", phone: "7507720245", email: "sameer.patil@vvm.edu.in" },
      ],
    },
    {
      id: "cyphercell", name: "CypherCell", cat: "Lab", kind: "code", hue: 150, prize: 0, fee: 0,
      team: "2 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Investigate. Connect. Crack", rounds: "1 round · 1 hour", theme: "Crack a digital forensics case",
      date: "", time: "", venue: "",
      tagline: "Two minds, one hour, a trail of digital clues: crack the case first.",
      overview: "Teams of two get exactly one hour to solve a series of digital puzzles and clues that help crack a digital forensics case.",
      statement: "Solve the puzzles in sequence on the systems provided. The team that cracks the case first within the hour, with all previous puzzles solved correctly, wins. If no team cracks it, the team that solved the most clues correctly is declared the winner.",
      rules: [
        "Each team must consist of exactly 2 members.",
        "Each team gets exactly 1 hour to solve a series of digital puzzles/clues that help crack a digital forensics case.",
        "Calculators, mobile phones or any external gadgets are not allowed.",
        "Teams must maintain decorum; cheating, brute force or tampering with the systems provided means immediate disqualification.",
        "The event coordinators may modify rules or terminate participation in case of emergencies, logistics, safety concerns or rule violations.",
      ],
      judging: [
        "The team that cracks the case first within one hour (with all previous puzzles solved correctly) wins.",
        "If no team cracks the case in time, teams are judged on accuracy in solving and decoding the clues; the team with the most correct solutions wins.",
      ],
      coordinators: [
        { name: "Ms. Sandra Fernandes", role: "Student coordinator", phone: "8412886565", email: "2408030.sandra.sdcce@vvm.edu.in" },
        { name: "Ms. Yugandhara Joshi", role: "Faculty coordinator", phone: "9765855958", email: "yugandhara.joshi@vvm.edu.in" },
      ],
    },

    /* ---------------------------------------------------- gaming */
    {
      id: "fifa-24", name: "FIFA 24", cat: "Gaming", kind: "gaming", hue: 120, prize: 0, fee: 0,
      team: "1 per college", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Competitive Kickoff", rounds: "Lots draw · Single-elimination knockout", theme: "EA Sports FC 24 · Kick-Off mode",
      date: "", time: "", venue: "",
      tagline: "Kick-Off mode, knockout bracket, one champion.",
      overview: "EA Sports FC 24 is a next-generation football simulation featuring HyperMotionV, PlayStyles and the Frostbite engine. With 19,000+ licensed players, 700+ teams and 30+ leagues, it delivers authentic gameplay and modes like Ultimate Team, Career, Clubs and VOLTA.",
      statement: "Players for the final round are chosen by drawing lots. All selected players compete in a single-elimination knockout until the champion is decided: two players drawn means a direct final; more players means a bracket with quarter-finals and semi-finals as needed.",
      rules: [
        "Game: EA Sports FC 24 (latest patch); mode: Kick-Off.",
        "One participant per college; only one account per player.",
        "Players must be present at the time of the draw and at match start.",
        "Selection: players for the final round are chosen by drawing lots (random selection).",
        "Final round: single-elimination matches continue until one champion remains.",
        "Respect all participants and organisers; no abusive language or unsportsmanlike behaviour.",
        "The organiser manages the lots draw, group stage and bracket, has the final say on disputes, and may adjust rules before the tournament begins but not mid-match.",
      ],
      judging: ["Match results in the knockout bracket"],
      coordinators: [
        { name: "Mr. Jaf Soares", role: "Student coordinator", phone: "+91 94209 90906", email: "2511012.jaf.sdcce@vvm.edu.in" },
        { name: "Mr. Andre Pacheco", role: "Faculty coordinator", phone: "8805351776", email: "andre.pacheco@vvm.edu.in" },
      ],
    },
    {
      id: "mortal-kombat-11", name: "Mortal Kombat 11", cat: "Gaming", kind: "gaming", hue: 0, prize: 0, fee: 0,
      team: "1 per team", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "Kombat Showdown", rounds: "Lots draw · Best-of-3 sets · Knockout", theme: "Versus mode, competitive settings",
      date: "", time: "", venue: "",
      tagline: "Best of three, first to two rounds, until only one fighter stands.",
      overview: "Mortal Kombat 11 is a visceral fighting game with a cinematic story, brutal combat and iconic characters. With customisable variations, stunning visuals and competitive play, it delivers intense battles, fatalities and strategic depth.",
      statement: "Players for the final round are drawn by lots. Sets are best of 3 matches (finals optionally best of 5), first to 2 rounds per match, competitive mode enabled. An odd draw forms one round-robin group of three whose top two join the single-elimination bracket; everyone else plays 1v1 knockouts.",
      rules: [
        "Mode: Versus. Only one account per player; players must be present at the draw and at match start.",
        "Set format: best of 3 matches (first to 2 wins); finals optionally best of 5. Rounds per match: first to 2 (MK11 default).",
        "Competitive mode enabled (tournament-legal variations, standardised frame data).",
        "Any character allowed; the winner may switch only after the opponent switches (or winner-lock, organiser's choice).",
        "Stage select random; stage interactables on (organiser may set off). Timer default.",
        "No macros or cheats; controller remapping allowed within game settings only.",
        "Odd number of players: one group of 3 plays a round-robin (best-of-3 sets); the top 2 (wins, then game differential, then head-to-head) join the knockout bracket.",
        "Final round: single elimination until one champion remains; two players drawn means a direct final.",
        "Pauses only for legitimate issues (controller disconnect, health or safety); notify the organiser immediately.",
        "The organiser manages the draw, groups and bracket, has decisive authority on disputes, and may adjust rules before the tournament begins but not mid-match.",
      ],
      judging: ["Match results in the group stage and knockout bracket"],
      coordinators: [
        { name: "Mr. Jaf Soares", role: "Student coordinator", phone: "+91 94209 90906", email: "2511012.jaf.sdcce@vvm.edu.in" },
        { name: "Mr. Andre Pacheco", role: "Faculty coordinator", phone: "8805351776", email: "andre.pacheco@vvm.edu.in" },
      ],
    },
    {
      id: "rc-car-gaming", name: "RC Car Gaming", cat: "Gaming", kind: "robot", hue: 25, prize: 0, fee: 0,
      team: "1v1 or 2v2, depending on the arena", mode: "Onsite", status: "open", deadline: "2027-01-01",
      subtitle: "", rounds: "5-minute matches · Shoot-out tie-breaker · 3 hours", theme: "RC cars in an enclosed arena",
      date: "", time: "", venue: "Quadrangle",
      tagline: "Push, flick and rebound the ball into the goal with your RC car.",
      overview: "RC cars score goals in an enclosed arena: standard 2v2 or 1v1 depending on arena size and team. Cars push or flick the ball with their chassis and bumpers; a goal is awarded whenever the ball completely crosses the goal line.",
      statement: "Matches run for 5 minutes of regulation time. If the score is tied, a 30-second shoot-out follows: the attacker gets 15 seconds to drive from centre and score, each team takes turns (best of 3 shots), and sudden-death rounds decide a winner if still tied.",
      rules: [
        "Standard 2v2 / 1v1 depending on arena size and team.",
        "No out-of-bounds: the arena is enclosed, so the ball is always live and walls may be used for indirect passes or rebounds. If no walls exist, a defined boundary applies; when the ball crosses it the timer pauses, the ball is reset to the centre and play resumes.",
        "Scoring: a goal is awarded when the ball completely crosses the goal line. The clock pauses, the ball is reset to the centre circle and play resumes on the referee's whistle.",
        "Passing & dribbling: cars must push or flick the ball with their chassis or bumpers. Holding, trapping or pinning the ball under the car for more than 3 seconds is stalling.",
        "Deliberate pinning or sticking the ball against a wall or corner for more than 3 seconds gives the opponent a free kick from the centre; more than 3 offences means disqualification.",
        "Intentionally trapping or flipping an opponent's RC car upside down results in direct disqualification; unintentional collisions are part of the game.",
        "If a car flips on its own or suffers a technical failure, the match continues; organisers right the car at the nearest safe moment without stopping the timer.",
        "Players must be present at the time of the draw and match start.",
      ],
      judging: [
        "Goals scored in 5 minutes of regulation time",
        "Tie-breaker: 30-second shoot-out, best of 3 shots, then sudden death",
      ],
      coordinators: [
        { name: "Mr. Jaf Soares", role: "Student coordinator", phone: "+91 94209 90906", email: "2511012.jaf.sdcce@vvm.edu.in" },
        { name: "Mr. Andre Pacheco", role: "Faculty coordinator", phone: "8805351776", email: "andre.pacheco@vvm.edu.in" },
      ],
    },
  ],

  // No city qualifiers: TechNation 2027 is held entirely on campus.
  zonals: [],

  // Day-by-day timetable (IST), from the official TechNation 2027 schedule.
  // cat: Registration, Ceremony, Competition, Surprise, Break.
  schedule: [
    { day: "2027-01-08", start: "08:45", end: "09:00", cat: "Registration", title: "Early Bird Registration", venue: "Main Building · Hall 2" },
    { day: "2027-01-08", start: "09:00", end: "09:30", cat: "Registration", title: "Regular Registration", venue: "Main Building · Hall 2" },
    { day: "2027-01-08", start: "09:00", end: "09:30", cat: "Break", title: "Refreshments", venue: "Room F405 / F406, Main Building" },
    { day: "2027-01-08", start: "09:45", end: "10:30", cat: "Ceremony", title: "Inaugural Ceremony", venue: "Main Building · Hall 1" },
    { day: "2027-01-08", start: "10:45", end: "13:30", cat: "Competition", title: "TeamVerse", venue: "Main Building · Hall 1", link: "event.html?id=teamverse" },
    { day: "2027-01-08", start: "11:00", end: "11:30", cat: "Competition", title: "Code-a-thon · Briefing", venue: "Annex Building · Training Room (Skill Development Center)", link: "event.html?id=code-a-thon" },
    { day: "2027-01-08", start: "11:00", end: "13:00", cat: "Surprise", title: "Surprise Event", venue: "Main Building · F401", note: "Open to all · Non-competitive · 11:00 AM onwards" },
    { day: "2027-01-08", start: "11:00", end: "13:00", cat: "Competition", title: "UXplorer", venue: "Annex Building · Lab 4", link: "event.html?id=uxplorer" },
    { day: "2027-01-08", start: "11:00", end: "14:00", cat: "Competition", title: "RC Car Football Game", venue: "Quadrangle / OTS", link: "event.html?id=rc-car-gaming" },
    { day: "2027-01-08", start: "11:30", end: "15:30", cat: "Competition", title: "Code-a-thon · Task", venue: "Annex Building · Training Room (Skill Development Center)", link: "event.html?id=code-a-thon" },
    { day: "2027-01-08", start: "12:00", end: "13:00", cat: "Competition", title: "CineBytes", venue: "Annex Building · Lab 1", link: "event.html?id=cinebytes" },
    { day: "2027-01-08", start: "13:00", end: "14:00", cat: "Break", title: "Lunch Break", venue: "Room F405 / F406, Main Building" },
    { day: "2027-01-08", start: "14:00", end: "16:00", cat: "Competition", title: "CodeRush", venue: "Annex Building · Lab 1", link: "event.html?id=coderush" },
    { day: "2027-01-08", start: "14:00", end: "17:00", cat: "Competition", title: "QBIT", venue: "Main Building · Hall 1", link: "event.html?id=qbit" },
    { day: "2027-01-08", start: "14:00", end: "17:00", cat: "Competition", title: "Tech-Persona", venue: "Main Building · Hall 2", link: "event.html?id=tech-persona" },
    { day: "2027-01-08", start: "14:00", end: "17:00", cat: "Competition", title: "PowerBit", venue: "Annex Building · Lab 4", link: "event.html?id=powerbit" },
    { day: "2027-01-08", start: "14:30", end: "16:00", cat: "Surprise", title: "Surprise Event", venue: "Main Building · F401" },
    { day: "2027-01-08", start: "14:30", end: "17:30", cat: "Competition", title: "FIFA 24", venue: "Main Building · F404", link: "event.html?id=fifa-24" },
    { day: "2027-01-08", start: "15:30", end: "17:30", cat: "Competition", title: "Code-a-thon · Evaluation", venue: "Annex Building · Training Room (Skill Development Center)", link: "event.html?id=code-a-thon" },
    { day: "2027-01-09", start: "09:00", end: "09:30", cat: "Break", title: "Refreshments", venue: "Room F405 / F406, Main Building" },
    { day: "2027-01-09", start: "09:30", end: "11:30", cat: "Competition", title: "Tech-Hire", venue: "Main Building · F403", link: "event.html?id=tech-hire" },
    { day: "2027-01-09", start: "09:30", end: "12:00", cat: "Surprise", title: "Surprise Event", venue: "Main Building · Hall 1" },
    { day: "2027-01-09", start: "09:30", end: "12:00", cat: "Competition", title: "Reel-O-Tech", venue: "Main Building · F401", link: "event.html?id=reel-o-tech", note: "Online submission deadline · 10:30 AM" },
    { day: "2027-01-09", start: "09:30", end: "12:00", cat: "Competition", title: "Mortal Kombat 11", venue: "Main Building · F404", link: "event.html?id=mortal-kombat-11" },
    { day: "2027-01-09", start: "10:00", end: "11:00", cat: "Competition", title: "AdCraft", venue: "Annex Building · Lab 2", link: "event.html?id=adcraft" },
    { day: "2027-01-09", start: "10:00", end: "11:00", cat: "Competition", title: "CypherCell", venue: "Annex Building · Lab 4", link: "event.html?id=cyphercell" },
    { day: "2027-01-09", start: "10:00", end: "12:00", cat: "Competition", title: "QueryQuest", venue: "Annex Building · Lab 1", link: "event.html?id=queryquest" },
    { day: "2027-01-09", start: "13:00", end: "14:00", cat: "Break", title: "Lunch Break", venue: "Room F405 / F406, Main Building" },
    { day: "2027-01-09", start: "14:30", end: "16:30", cat: "Ceremony", title: "Valedictory & Prize Distribution", venue: "Main Building · Hall 1" },
  ],

  // The "classified" rules dossier on the home page: the brochure's General Rules.
  protocols: {
    general: [
      "Participation is by invitation to recognised colleges and institutions across India (UGC / AICTE / State or Central University recognised).",
      "Open to undergraduate students of BCA, B.Sc. (Computer Science / IT), B.Voc. (Software Technologies / Software Development) or equivalent IT-related programmes. Participants must be bonafide students of their institution.",
      "One team per college or institution, with 10 to 12 students, all from the same institution. The team registration fee is ₹3,000 per team.",
      "Teams may assign different participants to different events to avoid schedule conflicts.",
      "Each team must be accompanied by a Faculty Coordinator and a Student Team Leader, and must confirm participation at least one week before the event dates.",
      "Outstation teams arrange their own accommodation; the organising committee can give limited assistance on prior request. Local transport between the designated hotel and the venue is arranged by the host institution.",
      "All official communication, including schedules, rules and updates, goes to the registered email of the Team Leader or Faculty Coordinator.",
    ],
    dayOf: [
      "Produce the deputation letter from your institution and valid college ID cards of all participants at the registration desk on 8 January 2027.",
      "Every team is assigned a unique Team Name at the venue; use it in all events. Institution identity must not be disclosed.",
      "No college name, logo, insignia or branded material may be worn, displayed or carried, from desk registration until the results are announced at the valedictory on 9 January 2027.",
      "Breakfast and lunch on both days are provided by the host institution at the venue.",
      "Follow the SOPs and campus regulations. Offensive language, misconduct or vulgar behaviour means immediate disqualification of the team.",
      "Judges' and organising committee decisions are final. Results are declared at the valedictory ceremony, where the Overall Winner and Overall Runner-Up trophies are awarded on cumulative points.",
    ],
  },

  /* ------------------------------------------------------------ gallery
     Replace the images in assets/gallery/ with real photos (same filenames),
     or change src. Items without src get generated artwork. */
  gallery: [
    { src: "assets/gallery/hackathon-1.jpg", caption: "Code-a-thon in progress", cat: "Competitions", year: 2026 },
    { src: "assets/gallery/keynote-1.jpg", caption: "Inaugural session", cat: "Ceremony", year: 2026 },
    { src: "assets/gallery/esports-1.jpg", caption: "Gaming finals", cat: "Gaming", year: 2026 },
    { src: "assets/gallery/workshop-1.jpg", caption: "Lab events", cat: "Lab events", year: 2026 },
    { src: "assets/gallery/ceremony-1.jpg", caption: "Valedictory ceremony", cat: "Ceremony", year: 2026 },
    { src: "assets/gallery/hackathon-2.jpg", caption: "Team huddle", cat: "Competitions", year: 2025 },
    { src: "assets/gallery/ceremony-2.jpg", caption: "Trophy presentation", cat: "Ceremony", year: 2025 },
    { src: "assets/gallery/esports-2.jpg", caption: "On-stage events", cat: "Competitions", year: 2025 },
  ],

  /* ----------------------------------------------------------- sponsors
     Add logo: "assets/sponsors/name.png" to show an image instead of the wordmark. */
  sponsorTiers: ["Title Sponsor", "Powered By", "Gold Partners", "Silver Partners", "Community & Media"],
  sponsors: [],
  partnerBenefits: [
    { icon: "spark", title: "Brand visibility", text: "Stage branding and venue placement in front of student teams from colleges across India." },
    { icon: "users", title: "Talent pipeline", text: "Meet shortlisted coders, designers and analysts first, with direct access to the Tech-Hire and Code-a-thon finalists." },
    { icon: "rocket", title: "Product showcases", text: "Demo slots and problem statements put your product in students' hands." },
    { icon: "trophy", title: "Sponsored events", text: "Present a trophy or set a theme for Code-a-thon, PowerBit or AdCraft." },
    { icon: "globe", title: "Digital reach", text: "Campaigns across the fest's channels and the College's social media." },
    { icon: "cap", title: "Campus network", text: "Tap into the Department's industry partners and alumni across Goa's IT sector." },
  ],
  partnerSteps: ["Write to the coordinators", "Pick a package", "Shape your activation", "Sign the agreement", "Go live at the fest"],

  /* --------------------------------------------------------------- team
     From the brochure's Our Team page. Add photo: "assets/team/name.jpg" for real photos. */
  teamGroups: ["Faculty Coordinators", "Student Coordinators", "Core Team", "Volunteers"],
  team: [
    { name: "Mr. Sumit Kumar", role: "Faculty Coordinator · +91 98221 67259", group: "Faculty Coordinators", dept: "Department of Computer Science", email: "", photo: "", linkedin: "" },
    { name: "Mr. Ramkrishna Reddy", role: "Faculty Co-coordinator · +91 88065 72120", group: "Faculty Coordinators", dept: "Department of Computer Science", email: "", photo: "", linkedin: "" },
    { name: "Ms. Shweta Sahakari", role: "TechNation Coordinator · +91 77219 64935", group: "Student Coordinators", dept: "On-stage Events In-charge", email: "", photo: "", linkedin: "" },
    { name: "Ms. Praditi Naik", role: "TechNation Co-coordinator · +91 93221 53078", group: "Student Coordinators", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Ms. Pooja Chavan", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Ms. Ruhifaraz Noorbadsha", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Mayuresh Chari", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Seval Naik", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Shweth Naik", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Sairaj Alve", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Jeetesh Naik", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Ms. Joyce", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Ms. Kamakshi Raikar", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Jaf Soares", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
    { name: "Mr. Suraj Maurya", role: "Core Team", group: "Core Team", dept: "", email: "", photo: "", linkedin: "" },
  ],

  /* -------------------------------------------------------------- about */
  history: [
    { year: "2011", title: "Spectra", text: "The Department of Computer Science launches Spectra, the student tech event from which TechNation grew." },
    { year: "2010s", title: "A state-level stage", text: "TechNation, Spectra and BitBuzz become the Department's annual state-level events, run with the TechTrendz tech club." },
    { year: "2027", title: "National level", text: "TechNation goes national: invited colleges from across India compete on campus on 8 and 9 January 2027. Connect. Learn. Transform." },
  ],
  pillars: [
    { icon: "rocket", title: "Vision", text: "From prompt to possibilities: inspire the next leap in innovation and give students a national stage for creativity, skill and digital innovation." },
    { icon: "cap", title: "Mission", text: "Give students real-world exposure, inspire cross-institutional collaboration, and build leadership, teamwork and problem-solving skills." },
    { icon: "users", title: "Community", text: "A creative and collaborative ecosystem fuelled by student passion and faculty mentorship, where technology meets creativity and ideas become outcomes." },
  ],
  // Where participants travel from. The home entry is the fest itself.
  // Cities on the About page globe; empty hides the section (the brochure lists none).
  places: [],
  recognition: [
    { year: 1973, from: "Vidya Vikas Mandal", text: "Shree Damodar College of Commerce & Economics is established as the Mandal's flagship institution in Margao." },
    { year: 1997, from: "Goa University", text: "The Department pioneers Goa University's BCA programme with an intake of 80 students." },
    { year: 2019, from: "NASSCOM", text: "B.Voc. (Software Technologies) begins with NASSCOM-certified, NSQF-aligned skill training." },
    { year: 2022, from: "Goa University", text: "The flexible, multidisciplinary BBA programme is introduced." },
    { year: 2024, from: "AICTE", text: "The NEP 2020-aligned BCA programme is approved by AICTE from 2024–25." },
    { year: 2026, from: "NAAC", text: "The College holds an 'A' Grade from NAAC and is approved by both UGC and AICTE." },
  ],
  stay: {
    kicker: "Accommodation & travel",
    title: "Coming from outside Goa?",
    lead: "Accommodation is arranged by the participating team; the organising committee can assist on prior request.",
    details: [
      { icon: "bed", label: "Accommodation", value: "Arranged by your team", text: "The organising committee may provide limited assistance and guidance upon prior request." },
      { icon: "ticket", label: "Expenses", value: "Borne by the institution", text: "Travel and stay costs for outstation participants are borne by the participating institution or team." },
      { icon: "pin", label: "Local transport", value: "Hotel ↔ venue by host", text: "Transport between the designated hotel and the event venue, and back, is arranged by the host institution." },
      { icon: "clock", label: "Meals", value: "Breakfast & lunch", text: "Provided by the host institution at the venue on 8 and 9 January." },
    ],
    perks: [
      { icon: "spark", title: "Confirm early", text: "Outstation teams should confirm participation in advance so logistics can be arranged." },
      { icon: "users", title: "Travel together", text: "Each team travels with its Faculty Coordinator and Student Team Leader." },
      { icon: "shield", title: "Help desk", text: "Contact the faculty coordinators for accommodation assistance or information." },
      { icon: "globe", title: "Margao, Goa", text: "The campus is in Comba, Margao, in South Goa, with rail and road links across the state." },
    ],
  },

  faqs: [
    { q: "When and where is TechNation 2027?", a: "TechNation 2027 runs {dates} at {venue}. All events are conducted offline on the campus." },
    { q: "Who can participate?", a: "Participation is by invitation to recognised colleges and institutions across India. It is open to undergraduate students of BCA, B.Sc. (Computer Science / IT), B.Voc. (Software Technologies / Software Development) or equivalent IT-related programmes, who are bonafide students of their institution." },
    { q: "How many students can a college send?", a: "One team per college or institution, with 10 to 12 students, all from the same institution. Teams may assign different participants to different events to avoid schedule clashes. Each team must be accompanied by a Faculty Coordinator and a Student Team Leader." },
    { q: "What does it cost?", a: "The team registration fee is ₹3,000 per team and covers all events. Pay by bank transfer to VVMS Shree Damodar College of Comm. & Eco, HDFC Bank, Goa Margao branch, account number 50100150767879, IFSC HDFC0000037." },
    { q: "How do we register?", a: "Register your team through this website and confirm participation at least one week before the event dates. For queries write to cs.sdcc@vvm.edu.in or call the faculty coordinators, Mr. Sumit Kumar (+91 98221 67259) or Mr. Ramkrishna Reddy (+91 88065 72120)." },
    { q: "What do we need to bring on the day?", a: "A deputation letter issued by your institution and valid college ID cards of all participants, to be produced at the registration desk on 8 January 2027. Laptops are needed for Code-a-thon and an audio-listening device for CineBytes." },
    { q: "Why can't we show our college name?", a: "To keep evaluation fair and unbiased. Every team receives a unique Team Name at the venue, and no college name, logo, insignia or branded material may be worn, displayed or carried until the results are announced at the valedictory on 9 January. Violations can mean penalties or disqualification." },
    { q: "Is accommodation available?", a: "Accommodation is the responsibility of the participating team, but the organising committee can provide limited assistance and guidance on prior request. Local transport between the designated hotel and the venue is arranged by the host, and breakfast and lunch are provided on both days." },
    { q: "What do winners get?", a: "First and second prize winners of each event receive trophies and e-certificates (or printed certificates). Points are awarded for participation and positions, and the teams with the highest cumulative points receive the Overall Winner and Overall Runner-Up trophies at the valedictory ceremony." },
    { q: "How will we receive updates?", a: "All official communication, including event schedules, rules and announcements, is sent to the registered email of the Team Leader or Faculty Coordinator. Event-specific instructions are shared before each event starts." },
  ],

  assistant: {
    suggest: ["When is TechNation?", "How do we register?", "What is the team size?", "Is accommodation provided?"],
    intents: [
      { k: ["hi", "hello", "hey", "namaste", "yo"], a: "Hello! I can help with dates, events, rules, team registration, accommodation and contacts for TechNation 2027. What would you like to know?" },
      { k: ["when", "date", "dates", "day", "january"], a: "TechNation 2027 runs {dates} at {venue}." },
      { k: ["schedule", "timetable", "agenda", "itinerary", "timings", "slot"], a: "The day-wise timetable will be shared with registered teams by email and published on the <a href=\"schedule.html\">Schedule page →</a>" },
      { k: ["where", "venue", "location", "reach", "address", "campus", "margao", "goa"], a: "Everything happens at {venue}. <a href=\"about.html#venue\">Venue & directions →</a>" },
      { k: ["event", "events", "competition", "competitions", "compete", "gaming", "lab", "stage", "hackathon", "code-a-thon"], a: "There are {ncomp} events across on-stage, off-stage, lab and gaming categories. <a href=\"events.html\">Browse events →</a>" },
      { k: ["team", "size", "members", "students", "how many"], a: "One team per college with 10 to 12 students, all from the same institution, accompanied by a Faculty Coordinator and a Student Team Leader." },
      { k: ["fee", "fees", "cost", "price", "pay", "payment", "bank", "account"], a: "The team registration fee is ₹3,000 per team and covers all events. Bank details are in the <a href=\"index.html#faq\">FAQ →</a>" },
      { k: ["eligible", "eligibility", "who", "bca", "bsc", "bvoc", "invitation"], a: "Participation is by invitation to recognised colleges across India, for undergraduate students of BCA, B.Sc. (CS/IT), B.Voc. (Software Technologies) or equivalent IT programmes." },
      { k: ["stay", "accommodation", "hostel", "hotel", "room", "sleep", "transport", "food", "lunch", "breakfast"], a: "Accommodation is arranged by the participating team, with limited assistance from the organisers on prior request. Local transport between the hotel and venue, plus breakfast and lunch on both days, are provided by the host. <a href=\"about.html#stay\">Details →</a>" },
      { k: ["prize", "prizes", "trophy", "trophies", "winner", "points", "overall"], a: "First and second place in every event win trophies and certificates. Points add up to the Overall Winner and Overall Runner-Up trophies, presented at the valedictory." },
      { k: ["anonymity", "anonymous", "logo", "identity", "college name", "uniform"], a: "Teams compete under a Team Name assigned at the venue. No college name, logo, insignia or branded material may be shown from registration until results are announced." },
      { k: ["sponsor", "sponsors", "partner", "partnership"], a: "We'd love to partner with you. <a href=\"sponsors.html#partner\">Partner with TechNation →</a>" },
      { k: ["organisers", "organizers", "committee", "coordinator", "coordinators", "faculty"], a: "Faculty coordinators: Mr. Sumit Kumar (+91 98221 67259) and Mr. Ramkrishna Reddy (+91 88065 72120). Student coordinators: Ms. Shweta Sahakari and Ms. Praditi Naik. <a href=\"team.html\">Team page →</a>" },
      { k: ["certificate", "certificates", "certification"], a: "First and second prize winners receive trophies and e-certificates (or printed certificates); results are declared at the valedictory ceremony." },
      { k: ["register", "registration", "sign", "pass", "ticket", "deadline", "confirm"], a: "Register your team from this site and confirm participation at least one week before the fest. The team registration fee is ₹3,000 per team." },
      { k: ["contact", "email", "phone", "help", "support", "website", "college"], a: "Email cs.sdcc@vvm.edu.in, call +91 98221 67259, or visit the <a href=\"https://damodarcollege.edu.in\" target=\"_blank\" rel=\"noopener\">college website</a>. <a href=\"about.html#contact\">Contact section →</a>" },
      { k: ["brochure", "pdf", "rules", "general rules"], a: "The general rules are summarised in the sealed codex on the home page and in each event's Rules section." },
    ],
    fallback: "I'm not sure about that one yet. Try asking about dates, events, team size, fees or accommodation, or write to <a href=\"mailto:cs.sdcc@vvm.edu.in\">cs.sdcc@vvm.edu.in</a>.",
  },

  legal: {
    terms: [
      { h: "Acceptance", p: "By registering for or attending TechNation you agree to these terms, the General Rules in the event brochure, and any event-specific rules published on the relevant page." },
      { h: "Eligibility & teams", p: "Participation is by invitation to recognised institutions. One team of 10 to 12 bonafide undergraduate students per institution, accompanied by a Faculty Coordinator and a Student Team Leader. A deputation letter and college ID cards must be produced at registration." },
      { h: "Anonymity", p: "Teams compete under the Team Name assigned by the host. Disclosing institutional identity in any form between desk registration and the announcement of results may lead to penalties or disqualification." },
      { h: "Code of conduct", p: "All participants must follow the Standard Operating Procedures and campus regulations. Offensive language, misconduct or vulgar behaviour results in immediate disqualification of the team." },
      { h: "Payments & refunds", p: "The team registration fee is ₹3,000 per team. Travel and stay expenses are borne by the participating institution." },
      { h: "Judging", p: "Each event has specific rules that must be followed strictly. The decisions of the judges and the organising committee are final and binding; no appeals or disputes will be entertained." },
      { h: "Intellectual property", p: "You keep the rights to your work. You allow TechNation to show your project name, team name and photos from the event in its communications." },
      { h: "Changes", p: "The organising committee may modify the schedule or rules in the interest of smooth conduct. Updates are emailed to the registered Team Leader or Faculty Coordinator and published on this website." },
    ],
    privacy: [
      { h: "What we collect", p: "Your name, email, phone number, college and any details a registration form asks for." },
      { h: "How we use it", p: "To run your registration, send event updates and issue certificates." },
      { h: "Sharing", p: "Data is shared only with the organising committee and event coordinators who need it to run the events you signed up for." },
      { h: "Retention", p: "We keep registration data for as long as needed to run the festival and meet record-keeping requirements." },
      { h: "Your choices", p: "You can ask for a copy of your data or ask for it to be deleted by writing to cs.sdcc@vvm.edu.in." },
    ],
  },
};
