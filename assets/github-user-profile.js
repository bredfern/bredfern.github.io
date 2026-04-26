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
            // 1. Fetch User Profile Data dynamically
            //const userResponse = await fetch(`https://api.github.com/users/${this.username}`);

            // Fetch staic user data
            const userResponse = await fetch('bredfern.json');

            /* if (!userResponse.ok) {
                if (userResponse.status === 404) {
                    throw new Error(`GitHub user "${this.username}" not found.`);
                }
                throw new Error(`HTTP error! Status: ${userResponse.status} fetching user data.`);
            }*/

            const userData = await userResponse.json();

            // 2. Fetch User Repositories (Projects) dynamically
            // const reposResponse = await fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=4`);
            
            // Fetch static repo data
            const reposResponse = await fetch('bredfern-detail.json');

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
                    font-family: Verdana";
                    padding: 2.5rem;
                    max-width: 80rem;
                    box-shadow: 0 0.2rem  rgba(0, 0, 0, 0.05);
                    background-color: #cececece;
                    border-radius: 0.25rem;
                    border: solid 0.1rem #cecece;
                }
                .profile-container {
                    color: #000000;
		    padding: 1rem;
                }
                .profile-container.error {
                    color: #cb2431;
                    border-left: 0.3rem solid #cb2431;
                    padding-left: 1rem;
                }
                /* PROFILE STYLES (Kept from before) */
                .profile-header { display: flex; align-items: center; margin-bottom: 0.5rem; }
                .avatar { width: 4rem; height: 4rem; border-radius: 50%; margin-right: 0.5rem; border: 0.1rem solid #cecece }
                h2 {
                    margin: 0;
                    font-size: 1.5em;
                    color: #000000;
                }
                .login-name {
                    margin: 0;
                    color: #000000;
                    font-size: 0.9em;
                }
                .bio { font-style: italic; margin: 10px 0; padding-bottom: 15px; border-bottom: 1px solid #cecece }
                .stats {
                    background-color: #fff;
                    display: flex;
                    justify-content: space-around;
                    margin: 1rem 0;
                    padding: 1rem 0;
                }
                .stat-item { 
                  text-align: center; 
                }
                .stat-item strong { 
                  display: block; 
                  font-size: 1.1em; 
                  color: #00000; 
                }
                .stat-item span { 
                  font-size: 0.8em; 
                }
                .details p { 
                  margin: 0.25rem 0; 
                  font-size: 0.9em; 
                }
                .github-link { 
                  display: block; 
                  text-align: center; 
                  margin-top: 0.5rem; 
                  padding: 0.25rem 0.5rem; 
                  background-color: #ffffff; 
                  color: #000000; 
                  text-decoration: none; 
                  border-radius: 0.25rem; 
                  font-weight: 500; 
                  font-size: 0.9em; 
                  transition: 
                  background-color 0.2s; 
                }
                .github-link:hover { background-color: #cecece; }
                /* REPOSITORY STYLES (New) */
                .repos-heading {
                    font-size: 1.2em;
                    margin-top: 0.5rem;
                    padding-top: 0.25rem;
                    border-top: 0.1rem solid #cecece;
                    color: #000;
                }
                .repos-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .repo-item {
                    border: 0.1rem solid #e0e2ddff
                    border-radius: 0.25rem;
                    padding: 0.25rem;
                    color: #000000;
                    margin-bottom: 0.25rem;
                    background-color: #ffffff;
                    transition: box-shadow 0.2s;
                }
                .repo-item:hover {
                    box-shadow: 0 0.1rem 0.5rem rgba(0, 0, 0, 0.1);
                }
                .repo-name {
                    font-weight: 600;
                    color: #000000;
                    text-decoration: none;
                    font-size: 1.1em;
                }
                .repo-description {
                    font-size: 0.9em;
                    color: #000000;
                    margin: 0.25rem 0;
                }
                .repo-meta {
                    display: flex;
                    gap: 0.25rem;
                    font-size: 0.8em;
                    color: #000000;
                    margin-top: 0.25rem;
                }
                .repo-meta span {
                    display: flex;
                    align-items: center;
                }
                .repo-meta .language {
                    font-weight: 500;
                    color: #000000;
                }
            </style>
            <div class="profile-container">
            </div>
        `;
    }
}

customElements.define('github-user-profile', GithubUserProfile);
