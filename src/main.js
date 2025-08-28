import './style.css'
import { createHomePage } from './pages/index.js'
import { createAboutPage } from './pages/about.js'
import { createBlogPage } from './pages/blog.js'

// Simple router for the portfolio site
class PortfolioRouter {
  constructor() {
    this.routes = {
      '': createHomePage,
      '#': createHomePage,
      '#about': createAboutPage,
      '#blog': createBlogPage
    };
    
    this.currentPage = '';
    this.init();
  }

  init() {
    // Handle initial page load
    this.handleRoute();
    
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const href = e.target.getAttribute('href');
        this.navigateTo(href);
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash || '#';
    const pageFunction = this.routes[hash];
    
    if (pageFunction && this.currentPage !== hash) {
      this.currentPage = hash;
      document.querySelector('#app').innerHTML = pageFunction();
      this.setupPageSpecificScripts();
    }
  }

  setupPageSpecificScripts() {
    // Setup contact form if on about page
    if (this.currentPage === '#about') {
      this.setupContactForm();
    }
    
    // Setup blog posts if on home page
    if (this.currentPage === '' || this.currentPage === '#') {
      this.loadBlogPosts();
    }
  }

  setupContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactForm(form);
      });
    }
  }

  async handleContactForm(form) {
    const formData = new FormData(form);
    const statusDiv = document.getElementById('form-status');
    
    // Show loading state
    statusDiv.innerHTML = '<p style="color: #ffa500;">Sending message...</p>';
    
    try {
      // Here you would typically send the data to your server
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      statusDiv.innerHTML = '<p style="color: #4caf50;">Message sent successfully!</p>';
      form.reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        statusDiv.innerHTML = '';
      }, 3000);
      
    } catch (error) {
      statusDiv.innerHTML = '<p style="color: #f44336;">Error sending message. Please try again.</p>';
    }
  }

  loadBlogPosts() {
    const blogPostsDiv = document.getElementById('blog-posts');
    if (blogPostsDiv) {
      // Sample blog posts - you can replace this with real data
      const posts = [
        {
          title: 'Getting Started with Systems Administration',
          excerpt: 'My journey into the world of IT infrastructure and system management...',
          date: 'January 2025'
        },
        {
          title: 'Building a Homelab on a Budget',
          excerpt: 'How I set up my personal development and testing environment...',
          date: 'December 2024'
        }
      ];

      blogPostsDiv.innerHTML = posts.map(post => `
        <div class="blog-post">
          <h5><a href="#blog">${post.title}</a></h5>
          <p>${post.excerpt}</p>
          <small>${post.date}</small>
        </div>
      `).join('');
    }
  }
}

// Initialize the portfolio site
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioRouter();
});
