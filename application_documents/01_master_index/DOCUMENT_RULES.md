=== DOCUMENT GOVERNANCE RULES ===

You must strictly follow the document management rules below when generating, updating, or referencing any documentation.

---------------------------------------------------------------------
1. ROOT FOLDER (MANDATORY)
---------------------------------------------------------------------

All documents must be stored inside:

application_documents/

No document may exist outside this root directory.

---------------------------------------------------------------------
2. FIXED FOLDER STRUCTURE (NO EXCEPTIONS)
---------------------------------------------------------------------

Inside application_documents/, use the following structure:

01_master_index/
02_planning/
03_design/
04_setup_and_deployment/
05_operations/
06_features/
07_prompt_logs/
08_other/

Rules:
- Never create new top-level folders.
- Never rename existing folders.
- All documentation must fit into one of these folders.
- Files are versioned via git, not via filename convention.

---------------------------------------------------------------------
3. FOLDER PURPOSE DEFINITIONS
---------------------------------------------------------------------

01_master_index/
Purpose:
Central navigation and documentation control hub.

Contains:
- DOCUMENT_MAP.md
- Documentation registry
- Recommended reading order
- Cross-reference index
- Documentation structure overview

Answers:
"Where is everything and how should documentation be read?"

--------------------------------------------------

02_planning/
Purpose:
Project management, requirements gathering, and strategic roadmaps. 

Contains:
- Project proposals
- Sprint planning and milestones
- Product Requirement Documents (PRDs)
- Task breakdowns
- Timelines and resource allocation

Answers:
"What are we building, why, and when will it be done?"

--------------------------------------------------

03_design/
Purpose:
Comprehensive system design, UI/UX, structural blueprints, and technical decisions.

Contains:
- System overview and architecture diagrams
- UI/UX mockups and design systems
- Infrastructure design
- Service interaction flows
- Data flow diagrams and database schemas
- Architecture Decision Records (ADR)
- Technical specifications (SPEC)

Answers:
"How is the system structurally and visually designed, and why?"

--------------------------------------------------

04_setup_and_deployment/
Purpose:
Environment preparation, system installation, and deployment processes. Merged folder combining setup and deployment for cohesive context.

Contains:
- Local development setup
- Dependency installation
- Database installation
- Environment variable configuration
- Production deployment procedures
- CI/CD configuration
- Docker / Kubernetes setup
- Rollback procedures

Answers:
"How do I install the system and deploy it?"

--------------------------------------------------

05_operations/
Purpose:
Post-deployment system management and maintenance.

Contains:
- Monitoring setup
- Logging configuration
- Backup procedures
- Incident response guide
- Performance optimization
- Troubleshooting documentation

Answers:
"How do we operate and maintain the system?"

--------------------------------------------------

06_features/
Purpose:
Feature-level functional documentation.

Contains:
- Feature descriptions
- Business logic explanation
- API behavior
- UI/UX behavior notes
- Acceptance criteria
- Feature constraints
- Feature change notes

Answers:
"What does this feature do and how does it behave?"

--------------------------------------------------

07_prompt_logs/ (MANDATORY)
Purpose:
AI interaction tracking and traceability.

For every user prompt, create a log file after completing the task.

Format:
YYYY-MM-DD_prompt_[number]_[short_title].md

Each log must include:
- Original prompt
- Short AI output summary
- List of affected documents
- Version updates (if any)

Ensures:
- Full traceability
- Audit capability
- Change transparency

--------------------------------------------------

08_other/
Purpose:
Controlled miscellaneous documentation storage.

Use only when a document does not clearly belong elsewhere.

Examples:
- Experimental drafts
- AI reasoning notes
- Brainstorm documents
- Temporary documentation
- Cross-topic research notes

Rules:
- Must still follow naming conventions.
- Must still follow versioning rules.
- Must still follow numbering rules.
- Must not become a dumping folder.

---------------------------------------------------------------------
4. FILE NAMING CONVENTION (MANDATORY)
---------------------------------------------------------------------

Format:

[TYPE]_[3-digit-order]_[short_description].md

Examples:

PLAN_001_q3_roadmap.md
DSGN_002_system_overview.md
SETUP_003_database_installation.md
DEPLOY_004_production_nginx_config.md

Rules:
- Use underscores only.
- Use lowercase for descriptions.
- Keep descriptions short but clear.
- NO version numbers in filenames (versioning is handled by git).

---------------------------------------------------------------------
5. TYPE PREFIX RULES
---------------------------------------------------------------------

PLAN   → Planning & requirement documents
DSGN   → Design & Architecture documents
SETUP  → Installation & environment setup
DEPLOY → Deployment guides
OPS    → Operations & maintenance
FEAT   → Feature documentation
SPEC   → Technical specifications
ADR    → Architecture Decision Records
LOG    → Internal structured logs
MISC   → Miscellaneous (must be stored in 08_other/)

---------------------------------------------------------------------
6. VERSIONING RULES (GIT-BASED)
---------------------------------------------------------------------

- Versioning is handled by git, not by filename.
- Never include version numbers in filenames.

---------------------------------------------------------------------
7. ORDER NUMBER RULES
---------------------------------------------------------------------

- Use 3-digit numbering (001, 002, 003...)
- Maintain sequential order.
- Never reuse numbers within the same folder.
- If unsure of the next number, ask before generating.

---------------------------------------------------------------------
8. PROMPT LOG RULE (MANDATORY)
---------------------------------------------------------------------

After every completed task:

1. Create a prompt log file in:
   07_prompt_logs/

2. Include:
   - Original user prompt
   - Summary of generated output
   - Documents created or updated
   - Version updates
   - Architectural/Design impact (if any)

No exceptions.

---------------------------------------------------------------------
9. MASTER INDEX UPDATE RULE
---------------------------------------------------------------------

If a new core document is created:

You must:
- Update 01_master_index/DOCUMENT_MAP.md
- Add the document to the registry
- Add to recommended reading order if relevant
- Add cross-references if applicable

Documentation must always remain navigable.

---------------------------------------------------------------------
10. CONSISTENCY CHECK (PRE-GENERATION VALIDATION)
---------------------------------------------------------------------

Before generating any document:

- Check existing naming patterns
- Avoid duplication
- Validate correct folder classification
- Confirm next order number
- Respect versioning logic
- Ensure correct TYPE prefix

If any rule conflicts with user instruction:
Stop and ask for clarification before proceeding.

---------------------------------------------------------------------
11. AI CODING GUIDELINES
---------------------------------------------------------------------

When AI is generating or updating code-related documents:

A. CODE DOCUMENTATION
- Include actual code examples only when explaining specific behavior
- Link to source files using file_path:line_number format
- Keep code examples minimal and focused on the point
- Use code blocks with language highlighting

B. API DOCUMENTATION
- Document request/response structures with examples
- Include error codes and their meanings
- Specify required vs optional parameters
- Include example curl commands or equivalent

C. DATABASE DOCUMENTATION
- Include table schemas with all columns, types, constraints
- Document relationships and foreign keys
- Include indexes and their purpose
- Note any row-level security (RLS) policies

D. FEATURE DOCUMENTATION
- Start with "What" before "How"
- Include user workflows with steps
- Document business logic and constraints
- Add acceptance criteria when applicable
- Note any known limitations

E. DESIGN & ARCHITECTURE DOCUMENTATION
- Include diagrams where helpful (ASCII art acceptable)
- Explain design decisions and tradeoffs
- Document UI/UX logic alongside service boundaries and interactions
- Note scalability and visual consistency considerations

F. PROMPT LOG GUIDELINES
- Log the exact user prompt (for reproducibility)
- Summarize what was created/changed
- List all affected files with changes
- Note any design or architectural decisions made
- Include timestamp and context

G. GENERAL DOCUMENT QUALITY
- Write in clear, active voice
- Use consistent terminology
- Keep sections focused and scannable
- Update cross-references when documents change
- Maintain neutral, professional tone

H. WHEN UPDATING DOCUMENTS
- Make clear, focused changes
- Update DOCUMENT_MAP.md if structure changes
- Create appropriate prompt log entry
- Commit to git with descriptive message
- Update cross-references in related docs

---------------------------------------------------------------------
12. NON-NEGOTIABLE PRINCIPLES
---------------------------------------------------------------------

- No undocumented files
- No silent overwrites
- No structural deviations
- No undocumented architectural or design decisions
- No folder misuse
- Maintain clear documentation hierarchy

=== END OF DOCUMENT GOVERNANCE RULES ===