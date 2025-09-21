// Classe pour gérer les projets
class ProjectManager {
    constructor() {
        this.projects = [];
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.renderFeaturedProjects();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    async loadData() {
        try {
            const response = await fetch('assets/data/projects.json');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des données');
            }
            const data = await response.json();
            this.projects = data.projects;
        } catch (error) {
            // Données de fallback si le fichier JSON n'est pas trouvé
            this.projects = [
                {
                    id: "projet-demo",
                    title: "Projet de démonstration",
                    description: "Un projet exemple pour démontrer le portfolio.",
                    technologies: ["HTML", "CSS", "JavaScript"],
                    image: null,
                    demo_url: "#",
                    github_url: "#",
                    featured: true,
                    date: "2024-01-01",
                    category: "Frontend"
                }
            ];
            console.warn('Utilisation des données de fallback');
        }
    }

    renderFeaturedProjects() {
        const container = document.getElementById('featured-projects');
        if (!container) return;

        const featuredProjects = this.projects.filter(project => project.featured);
        
        container.innerHTML = featuredProjects.map(project => 
            this.createProjectCard(project)
        ).join('');
    }

    renderAllProjects(containerId = 'all-projects') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.projects.map(project => 
            this.createProjectCard(project)
        ).join('');
    }

    createProjectCard(project) {
        const imageHtml = project.image 
            ? `<img src="${project.image}" alt="${project.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
            : `<div class="project-image"><i class="fas fa-code"></i></div>`;

        const demoLink = project.demo_url 
            ? `<a href="${project.demo_url}" target="_blank" class="project-link">
                 <i class="fas fa-external-link-alt"></i> Démo
               </a>`
            : '';

        const githubLink = project.github_url 
            ? `<a href="${project.github_url}" target="_blank" class="project-link">
                 <i class="fab fa-github"></i> Code
               </a>`
            : '';

        return `
            <div class="project-card" data-category="${project.category}">
                ${imageHtml}
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => 
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                </div>
                <div class="project-links">
                    ${demoLink}
                    ${githubLink}
                </div>
            </div>
        `;
    }

    filterProjects(category = 'all') {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Méthode pour ajouter un nouveau projet (utile pour les mises à jour)
    addProject(project) {
        this.projects.push(project);
        this.renderAllProjects();
        if (project.featured) {
            this.renderFeaturedProjects();
        }
    }

    // Méthode pour rechercher des projets
    searchProjects(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.projects.filter(project => 
            project.title.toLowerCase().includes(lowercaseQuery) ||
            project.description.toLowerCase().includes(lowercaseQuery) ||
            project.technologies.some(tech => tech.toLowerCase().includes(lowercaseQuery))
        );
    }
}

// Initialiser le gestionnaire de projets
const projectManager = new ProjectManager();

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Fonction pour créer des filtres de catégorie
function createCategoryFilters() {
    const categories = ['all', ...new Set(projectManager.projects.map(p => p.category))];
    const filtersContainer = document.getElementById('category-filters');
    
    if (filtersContainer) {
        filtersContainer.innerHTML = categories.map(category => `
            <button class="filter-btn ${category === 'all' ? 'active' : ''}" 
                    onclick="filterProjectsByCategory('${category}')">
                ${category === 'all' ? 'Tous' : category}
            </button>
        `).join('');
    }
}

function filterProjectsByCategory(category) {
    projectManager.filterProjects(category);
    
    // Mettre à jour l'état actif des boutons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Fonction de recherche
function setupSearch() {
    const searchInput = document.getElementById('project-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const results = projectManager.searchProjects(e.target.value);
            const container = document.getElementById('all-projects');
            if (container) {
                container.innerHTML = results.map(project => 
                    projectManager.createProjectCard(project)
                ).join('');
            }
        });
    }
}

// Initialisation après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que le ProjectManager soit initialisé
    setTimeout(() => {
        createCategoryFilters();
        setupSearch();
    }, 500);
});