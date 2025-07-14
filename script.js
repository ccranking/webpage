// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active state to navigation links on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Sponsor link click tracking
function trackSponsorClick(tier, value) {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'sponsor_click', {
            'event_category': 'sponsor',
            'event_label': tier,
            'value': value
        });
    }
    
    // Store click data in localStorage for persistence
    const clickData = JSON.parse(localStorage.getItem('sponsorClicks') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    if (!clickData[tier]) {
        clickData[tier] = {
            total: 0,
            daily: {}
        };
    }
    
    if (!clickData[tier].daily[today]) {
        clickData[tier].daily[today] = 0;
    }
    
    clickData[tier].daily[today]++;
    clickData[tier].total++;
    clickData.lastClick = new Date().toISOString();
    
    localStorage.setItem('sponsorClicks', JSON.stringify(clickData));
    
    // Log to console for debugging
    console.log(`Sponsor click tracked: ${tier} tier ($${value}/month)`);
    console.log('Total clicks for', tier, ':', clickData[tier].total);
}

// Function to get sponsor click statistics
function getSponsorClickStats() {
    const clickData = JSON.parse(localStorage.getItem('sponsorClicks') || '{}');
    
    if (Object.keys(clickData).length === 0) {
        console.log('No sponsor clicks recorded yet.');
        return {};
    }
    
    console.log('=== Sponsor Click Statistics ===');
    console.log('Last click:', clickData.lastClick || 'Never');
    delete clickData.lastClick;
    
    Object.keys(clickData).forEach(tier => {
        console.log(`\n${tier.toUpperCase()} Tier:`);
        console.log('  Total clicks:', clickData[tier].total);
        console.log('  Daily breakdown:');
        Object.keys(clickData[tier].daily).sort().forEach(date => {
            console.log(`    ${date}: ${clickData[tier].daily[date]} clicks`);
        });
    });
    
    return clickData;
}

// Attach tracking to sponsor buttons
document.addEventListener('DOMContentLoaded', function() {
    // Find all sponsor buttons and update onclick handlers
    const bronzeBtn = document.querySelector('.sponsor-tier.bronze a.btn');
    const silverBtn = document.querySelector('.sponsor-tier.silver a.btn');
    const goldBtn = document.querySelector('.sponsor-tier.gold a.btn');
    
    if (bronzeBtn) {
        bronzeBtn.onclick = function() {
            trackSponsorClick('bronze', 50);
            gtag('event', 'click', { 'event_category': 'sponsor', 'event_label': 'bronze', 'value': 50 });
        };
    }
    
    if (silverBtn) {
        silverBtn.onclick = function() {
            trackSponsorClick('silver', 250);
            gtag('event', 'click', { 'event_category': 'sponsor', 'event_label': 'silver', 'value': 250 });
        };
    }
    
    if (goldBtn) {
        goldBtn.onclick = function() {
            trackSponsorClick('gold', 1000);
            gtag('event', 'click', { 'event_category': 'sponsor', 'event_label': 'gold', 'value': 1000 });
        };
    }
    
    // Make stats function available globally
    window.getSponsorClickStats = getSponsorClickStats;
    
    console.log('Sponsor click tracking initialized. Use getSponsorClickStats() to view statistics.');
});