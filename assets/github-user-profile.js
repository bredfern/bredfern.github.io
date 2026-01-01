class GithubUserProfile extends HTMLElement {
    static get observedAttributes() {
        return ['username'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.username = 'bredfern'; // Default user
    }

    connectedCallback() {
        this.render();
        this.fetchData(); // New single entry point for both fetches
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'username' && oldValue !== newValue) {
            this.username = newValue;
            this.render(); 
            this.fetchData();
        }
    }

    // New function to handle both API calls
    async fetchData() {
        const container = this.shadowRoot.querySelector('.profile-container');
        container.innerHTML = '<p>Loading profile and projects for <strong>' + this.username + '</strong>...</p>';
        container.classList.remove('error');

        try {
            // 1. Fetch User Profile Data
            const userResponse = await fetch(`https://api.github.com/users/${this.username}`);
            
            if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    throw new Error(`GitHub user "${this.username}" not found.`);
                }
                throw new Error(`HTTP error! Status: ${userResponse.status} fetching user data.`);
            }

            const userData = await userResponse.json();

            // 2. Fetch User Repositories (Projects)
            const reposResponse = await fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=10`); // Get 10 most recently updated repos
            
            if (!reposResponse.ok) {
                throw new Error(`HTTP error! Status: ${reposResponse.status} fetching repository data.`);
            }

            const reposData = await reposResponse.json();

            // 3. Display both
            this.displayProfile(userData, reposData);

        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            container.classList.add('error');
            container.innerHTML = `<p><strong>Error:</strong> ${error.message}</p>`;
        }
    }

    // Updated function to accept and display repositories
    displayProfile(user, repos) {
        const container = this.shadowRoot.querySelector('.profile-container');
        
        // Helper functions
        const safeText = (text) => text || 'N/A';
        const safeLink = (link) => link ? `<a href="${link}" target="_blank">${link.replace('https://', '')}</a>` : 'N/A';
        
        // Generate the HTML for the list of repositories
        const reposListHtml = repos.length > 0
            ? repos.map(repo => `
                <li class="repo-item">
                    <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
                    <p class="repo-description">${safeText(repo.description)}</p>
                    <div class="repo-meta">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                        <span class="language">${safeText(repo.language)}</span>
                    </div>
                </li>
            `).join('')
            : '<p>No public repositories found.</p>';

        // Template for the full display (Profile + Repos)
        container.innerHTML = `
            <div class="profile-section">
                <div class="profile-header">
                    <img src="${user.avatar_url}" alt="${safeText(user.login)}'s avatar" class="avatar">
                    <div>
                        <h2>${safeText(user.name)}</h2>
                        <p class="login-name">@${safeText(user.login)}</p>
                    </div>
                </div>
                
                <p class="bio">${safeText(user.bio)}</p>

                <div class="stats">
                    <div class="stat-item">
                        <strong>Repos</strong>
                        <span>${safeText(user.public_repos)}</span>
                    </div>
                    <div class="stat-item">
                        <strong>Followers</strong>
                        <span>${safeText(user.followers)}</span>
                    </div>
                    <div class="stat-item">
                        <strong>Following</strong>
                        <span>${safeText(user.following)}</span>
                    </div>
                </div>

                <div class="details">
                    <p><strong>Location:</strong> ${safeText(user.location)}</p>
                    <p><strong>Company:</strong> ${safeText(user.company)}</p>
                    <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <a href="${user.html_url}" target="_blank" class="github-link">View full profile on GitHub</a>
            </div>

            <h3 class="repos-heading">Public Projects (${repos.length} / ${safeText(user.public_repos)})</h3>
            <ul class="repos-list">
                ${reposListHtml}
            </ul>
        `;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                    padding: 20px;
                    max-width: 640px; /* Increased max-width for repos */
                    margin: 20px auto;
                    margin-top: 0;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
                    background-color: lightgray;
                    border-radius: 8px;
                }
                .profile-container {
                    color: #000;
                }
                .profile-container.error {
                    color: #cb2431;
                    border-left: 5px solid #cb2431;
                    padding-left: 15px;
                }
                /* PROFILE STYLES (Kept from before) */
                .profile-header { display: flex; align-items: center; margin-bottom: 15px; }
                .avatar { width: 70px; height: 70px; border-radius: 50%; margin-right: 15px; border: 2px solid #dedfddff }
                h2 { margin: 0; font-size: 1.5em; color: #000; }
                .login-name { margin: 0; color: #000; font-size: 0.9em; }
                .bio { font-style: italic; margin: 10px 0; padding-bottom: 15px; border-bottom: 1px solid #e1e4dfff }
                .stats { background-color: #dfe2dcff; display: flex; justify-content: space-around; margin: 15px 0; padding: 10px 0; border-top: 1px solid #eaebeaff border-bottom: 1px solid #e3e4e3ff; }
                .stat-item { text-align: center; }
                .stat-item strong { display: block; font-size: 1.1em; color: #000; }
                .stat-item span { color: ##b9e192; font-size: 0.8em; }
                .details p { margin: 5px 0; font-size: 0.9em; }
                .github-link { display: block; text-align: center; margin-top: 15px; padding: 8px 15px; background-color: #fff; color: #000; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 0.9em; transition: background-color 0.2s; }
                .github-link:hover { background-color: #000000ff; }
                
                /* REPOSITORY STYLES (New) */
                .repos-heading {
                    font-size: 1.2em;
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 1px solid #000;
                    color: #000;
                }
                .repos-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .repo-item {
                    border: 1px solid #e0e2ddff
                    border-radius: 6px;
                    padding: 10px;
                    color: #000;
                    margin-bottom: 10px;
                    background-color: #dddfdcff;
                    transition: box-shadow 0.2s;
                }
                .repo-item:hover {
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
                }
                .repo-name {
                    font-weight: 600;
                    color: #000;
                    text-decoration: none;
                    font-size: 1.1em;
                }
                .repo-description {
                    font-size: 0.9em;
                    color: #000;
                    margin: 5px 0;
                }
                .repo-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 0.8em;
                    color: #000;
                    margin-top: 8px;
                }
                .repo-meta span {
                    display: flex;
                    align-items: center;
                }
                .repo-meta .language {
                    font-weight: 500;
                    color: #000;
                }
            </style>
            <div class="profile-container">
            </div>
        `;
    }
}

customElements.define('github-user-profile', GithubUserProfile);
