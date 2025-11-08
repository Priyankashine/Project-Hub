/**
 * script.js - Core Frontend Interactivity Logic
 * Simulates Backend functions using Mock Data.
 */

// --- 1. MOCK DATA SIMULATION ---
const MOCK_USERS = [
    { id: 101, username: 'jsmith24', email: 'john.s@college.edu', password: 'password123', role: 'student', skills: ['React', 'Python'] },
    { id: 201, username: 'drchen', email: 'd.chen@college.edu', password: 'faculty456', role: 'faculty', skills: ['TensorFlow', 'NLP'] }
];

const MOCK_PROJECTS = [
    {
        id: 1, title: 'Decentralized File Storage', ownerId: 101, owner: 'Alex B. (Student)', ownerUsername: 'alexb',
        description: 'A secure, blockchain-based file storage solution for campus documents, aimed at reducing reliance on central servers.',
        techStack: 'Solidity, React, IPFS', status: 'Beta V1', feedbackCount: 14,
        isSuggested: true, isOwned: false,
    },
    {
        id: 2, title: 'AI Campus Chatbot', ownerId: 201, owner: 'Dr. Chen (Faculty)', ownerUsername: 'drchen',
        description: 'A Natural Language Processing model trained on the college\'s syllabus and FAQ documents to instantly answer student queries.',
        techStack: 'Python, TensorFlow, Azure Bot Services', status: 'V2 Development', feedbackCount: 1,
        isSuggested: true, isOwned: true,
    },
    {
        id: 3, title: 'Blockchain Voting System', ownerId: 101, owner: 'Alex B. (Student)', ownerUsername: 'alexb',
        description: 'A secure and transparent voting system for campus elections using blockchain technology.',
        techStack: 'Solidity, Web3.js', status: 'Seeking Collaborators', feedbackCount: 5,
        isSuggested: false, isOwned: true, // Example of user-owned project not on the main feed
    }
];

// Key for storing current user session
const USER_SESSION_KEY = 'currentUser';

// --- 2. AUTHENTICATION & SESSION MANAGEMENT ---

/** Checks if a user is logged in and returns their session object. */
const getSession = () => {
    try {
        const session = localStorage.getItem(USER_SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch (e) {
        console.error("Error retrieving session:", e);
        return null;
    }
};

/** Handles the login form submission. */
const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    const user = MOCK_USERS.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === role
    );

    if (user) {
        // Successful Mock Login: Store session and redirect
        const sessionData = { 
            id: user.id, 
            username: user.username, 
            role: user.role 
        };
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionData));
        window.location.href = 'feed.html'; // Redirect to the main feed
    } else {
        alert('Login failed. Check email, password, and role.');
    }
};

/** Handles user logout. */
const handleLogout = () => {
    localStorage.removeItem(USER_SESSION_KEY);
    window.location.href = 'login.html'; // Redirect to login page
};

/** Initializes the header based on login status. */
const initHeader = () => {
    const session = getSession();
    const nav = document.querySelector('header nav ul');
    if (!nav) return;

    // Remove the old login/logout link
    const oldLoginLink = nav.querySelector('li:last-child a');
    if (oldLoginLink && (oldLoginLink.textContent.includes('Log In') || oldLoginLink.textContent.includes('Log Out'))) {
        oldLoginLink.parentElement.remove();
    }

    const listItem = document.createElement('li');
    const link = document.createElement('a');

    if (session) {
        // User is logged in: Show Logout
        link.href = '#';
        link.textContent = `Log Out (${session.username})`;
        link.onclick = handleLogout;
        // Also ensure My Projects link is visible and correct
        const myProjectsLink = nav.querySelector('a[href="my_projects.html"]');
        if (myProjectsLink) myProjectsLink.textContent = 'My Projects';
    } else {
        // User is logged out: Show Login
        link.href = 'login.html';
        link.textContent = 'Log In';
    }

    listItem.appendChild(link);
    nav.appendChild(listItem);
};


// --- 3. PROJECT FEED RENDERING (feed.html) ---

/** Creates the HTML string for a single project feed card. */
const createFeedCardHTML = (project, session) => {
    const isFaculty = session && session.role === 'faculty';
    const isOwner = session && session.id === project.ownerId;
    
    return `
        <article class="feed-card" data-project-id="${project.id}">
            <div class="card-header">
                <h3>${project.title}</h3>
                <p>Posted by: **${project.owner}**</p>
            </div>
            
            <div class="project-summary">
                <p class="description">${project.description}</p>
                <p class="details-tags">**Tech Stack:** ${project.techStack} | **Status:** ${project.status}</p>
            </div>

            <div class="project-action-area">
                <div class="project-preview">
                    <p>Code Snapshot / Demo Video Placeholder</p>
                </div>
                <button class="primary-btn">▶️ Open & Run Project Demo</button>
                ${(isFaculty || isOwner) ? `<a href="#" class="github-link">View Source Code (${isFaculty ? 'Faculty' : 'Owner'} Access)</a>` : ''}
            </div>

            <div class="feedback-area">
                <textarea placeholder="Share your feedback, bug reports, or suggestions here..."></textarea>
                <button class="small-btn submit-feedback-btn" data-project-id="${project.id}">Submit Feedback</button>
                <p class="feedback-count">${project.feedbackCount} pieces of feedback received.</p>
            </div>
        </article>
    `;
};

/** Populates the feed page with suggested projects. */
const renderProjectFeed = () => {
    const feedContainer = document.getElementById('project-feed');
    if (!feedContainer) return;
    
    const session = getSession();
    if (!session) {
         // Optionally redirect if feed page accessed without login
         // window.location.href = 'login.html';
         // return;
    }

    const suggestedProjects = MOCK_PROJECTS.filter(p => p.isSuggested);
    
    feedContainer.innerHTML = '<h2>Suggested Projects for You</h2>' + 
        suggestedProjects.map(p => createFeedCardHTML(p, session)).join('');

    // Attach event listeners for feedback buttons (future development)
    document.querySelectorAll('.submit-feedback-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            alert(`Feedback submitted for Project ID: ${e.target.dataset.projectId}. (This would be sent to the backend)`);
            // Actual code would send the textarea content to the backend.
        });
    });
};

// --- 4. MY PROJECTS RENDERING (my_projects.html) ---

/** Populates the my_projects page with owned and collaborated projects. */
const renderMyProjects = () => {
    const ownedContainer = document.getElementById('owned-projects');
    if (!ownedContainer) return;
    
    const session = getSession();
    if (!session) {
         window.location.href = 'login.html';
         return;
    }

    const ownedProjects = MOCK_PROJECTS.filter(p => p.ownerId === session.id);
    
    ownedContainer.innerHTML = `<h3>Projects You Are Leading (${ownedProjects.length})</h3>`;
    
    ownedProjects.forEach(project => {
        // Simple HTML structure for demonstration
        const card = document.createElement('article');
        card.className = 'project-management-card';
        card.innerHTML = `
            <div class="card-details">
                <h4>${project.title}</h4>
                <p>Status: **${project.status}** | Created: 2 months ago</p>
                <p class="tech-stack">**Tech Stack:** ${project.techStack}</p>
            </div>
            <div class="card-actions">
                <button class="small-btn edit-btn">Edit Details</button>
                <button class="small-btn invite-btn" data-project-id="${project.id}">Invite Collaborators</button>
                <button class="small-btn faculty-access-btn">View Code Access Link</button>
            </div>
            <div class="invite-section">
                </div>
            <div class="team-status-section">
                <h5>Team Requests (0 Pending)</h5>
            </div>
        `;
        ownedContainer.appendChild(card);
    });

    // Attach event listeners for collaboration invites (future development)
    document.querySelectorAll('.invite-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            alert(`Opening invite modal for Project ID: ${e.target.dataset.projectId}. (This is where you invite people)`);
            // Actual code would display the invite form/modal.
        });
    });
    
    // Add logic for rendering projects collaborated on here
};


// --- GLOBAL INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Header/Nav across all pages
    initHeader();

    // 2. Attach login handler on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 3. Render feed on the feed page
    if (document.getElementById('project-feed')) {
        renderProjectFeed();
    }
    
    // 4. Render user projects on the my_projects page
    if (document.getElementById('owned-projects')) {
        renderMyProjects();
    }
    
    // NOTE: Registration form logic (register.html) is omitted for brevity,
    // but would involve saving a new user object to MOCK_USERS and redirecting to login.
});