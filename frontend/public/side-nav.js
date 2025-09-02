// Side Navigation Component
class SideNav {
  constructor() {
    this.isExpanded = false;
    this.init();
  }

  init() {
    this.createSideNav();
    this.attachEventListeners();
  }

  createSideNav() {
    const sideNavHTML = `
      <div class="side-nav-container" id="sideNav">
        <!-- Thin neon rail - always visible -->
        <div class="neon-rail" aria-hidden="true"></div>

        <!-- Navigation panel -->
        <aside class="nav-panel" id="navPanel">
          <div class="nav-header">
            <span class="logo-text" id="logoText">&lt;Hacker UI/&gt;</span>
          </div>

          <nav class="nav-content">
            <ul class="nav-list">
              <li class="nav-item">
                <a href="#" class="nav-link active" data-page="home">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  <span class="nav-label">Home</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-page="ai-bot">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="18" height="10" x="3" y="11" rx="2"/>
                    <circle cx="12" cy="5" r="2"/>
                    <path d="M12 7v4"/>
                    <line x1="8" y1="16" x2="8" y2="16"/>
                    <line x1="16" y1="16" x2="16" y2="16"/>
                  </svg>
                  <span class="nav-label">AI Bot</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-page="graph">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                  <span class="nav-label">Graph</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link" data-page="analysis">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                  </svg>
                  <span class="nav-label">Analysis</span>
                </a>
              </li>
                             <li class="nav-item">
                 <a href="#" class="nav-link" data-page="generated">
                   <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                   </svg>
                   <span class="nav-label">Generated</span>
                 </a>
               </li>
               <li class="nav-item">
                 <a href="#" class="nav-link" data-page="docs">
                   <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                     <polyline points="14,2 14,8 20,8"/>
                     <line x1="16" y1="13" x2="8" y2="13"/>
                     <line x1="16" y1="17" x2="8" y2="17"/>
                     <polyline points="10,9 9,9 8,9"/>
                   </svg>
                   <span class="nav-label">Docs</span>
                 </a>
               </li>
               <li class="nav-item">
                 <a href="#" class="nav-link" data-page="resources">
                   <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                     <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                     <line x1="12" y1="22.08" x2="12" y2="12"/>
                   </svg>
                   <span class="nav-label">Resources</span>
                 </a>
               </li>
               <li class="nav-item">
                 <a href="#" class="nav-link" data-page="community">
                   <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                     <circle cx="9" cy="7" r="4"/>
                     <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                     <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                   </svg>
                   <span class="nav-label">Community</span>
                 </a>
               </li>
            </ul>
            
            <div class="nav-divider"></div>
            
            <ul class="nav-list">
              <li class="nav-item">
                <button class="nav-link logout-btn" id="logoutBtn">
                  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span class="nav-label">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      </div>
    `;

    // Insert the side nav at the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', sideNavHTML);
  }

  attachEventListeners() {
    const sideNav = document.getElementById('sideNav');
    const navPanel = document.getElementById('navPanel');
    const logoText = document.getElementById('logoText');
    const navLabels = document.querySelectorAll('.nav-label');
    const logoutBtn = document.getElementById('logoutBtn');

    // Hover events for expansion
    sideNav.addEventListener('mouseenter', () => {
      this.expandNav();
    });

    sideNav.addEventListener('mouseleave', () => {
      this.collapseNav();
    });

    // Navigation link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) {
          this.navigateToPage(page);
        }
      });
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
      console.log('Logout clicked');
      // Add logout functionality here
    });
  }

  expandNav() {
    const navPanel = document.getElementById('navPanel');
    const logoText = document.getElementById('logoText');
    const navLabels = document.querySelectorAll('.nav-label');

    navPanel.classList.add('expanded');
    logoText.style.opacity = '1';
    logoText.style.transform = 'translateX(0)';

    navLabels.forEach(label => {
      label.style.opacity = '1';
      label.style.transform = 'translateX(0)';
    });
  }

  collapseNav() {
    const navPanel = document.getElementById('navPanel');
    const logoText = document.getElementById('logoText');
    const navLabels = document.querySelectorAll('.nav-label');

    navPanel.classList.remove('expanded');
    logoText.style.opacity = '0';
    logoText.style.transform = 'translateX(-4px)';

    navLabels.forEach(label => {
      label.style.opacity = '0';
      label.style.transform = 'translateX(-4px)';
    });
  }

  navigateToPage(page) {
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to clicked link
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

         // Handle page navigation
     switch (page) {
       case 'home':
         this.showHomePage();
         break;
       case 'ai-bot':
         this.showAIBotPage();
         break;
       case 'graph':
         this.showGraphPage();
         break;
       case 'analysis':
         this.showAnalysisPage();
         break;
       case 'generated':
         this.showGeneratedPage();
         break;
       case 'docs':
         this.showDocsPage();
         break;
       case 'resources':
         this.showResourcesPage();
         break;
       case 'community':
         this.showCommunityPage();
         break;
     }
  }

  showHomePage() {
    // Show the main repository analyzer page
    document.querySelector('.main-layout').style.display = 'flex';
    document.querySelector('.progress-header-bar').style.display = 'flex';
  }

  showAIBotPage() {
    // Show only the AI chat section
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create a dedicated AI bot page here
  }

  showGraphPage() {
    // Show graph visualization page
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create a graph page here
  }

  showAnalysisPage() {
    // Show analysis results page
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create an analysis page here
  }

  showGeneratedPage() {
    // Show generated files page
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create a generated files page here
  }

  showDocsPage() {
    // Show documentation page
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create a documentation page here
    console.log('Docs page - Coming soon!');
  }

  showResourcesPage() {
    // Show resources page
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create a resources page here
    console.log('Resources page - Coming soon!');
  }

  showCommunityPage() {
    // Show community page
    document.querySelector('.main-layout').style.display = 'none';
    document.querySelector('.progress-header-bar').style.display = 'none';
    // You can create a community page here
    console.log('Community page - Coming soon!');
  }
}

// Initialize side navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.sideNav = new SideNav();
});
