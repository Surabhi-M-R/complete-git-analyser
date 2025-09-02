// Footer Component - Vanilla JavaScript
class Footer {
    constructor() {
        this.socials = [
            { name: "LinkedIn", href: "#", icon: "fab fa-linkedin-in" },
            { name: "YouTube", href: "#", icon: "fab fa-youtube" },
            { name: "Facebook", href: "#", icon: "fab fa-facebook-f" },
            { name: "Twitter", href: "#", icon: "fab fa-twitter" },
            { name: "Instagram", href: "#", icon: "fab fa-instagram" }
        ];
        
        this.currentYear = new Date().getFullYear();
    }

    createFooter() {
        const footer = document.createElement('footer');
        footer.setAttribute('role', 'contentinfo');
        footer.className = 'footer';
        
        footer.innerHTML = `
            <div class="footer-container">
                <!-- Top links -->
                <nav class="footer-nav" aria-label="Footer navigation">
                    <ul>
                        <li><a href="#" class="footer-link" data-page="blog">Blog</a></li>
                        <li><a href="#" class="footer-link" data-page="team">Our Team</a></li>
                        <li><a href="#" class="footer-link" data-page="about">About</a></li>
                        <li><a href="#" class="footer-link" data-page="testimonials">Testimonials</a></li>
                        <li><a href="#" class="footer-link" data-page="contact">Contact</a></li>
                    </ul>
                </nav>

                <!-- Social icons with labels -->
                <div class="footer-socials">
                    ${this.socials.map(social => `
                        <div class="social-item">
                            <a href="${social.href}" class="social-link" aria-label="${social.name}">
                                <i class="${social.icon} social-icon" aria-hidden="true"></i>
                            </a>
                            <span class="social-label">${social.name}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- Headline and subtext -->
                <div class="footer-headline">
                    <h3>We're based in Cyberspace.</h3>
                    <p>We work with teams worldwide. Get in touch with us!</p>
                </div>

                <!-- Contact row -->
                <div class="footer-contact">
                    <div class="contact-item">
                        <i class="fas fa-envelope contact-icon email" aria-hidden="true"></i>
                        <a href="mailto:hello@example.com" class="contact-link">hello@example.com</a>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone contact-icon phone" aria-hidden="true"></i>
                        <span class="contact-text">(555) 123-4567</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt contact-icon location" aria-hidden="true"></i>
                        <span class="contact-text">123 Matrix Lane, Cyberspace, 00000</span>
                    </div>
                </div>

                <!-- Legal -->
                <div class="footer-legal">
                    <p>© ${this.currentYear} Repository Analyzer Pro. All rights reserved.</p>
                </div>
            </div>
        `;

        return footer;
    }

    attachEventListeners() {
        // Handle footer navigation links
        const footerLinks = document.querySelectorAll('.footer-link');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.handleFooterNavigation(page);
            });
        });

        // Handle social media links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const socialName = e.target.closest('.social-item').querySelector('.social-label').textContent;
                this.handleSocialClick(socialName);
            });
        });
    }

    handleFooterNavigation(page) {
        console.log(`Footer navigation clicked: ${page}`);
        
        switch(page) {
            case 'blog':
                this.showBlogPage();
                break;
            case 'team':
                this.showTeamPage();
                break;
            case 'about':
                this.showAboutPage();
                break;
            case 'testimonials':
                this.showTestimonialsPage();
                break;
            case 'contact':
                this.showContactPage();
                break;
            default:
                console.log(`Unknown page: ${page}`);
        }
    }

    handleSocialClick(socialName) {
        console.log(`Social media clicked: ${socialName}`);
        // You can add actual social media links here
        alert(`Opening ${socialName} page...`);
    }

    showBlogPage() {
        console.log('Showing Blog page');
        alert('Blog page - Coming soon!');
    }

    showTeamPage() {
        console.log('Showing Team page');
        alert('Our Team page - Coming soon!');
    }

    showAboutPage() {
        console.log('Showing About page');
        alert('About page - Coming soon!');
    }

    showTestimonialsPage() {
        console.log('Showing Testimonials page');
        alert('Testimonials page - Coming soon!');
    }

    showContactPage() {
        console.log('Showing Contact page');
        alert('Contact page - Coming soon!');
    }

    init() {
        const footer = this.createFooter();
        document.body.appendChild(footer);
        this.attachEventListeners();
        console.log('Footer component initialized');
    }
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const footer = new Footer();
    footer.init();
});
